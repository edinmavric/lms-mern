const ExamSubscription = require('../models/ExamSubscription');
const Exam = require('../models/Exam');
const Grade = require('../models/Grade');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllExamSubscriptions = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({});
  if (req.query.exam) criteria.exam = req.query.exam;
  if (req.query.student) criteria.student = req.query.student;
  if (req.query.status) criteria.status = req.query.status;

  const subscriptions = await ExamSubscription.find(criteria)
    .populate('exam', 'title date course')
    .populate('student', 'firstName lastName email')
    .populate('gradedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.json(subscriptions);
});

const getExamSubscriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid subscription ID' });
  }

  await assertSameTenantForDoc(ExamSubscription, id, req.tenantId);

  const subscription = await ExamSubscription.findById(id)
    .populate('exam', 'title date course maxPoints passingPoints')
    .populate('student', 'firstName lastName email')
    .populate('gradedBy', 'firstName lastName email');

  if (!subscription) {
    return res.status(404).json({ message: 'Exam subscription not found' });
  }

  res.json(subscription);
});

const subscribeToExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  if (!isValidObjectId(examId)) {
    return res.status(400).json({ message: 'Invalid exam ID' });
  }

  await assertSameTenantForDoc(Exam, examId, req.tenantId);

  const exam = await Exam.findById(examId).populate('course');
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  if (exam.type === 'preliminary') {
    return res.status(400).json({
      message:
        'Preliminary exams are automatically subscribed for all enrolled students',
    });
  }

  if (new Date() > new Date(exam.subscriptionDeadline)) {
    return res.status(400).json({
      message: 'Subscription deadline has passed',
    });
  }

  const enrollment = await Enrollment.findOne({
    tenant: req.tenantId,
    student: req.user.id,
    course: exam.course._id,
    status: { $ne: 'cancelled' },
    isDeleted: false,
  });

  if (!enrollment) {
    return res.status(403).json({
      message: 'You must be enrolled in the course to subscribe to the exam',
    });
  }

  const existing = await ExamSubscription.findOne({
    tenant: req.tenantId,
    exam: examId,
    student: req.user.id,
  });

  if (existing) {
    return res.status(400).json({
      message: 'You are already subscribed to this exam',
    });
  }

  const subscription = await ExamSubscription.create({
    tenant: req.tenantId,
    exam: examId,
    student: req.user.id,
    status: 'subscribed',
    createdBy: req.user.id,
  });

  await subscription.populate('exam', 'title date course');
  await subscription.populate('student', 'firstName lastName email');

  res.status(201).json(subscription);
});

const gradeExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid subscription ID' });
  }

  requireFields(req.body, ['points']);

  await assertSameTenantForDoc(ExamSubscription, id, req.tenantId);

  const subscription = await ExamSubscription.findById(id).populate('exam');
  if (!subscription) {
    return res.status(404).json({ message: 'Exam subscription not found' });
  }

  const exam = await Exam.findById(subscription.exam).populate('course');
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  const course = exam.course;
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (
    String(course.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'Only the course professor can grade exams',
    });
  }

  const points = req.body.points;
  if (points < 0 || points > exam.maxPoints) {
    return res.status(400).json({
      message: `Points must be between 0 and ${exam.maxPoints}`,
    });
  }

  const passed = points >= exam.passingPoints;
  const grade = passed ? req.body.grade || 6 : 5;

  if (passed && (grade < 6 || grade > 10)) {
    return res.status(400).json({
      message: 'Passing grade must be between 6 and 10',
    });
  }

  subscription.points = points;
  subscription.grade = grade;
  subscription.status = passed ? 'passed' : 'failed';
  subscription.gradedBy = req.user.id;
  subscription.gradedAt = new Date();
  subscription.comment = req.body.comment;
  subscription.updatedBy = req.user.id;
  await subscription.save();

  const studentId = subscription.student;
  const courseId = typeof course === 'object' ? course._id : course;

  let gradeRecord = await Grade.findOne({
    tenant: req.tenantId,
    student: studentId,
    course: courseId,
    attempt: 1,
  });

  if (gradeRecord) {
    if (!gradeRecord.history) {
      gradeRecord.history = [];
    }
    gradeRecord.history.push({
      oldValue: gradeRecord.value,
      newValue: grade,
      changedBy: req.user.id,
      changedAt: new Date(),
    });
    gradeRecord.value = grade;
    gradeRecord.comment = req.body.comment || subscription.comment;
    gradeRecord.updatedBy = req.user.id;
    await gradeRecord.save();
  } else {
    gradeRecord = await Grade.create({
      tenant: req.tenantId,
      student: studentId,
      course: courseId,
      professor: req.user.id,
      value: grade,
      comment: req.body.comment || subscription.comment,
      attempt: 1,
      date: new Date(),
      createdBy: req.user.id,
    });
  }

  await subscription.populate('exam', 'title date course');
  await subscription.populate('student', 'firstName lastName email');
  await subscription.populate('gradedBy', 'firstName lastName email');

  res.json({
    subscription,
    grade: gradeRecord,
  });
});

const unsubscribeFromExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid subscription ID' });
  }

  await assertSameTenantForDoc(ExamSubscription, id, req.tenantId);

  const subscription = await ExamSubscription.findById(id).populate('exam');
  if (!subscription) {
    return res.status(404).json({ message: 'Exam subscription not found' });
  }

  if (String(subscription.student) !== String(req.user.id)) {
    return res.status(403).json({
      message: 'You can only unsubscribe from your own exam subscriptions',
    });
  }

  if (subscription.status !== 'subscribed') {
    return res.status(400).json({
      message: 'Cannot unsubscribe from a graded exam',
    });
  }

  const exam = subscription.exam;
  if (new Date() > new Date(exam.subscriptionDeadline)) {
    return res.status(400).json({
      message: 'Cannot unsubscribe after subscription deadline',
    });
  }

  await ExamSubscription.findByIdAndDelete(id);

  res.json({
    message: 'Successfully unsubscribed from exam',
    id: subscription._id,
  });
});

module.exports = {
  getAllExamSubscriptions,
  getExamSubscriptionById,
  subscribeToExam,
  gradeExam,
  unsubscribeFromExam,
};
