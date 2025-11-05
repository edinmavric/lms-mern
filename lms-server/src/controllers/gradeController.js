const Grade = require('../models/Grade');
const User = require('../models/User');
const Course = require('../models/Course');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllGrades = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({});
  if (req.query.student) criteria.student = req.query.student;
  if (req.query.course) criteria.course = req.query.course;
  if (req.query.professor) criteria.professor = req.query.professor;
  if (req.query.attempt) criteria.attempt = req.query.attempt;

  const grades = await Grade.find(criteria)
    .populate('student', 'firstName lastName email')
    .populate('course', 'name')
    .populate('professor', 'firstName lastName email')
    .populate('history.changedBy', 'firstName lastName email')
    .sort({ date: -1 });

  res.json(grades);
});

const getGradeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid grade ID' });
  }

  await assertSameTenantForDoc(Grade, id, req.tenantId);

  const grade = await Grade.findById(id)
    .populate('student', 'firstName lastName email')
    .populate('course', 'name')
    .populate('professor', 'firstName lastName email')
    .populate('history.changedBy', 'firstName lastName email');

  if (!grade) {
    return res.status(404).json({ message: 'Grade not found' });
  }

  res.json(grade);
});

const createGrade = asyncHandler(async (req, res) => {
  requireFields(req.body, ['student', 'course', 'value']);

  const gradeData = {
    ...req.body,
    tenant: req.tenantId,
    professor: req.user.id,
    createdBy: req.user.id,
    attempt: req.body.attempt || 1,
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

  const grade = await Grade.create(gradeData);
  await grade.populate('student', 'firstName lastName email');
  await grade.populate('course', 'name');
  await grade.populate('professor', 'firstName lastName email');
  await grade.populate('history.changedBy', 'firstName lastName email');

  res.status(201).json(grade);
});

const updateGrade = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid grade ID' });
  }

  await assertSameTenantForDoc(Grade, id, req.tenantId);

  const grade = await Grade.findById(id);
  if (!grade) {
    return res.status(404).json({ message: 'Grade not found' });
  }

  if (
    String(grade.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only update grades you created',
    });
  }

  if (req.body.value !== undefined && req.body.value !== grade.value) {
    if (!grade.history) {
      grade.history = [];
    }
    grade.history.push({
      oldValue: grade.value,
      newValue: req.body.value,
      changedBy: req.user.id,
      changedAt: new Date(),
    });
  }

  delete req.body.tenant;
  delete req.body.professor;
  req.body.updatedBy = req.user.id;

  Object.assign(grade, req.body);
  await grade.save();

  await grade.populate('student', 'firstName lastName email');
  await grade.populate('course', 'name');
  await grade.populate('professor', 'firstName lastName email');
  await grade.populate('history.changedBy', 'firstName lastName email');

  res.json(grade);
});

const deleteGrade = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid grade ID' });
  }

  await assertSameTenantForDoc(Grade, id, req.tenantId);

  const grade = await Grade.findById(id);
  if (!grade) {
    return res.status(404).json({ message: 'Grade not found' });
  }

  if (
    String(grade.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only delete grades you created',
    });
  }

  await Grade.findByIdAndDelete(id);

  res.json({ message: 'Grade deleted successfully', id: grade._id });
});

module.exports = {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
};
