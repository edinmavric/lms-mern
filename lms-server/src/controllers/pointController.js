const Point = require('../models/Point');
const User = require('../models/User');
const Course = require('../models/Course');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllPoints = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({});
  if (req.query.student) criteria.student = req.query.student;
  if (req.query.course) criteria.course = req.query.course;
  if (req.query.professor) criteria.professor = req.query.professor;

  const points = await Point.find(criteria)
    .populate('student', 'firstName lastName email')
    .populate('course', 'name')
    .populate('professor', 'firstName lastName email')
    .sort({ date: -1 });

  res.json(points);
});

const getPointById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid point ID' });
  }

  await assertSameTenantForDoc(Point, id, req.tenantId);

  const point = await Point.findById(id)
    .populate('student', 'firstName lastName email')
    .populate('course', 'name')
    .populate('professor', 'firstName lastName email');

  if (!point) {
    return res.status(404).json({ message: 'Point not found' });
  }

  res.json(point);
});

const createPoint = asyncHandler(async (req, res) => {
  requireFields(req.body, [
    'student',
    'course',
    'points',
    'maxPoints',
    'title',
  ]);

  const pointData = {
    ...req.body,
    tenant: req.tenantId,
    professor: req.user.id,
    createdBy: req.user.id,
  };

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

  if (
    String(course.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only assign points for courses you teach',
    });
  }

  const point = await Point.create(pointData);
  await point.populate('student', 'firstName lastName email');
  await point.populate('course', 'name');
  await point.populate('professor', 'firstName lastName email');

  res.status(201).json(point);
});

const updatePoint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid point ID' });
  }

  await assertSameTenantForDoc(Point, id, req.tenantId);

  const point = await Point.findById(id);
  if (!point) {
    return res.status(404).json({ message: 'Point not found' });
  }

  if (
    String(point.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only update points you created',
    });
  }

  delete req.body.tenant;
  delete req.body.professor;
  req.body.updatedBy = req.user.id;

  Object.assign(point, req.body);
  await point.save();

  await point.populate('student', 'firstName lastName email');
  await point.populate('course', 'name');
  await point.populate('professor', 'firstName lastName email');

  res.json(point);
});

const deletePoint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid point ID' });
  }

  await assertSameTenantForDoc(Point, id, req.tenantId);

  const point = await Point.findById(id);
  if (!point) {
    return res.status(404).json({ message: 'Point not found' });
  }

  if (
    String(point.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only delete points you created',
    });
  }

  await Point.findByIdAndDelete(id);

  res.json({ message: 'Point deleted successfully', id: point._id });
});

module.exports = {
  getAllPoints,
  getPointById,
  createPoint,
  updatePoint,
  deletePoint,
};
