const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Course = require('../models/Course');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllAttendance = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({});
  if (req.query.student) criteria.student = req.query.student;
  if (req.query.course) criteria.course = req.query.course;
  if (req.query.status) criteria.status = req.query.status;
  if (req.query.startDate || req.query.endDate) {
    criteria.date = {};
    if (req.query.startDate) criteria.date.$gte = new Date(req.query.startDate);
    if (req.query.endDate) criteria.date.$lte = new Date(req.query.endDate);
  }

  const attendance = await Attendance.find(criteria)
    .populate('student', 'firstName lastName email')
    .populate('course', 'name')
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
    .populate('course', 'name')
    .populate('recordedBy', 'firstName lastName email');

  if (!attendance) {
    return res.status(404).json({ message: 'Attendance not found' });
  }

  res.json(attendance);
});

const createAttendance = asyncHandler(async (req, res) => {
  requireFields(req.body, ['student', 'date', 'status']);

  if (!['professor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only professors or admins can record attendance',
    });
  }

  const attendanceData = {
    ...req.body,
    tenant: req.tenantId,
    recordedBy: req.user.id,
    createdBy: req.user.id,
  };

  const dateValue = new Date(req.body.date);
  const startOfDay = new Date(dateValue);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateValue);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await Attendance.findOne({
    tenant: req.tenantId,
    student: req.body.student,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (existing) {
    return res.status(400).json({
      message: 'Attendance record already exists for this date',
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

  if (req.body.course) {
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
  }

  const attendance = await Attendance.create(attendanceData);
  await attendance.populate('student', 'firstName lastName email');
  await attendance.populate('course', 'name');
  await attendance.populate('recordedBy', 'firstName lastName email');

  res.status(201).json(attendance);
});

const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid attendance ID' });
  }

  await assertSameTenantForDoc(Attendance, id, req.tenantId);

  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return res.status(404).json({ message: 'Attendance not found' });
  }

  delete req.body.tenant;
  delete req.body.recordedBy;
  req.body.updatedBy = req.user.id;

  Object.assign(attendance, req.body);
  await attendance.save();

  await attendance.populate('student', 'firstName lastName email');
  await attendance.populate('course', 'name');
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
