const Attendance = require('../models/Attendance');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllAttendance = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({});
  if (req.query.student) criteria.student = req.query.student;
  if (req.query.lesson) criteria.lesson = req.query.lesson;
  if (req.query.status) criteria.status = req.query.status;
  if (req.query.startDate || req.query.endDate) {
    criteria.date = {};
    if (req.query.startDate) criteria.date.$gte = new Date(req.query.startDate);
    if (req.query.endDate) criteria.date.$lte = new Date(req.query.endDate);
  }

  const attendance = await Attendance.find(criteria)
    .populate('student', 'firstName lastName email')
    .populate({
      path: 'lesson',
      populate: {
        path: 'course',
        select: 'name',
      },
    })
    .populate('recordedBy', 'firstName lastName email')
    .sort({ date: -1 });

  res.json(attendance);
});

const getAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid attendance ID' });
  }

  await assertSameTenantForDoc(Attendance, id, req.tenantId);

  const attendance = await Attendance.findById(id)
    .populate('student', 'firstName lastName email')
    .populate({
      path: 'lesson',
      populate: {
        path: 'course',
        select: 'name',
      },
    })
    .populate('recordedBy', 'firstName lastName email');

  if (!attendance) {
    return res.status(404).json({ message: 'Attendance not found' });
  }

  res.json(attendance);
});

const createAttendance = asyncHandler(async (req, res) => {
  requireFields(req.body, ['student', 'lesson', 'date', 'status']);

  if (!['professor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only professors or admins can record attendance',
    });
  }

  const lesson = await Lesson.findOne({
    _id: req.body.lesson,
    tenant: req.tenantId,
    isDeleted: false,
  }).populate('course', 'professor');

  if (!lesson) {
    return res.status(400).json({
      message: 'Invalid lesson ID or lesson not found in tenant',
    });
  }

  const courseProfessorId = lesson.course?.professor?.toString();
  const isCourseProfessor = courseProfessorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCourseProfessor && !isAdmin) {
    return res.status(403).json({
      message: 'Only the course professor or admin can record attendance for this lesson',
    });
  }

  const student = await User.findOne({
    _id: req.body.student,
    tenant: req.tenantId,
    role: 'student',
  });

  if (!student) {
    return res.status(400).json({
      message: 'Invalid student ID or not a student in this tenant',
    });
  }

  const existing = await Attendance.findOne({
    tenant: req.tenantId,
    student: req.body.student,
    lesson: req.body.lesson,
  });

  if (existing) {
    return res.status(400).json({
      message: 'Attendance record already exists for this student and lesson',
    });
  }

  const attendanceData = {
    ...req.body,
    tenant: req.tenantId,
    recordedBy: req.user.id,
    createdBy: req.user.id,
  };

  const attendance = await Attendance.create(attendanceData);
  await attendance.populate('student', 'firstName lastName email');
  await attendance.populate({
    path: 'lesson',
    populate: {
      path: 'course',
      select: 'name',
    },
  });
  await attendance.populate('recordedBy', 'firstName lastName email');

  res.status(201).json(attendance);
});

const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid attendance ID' });
  }

  await assertSameTenantForDoc(Attendance, id, req.tenantId);

  const attendance = await Attendance.findById(id).populate({
    path: 'lesson',
    populate: {
      path: 'course',
      select: 'professor',
    },
  });

  if (!attendance) {
    return res.status(404).json({ message: 'Attendance not found' });
  }

  const courseProfessorId = attendance.lesson?.course?.professor?.toString();
  const isCourseProfessor = courseProfessorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCourseProfessor && !isAdmin) {
    return res.status(403).json({
      message: 'Only the course professor or admin can update attendance',
    });
  }

  delete req.body.tenant;
  delete req.body.lesson;
  delete req.body.student;
  delete req.body.recordedBy;
  req.body.updatedBy = req.user.id;

  Object.assign(attendance, req.body);
  await attendance.save();

  await attendance.populate('student', 'firstName lastName email');
  await attendance.populate({
    path: 'lesson',
    populate: {
      path: 'course',
      select: 'name',
    },
  });
  await attendance.populate('recordedBy', 'firstName lastName email');

  res.json(attendance);
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid attendance ID' });
  }

  await assertSameTenantForDoc(Attendance, id, req.tenantId);

  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return res.status(404).json({ message: 'Attendance not found' });
  }

  await Attendance.findByIdAndDelete(id);

  res.json({ message: 'Attendance deleted successfully', id: attendance._id });
});

module.exports = {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};
