const mongoose = require('mongoose');
const VideoCall = require('../models/VideoCall');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const env = require('../config/env');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');
const {
  generateVideoUserToken,
  ensureStreamCredentials,
} = require('../services/streamVideo');

const ACTIVE_STATUS = 'active';

function getLessonWindow(lesson) {
  const date = new Date(lesson.date);

  const [startHour = 0, startMinute = 0] = lesson.startTime
    .split(':')
    .map(Number);
  const [endHour = 0, endMinute = 0] = lesson.endTime.split(':').map(Number);

  const start = new Date(date);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMinute, 0, 0);

  return { start, end };
}

function isWithinLessonWindow(lesson) {
  const { start, end } = getLessonWindow(lesson);
  const now = new Date();
  return now >= start && now <= end;
}

const getVideoCalls = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });
  const { status, courseId, lessonId } = req.query;

  if (status) {
    criteria.status = status;
  }

  if (lessonId) {
    if (!isValidObjectId(lessonId)) {
      return res.status(400).json({ message: 'Invalid lesson ID' });
    }
    criteria.lesson = lessonId;
  }

  if (courseId) {
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    criteria.course = courseId;
  }

  if (req.user.role === 'professor') {
    criteria.createdBy = req.user.id;
  } else if (req.user.role === 'student') {
    const enrollments = await Enrollment.find(
      req.applyTenantFilter({
        student: req.user.id,
        status: 'active',
        isDeleted: false,
      })
    ).select('course');

    const courseIds = enrollments.map(enrollment => enrollment.course);

    if (courseIds.length === 0) {
      return res.json([]);
    }

    criteria.course = { $in: courseIds };
  }

  const videoCalls = await VideoCall.find(criteria)
    .populate('lesson', 'title date startTime endTime')
    .populate('course', 'name')
    .populate('createdBy', 'firstName lastName email role')
    .sort({ createdAt: -1 });

  res.json(videoCalls);
});

const getVideoCallById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid video call ID' });
  }

  await assertSameTenantForDoc(VideoCall, id, req.tenantId);

  const videoCall = await VideoCall.findOne(
    req.applyTenantFilter({ _id: id, isDeleted: false })
  )
    .populate('lesson', 'title date startTime endTime')
    .populate('course', 'name professor')
    .populate('createdBy', 'firstName lastName email role');

  if (!videoCall) {
    return res.status(404).json({ message: 'Video call not found' });
  }

  res.json(videoCall);
});

const getActiveVideoCallForLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  if (!isValidObjectId(lessonId)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  const videoCall = await VideoCall.findOne(
    req.applyTenantFilter({
      lesson: lessonId,
      status: ACTIVE_STATUS,
      isDeleted: false,
    })
  )
    .populate('lesson', 'title date startTime endTime')
    .populate('course', 'name')
    .populate('createdBy', 'firstName lastName email role');

  if (!videoCall) {
    return res.status(404).json({ message: 'No active video call for lesson' });
  }

  res.json(videoCall);
});

const createVideoCall = asyncHandler(async (req, res) => {
  requireFields(req.body, ['lessonId']);
  const { lessonId, title, description, callType = 'default' } = req.body;

  if (!isValidObjectId(lessonId)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  const lesson = await Lesson.findOne(
    req.applyTenantFilter({ _id: lessonId, isDeleted: false })
  );
  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  const course = await Course.findOne(
    req.applyTenantFilter({ _id: lesson.course, isDeleted: false })
  );
  if (!course) {
    return res
      .status(404)
      .json({ message: 'Course for the lesson could not be found' });
  }

  if (
    req.user.role === 'professor' &&
    course.professor.toString() !== req.user.id
  ) {
    return res.status(403).json({
      message: 'You are not authorized to create a video call for this lesson',
    });
  }

  if (!isWithinLessonWindow(lesson)) {
    const { start, end } = getLessonWindow(lesson);
    return res.status(400).json({
      message:
        'Video call can only be created during the scheduled lesson time',
      availableFrom: start.toISOString(),
      availableUntil: end.toISOString(),
    });
  }

  const existingActiveCall = await VideoCall.findOne(
    req.applyTenantFilter({
      lesson: lesson._id,
      status: ACTIVE_STATUS,
      isDeleted: false,
    })
  );

  if (existingActiveCall) {
    return res.status(400).json({
      message: 'An active video call already exists for this lesson',
      videoCallId: existingActiveCall._id,
    });
  }

  const generatedCallId = `${lesson._id.toString()}-${Date.now()}`;
  const callCid = `${callType}:${generatedCallId}`;
  const { start, end } = getLessonWindow(lesson);

  const videoCall = await VideoCall.create({
    tenant: req.tenantId,
    lesson: lesson._id,
    course: course._id,
    callType,
    callId: generatedCallId,
    callCid,
    title:
      title || `${course.name || 'Course'} • ${lesson.title || 'Lesson Live'}`,
    description,
    status: ACTIVE_STATUS,
    lessonStartAt: start,
    lessonEndAt: end,
    startedAt: new Date(),
    createdBy: req.user.id,
    participants: [
      {
        user: req.user.id,
        role: 'host',
        joinedAt: new Date(),
      },
    ],
  });

  await videoCall.populate('lesson', 'title date startTime endTime');
  await videoCall.populate('course', 'name');
  await videoCall.populate('createdBy', 'firstName lastName email role');

  res.status(201).json(videoCall);
});

const endVideoCall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid video call ID' });
  }

  await assertSameTenantForDoc(VideoCall, id, req.tenantId);

  const videoCall = await VideoCall.findOne(
    req.applyTenantFilter({ _id: id, isDeleted: false })
  );

  if (!videoCall) {
    return res.status(404).json({ message: 'Video call not found' });
  }

  if (videoCall.status !== ACTIVE_STATUS) {
    return res.status(400).json({ message: 'Video call is not active' });
  }

  if (
    req.user.role === 'professor' &&
    videoCall.createdBy.toString() !== req.user.id
  ) {
    return res
      .status(403)
      .json({ message: 'You cannot end this video call session' });
  }

  videoCall.status = 'ended';
  videoCall.endedAt = new Date();
  videoCall.updatedBy = req.user.id;
  await videoCall.save();

  res.json({
    message: 'Video call ended successfully',
    videoCallId: videoCall._id,
  });
});

const generateVideoCallToken = asyncHandler(async (req, res) => {
  ensureStreamCredentials();

  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid video call ID' });
  }

  await assertSameTenantForDoc(VideoCall, id, req.tenantId);

  const videoCall = await VideoCall.findOne(
    req.applyTenantFilter({ _id: id, isDeleted: false })
  ).populate('course', 'professor');

  if (!videoCall) {
    return res.status(404).json({ message: 'Video call not found' });
  }

  if (videoCall.status !== ACTIVE_STATUS) {
    return res.status(400).json({ message: 'Video call is not active' });
  }

  let streamRole = 'participant';
  const userId = req.user.id;

  if (req.user.role === 'admin') {
    streamRole = 'host';
  } else if (req.user.role === 'professor') {
    if (
      videoCall.createdBy.toString() !== userId &&
      videoCall.course.professor.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to join this video call' });
    }
    streamRole = 'host';
  } else if (req.user.role === 'student') {
    const enrollment = await Enrollment.findOne(
      req.applyTenantFilter({
        course: videoCall.course._id,
        student: userId,
        status: 'active',
        isDeleted: false,
      })
    ).select('_id');

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: 'You are not enrolled in this course' });
    }

    streamRole = 'participant';
  } else {
    return res.status(403).json({ message: 'Role not allowed to join calls' });
  }

  const validityInSeconds = 60 * 60;
  const token = generateVideoUserToken(userId, {
    callCid: videoCall.callCid,
    validityInSeconds,
  });

  res.json({
    token,
    apiKey: env.streamApiKey,
    call: {
      id: videoCall._id,
      callId: videoCall.callId,
      callType: videoCall.callType,
      callCid: videoCall.callCid,
      title: videoCall.title,
      status: videoCall.status,
    },
    role: streamRole,
    expiresAt: new Date(Date.now() + validityInSeconds * 1000).toISOString(),
  });
});

const updateParticipants = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { participants } = req.body;

  if (!Array.isArray(participants)) {
    return res.status(400).json({ message: 'Participants must be an array' });
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid video call ID' });
  }

  await assertSameTenantForDoc(VideoCall, id, req.tenantId);

  const videoCall = await VideoCall.findOne(
    req.applyTenantFilter({ _id: id, isDeleted: false })
  ).populate('course', 'professor');

  if (!videoCall) {
    return res.status(404).json({ message: 'Video call not found' });
  }

  const isCreator = videoCall.createdBy.toString() === req.user.id;
  const isProfessor = req.user.role === 'professor' &&
    videoCall.course.professor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCreator && !isProfessor && !isAdmin) {
    return res.status(403).json({
      message: 'You are not authorized to update participants for this video call',
    });
  }

  const sanitizedParticipants = participants
    .filter(
      participant =>
        participant &&
        participant.user &&
        mongoose.Types.ObjectId.isValid(participant.user)
    )
    .map(participant => ({
      user: participant.user,
      role: participant.role || 'participant',
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt,
    }));

  videoCall.participants = sanitizedParticipants;
  videoCall.updatedBy = req.user.id;
  await videoCall.save();

  await videoCall.populate('lesson', 'title date startTime endTime');
  await videoCall.populate('course', 'name');
  await videoCall.populate('createdBy', 'firstName lastName email role');

  res.json(videoCall);
});

module.exports = {
  getVideoCalls,
  getVideoCallById,
  getActiveVideoCallForLesson,
  createVideoCall,
  endVideoCall,
  generateVideoCallToken,
  updateParticipants,
};
