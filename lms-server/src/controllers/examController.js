const Exam = require('../models/Exam');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ExamSubscription = require('../models/ExamSubscription');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllExams = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({});
  if (req.query.course) criteria.course = req.query.course;
  if (req.query.professor) criteria.professor = req.query.professor;
  if (req.query.isActive !== undefined)
    criteria.isActive = req.query.isActive === 'true';

  const exams = await Exam.find(criteria)
    .populate('course', 'name')
    .populate('professor', 'firstName lastName email')
    .sort({ date: 1 });

  res.json(exams);
});

const getExamById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid exam ID' });
  }

  await assertSameTenantForDoc(Exam, id, req.tenantId);

  const exam = await Exam.findById(id)
    .populate('course', 'name description')
    .populate('professor', 'firstName lastName email');

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  res.json(exam);
});

const createExam = asyncHandler(async (req, res) => {
  requireFields(req.body, [
    'course',
    'title',
    'date',
    'maxPoints',
    'passingPoints',
    'type',
  ]);

  if (req.body.type === 'finishing' && !req.body.subscriptionDeadline) {
    return res.status(400).json({
      message: 'Subscription deadline is required for finishing exams',
    });
  }

  const examData = {
    ...req.body,
    tenant: req.tenantId,
    professor: req.user.id,
    createdBy: req.user.id,
    subscriptionDeadline:
      req.body.subscriptionDeadline ||
      (req.body.type === 'preliminary' ? req.body.date : null),
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

  if (
    String(course.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only create exams for courses you teach',
    });
  }

  const exam = await Exam.create(examData);
  await exam.populate('course', 'name');
  await exam.populate('professor', 'firstName lastName email');

  if (exam.type === 'preliminary') {
    const enrollments = await Enrollment.find({
      tenant: req.tenantId,
      course: exam.course._id,
      status: { $ne: 'cancelled' },
      isDeleted: false,
    });

    const subscriptions = enrollments.map(enrollment => ({
      tenant: req.tenantId,
      exam: exam._id,
      student: enrollment.student,
      status: 'subscribed',
      createdBy: req.user.id,
    }));

    if (subscriptions.length > 0) {
      await ExamSubscription.insertMany(subscriptions);
    }
  }

  res.status(201).json(exam);
});

const updateExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid exam ID' });
  }

  await assertSameTenantForDoc(Exam, id, req.tenantId);

  const exam = await Exam.findById(id);
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  if (
    String(exam.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only update exams you created',
    });
  }

  delete req.body.tenant;
  delete req.body.professor;
  req.body.updatedBy = req.user.id;

  const wasPreliminary = exam.type === 'preliminary';
  const isNowPreliminary = req.body.type === 'preliminary';

  Object.assign(exam, req.body);
  await exam.save();

  if (!wasPreliminary && isNowPreliminary) {
    const enrollments = await Enrollment.find({
      tenant: req.tenantId,
      course: exam.course._id,
      status: { $ne: 'cancelled' },
      isDeleted: false,
    });

    const existingSubscriptions = await ExamSubscription.find({
      tenant: req.tenantId,
      exam: exam._id,
    });
    const existingStudentIds = existingSubscriptions.map(sub =>
      sub.student.toString()
    );

    const newSubscriptions = enrollments
      .filter(
        enrollment =>
          !existingStudentIds.includes(enrollment.student.toString())
      )
      .map(enrollment => ({
        tenant: req.tenantId,
        exam: exam._id,
        student: enrollment.student,
        status: 'subscribed',
        createdBy: req.user.id,
      }));

    if (newSubscriptions.length > 0) {
      await ExamSubscription.insertMany(newSubscriptions);
    }
  }

  await exam.populate('course', 'name');
  await exam.populate('professor', 'firstName lastName email');

  res.json(exam);
});

const deleteExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid exam ID' });
  }

  await assertSameTenantForDoc(Exam, id, req.tenantId);

  const exam = await Exam.findById(id);
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  if (
    String(exam.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only delete exams you created',
    });
  }

  await Exam.findByIdAndDelete(id);

  res.json({ message: 'Exam deleted successfully', id: exam._id });
});

module.exports = {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
