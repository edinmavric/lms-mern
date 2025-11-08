const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllLessons = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });
  if (req.query.course) criteria.course = req.query.course;
  if (req.query.title) criteria.title = new RegExp(req.query.title, 'i');

  if (req.query.date) {
    const queryDate = new Date(req.query.date);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);
    criteria.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  const lessons = await Lesson.find(criteria)
    .populate('course', 'name professor')
    .populate('createdBy', 'firstName lastName email')
    .sort({ date: -1, startTime: 1 });

  res.json(lessons);
});

const getLessonById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  await assertSameTenantForDoc(Lesson, id, req.tenantId);

  const lesson = await Lesson.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  })
    .populate('course', 'name description')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  res.json(lesson);
});

const createLesson = asyncHandler(async (req, res) => {
  requireFields(req.body, ['course', 'title', 'date', 'startTime', 'endTime']);

  const lessonData = {
    ...req.body,
    tenant: req.tenantId,
    createdBy: req.user.id,
  };

  const course = await Course.findOne({
    _id: req.body.course,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!course) {
    return res.status(400).json({
      message: 'Invalid course ID or course not found in tenant',
    });
  }

  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (
    !timeRegex.test(req.body.startTime) ||
    !timeRegex.test(req.body.endTime)
  ) {
    return res.status(400).json({
      message: 'Invalid time format. Use HH:mm format (e.g., 09:00)',
    });
  }

  const [startHours, startMinutes] = req.body.startTime.split(':').map(Number);
  const [endHours, endMinutes] = req.body.endTime.split(':').map(Number);
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  if (endTotalMinutes <= startTotalMinutes) {
    return res.status(400).json({
      message: 'End time must be after start time',
    });
  }

  const lesson = await Lesson.create(lessonData);
  await lesson.populate('course', 'name professor');
  await lesson.populate('createdBy', 'firstName lastName email');

  res.status(201).json(lesson);
});

const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  await assertSameTenantForDoc(Lesson, id, req.tenantId);

  const lesson = await Lesson.findById(id).populate('course', 'professor');
  if (!lesson || lesson.isDeleted) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  const courseProfessorId = lesson.course?.professor?.toString();
  const isCourseProfessor = courseProfessorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCourseProfessor && !isAdmin) {
    return res.status(403).json({
      message: 'Only the course professor or admin can update this lesson',
    });
  }

  delete req.body.tenant;
  req.body.updatedBy = req.user.id;

  if (req.body.startTime || req.body.endTime) {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    const startTime = req.body.startTime || lesson.startTime;
    const endTime = req.body.endTime || lesson.endTime;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        message: 'Invalid time format. Use HH:mm format (e.g., 09:00)',
      });
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    if (endTotalMinutes <= startTotalMinutes) {
      return res.status(400).json({
        message: 'End time must be after start time',
      });
    }
  }

  Object.assign(lesson, req.body);
  await lesson.save();

  await lesson.populate('course', 'name');
  await lesson.populate('createdBy', 'firstName lastName email');
  await lesson.populate('updatedBy', 'firstName lastName email');

  res.json(lesson);
});

const deleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  await assertSameTenantForDoc(Lesson, id, req.tenantId);

  const lesson = await Lesson.findById(id).populate('course', 'professor');
  if (!lesson || lesson.isDeleted) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  const courseProfessorId = lesson.course?.professor?.toString();
  const isCourseProfessor = courseProfessorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCourseProfessor && !isAdmin) {
    return res.status(403).json({
      message: 'Only the course professor or admin can delete this lesson',
    });
  }

  lesson.isDeleted = true;
  lesson.updatedBy = req.user.id;
  await lesson.save();

  res.json({ message: 'Lesson deleted successfully', id: lesson._id });
});

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};
