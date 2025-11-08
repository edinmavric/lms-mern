const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllEnrollments = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });
  if (req.query.student) criteria.student = req.query.student;
  if (req.query.course) criteria.course = req.query.course;
  if (req.query.status) criteria.status = req.query.status;

  const enrollments = await Enrollment.find(criteria)
    .populate('student', 'firstName lastName email')
    .populate('course', 'name price')
    .sort({ createdAt: -1 });

  res.json(enrollments);
});

const getEnrollmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid enrollment ID' });
  }

  await assertSameTenantForDoc(Enrollment, id, req.tenantId);

  const enrollment = await Enrollment.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  })
    .populate('student', 'firstName lastName email')
    .populate('course', 'name price description');

  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  res.json(enrollment);
});

const createEnrollment = asyncHandler(async (req, res) => {
  requireFields(req.body, ['course']);

  let studentId = req.body.student;

  if (req.user.role === 'student') {
    studentId = req.user.id;
  } else if (!['admin', 'professor'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Not allowed to create enrollments',
    });
  }

  if (!studentId) {
    return res.status(400).json({
      message: 'Student ID is required',
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

  if (course.enrollmentPassword && req.user.role === 'student') {
    if (!req.body.enrollmentPassword) {
      return res.status(400).json({
        message: 'Enrollment password is required for this course',
      });
    }
    if (course.enrollmentPassword !== req.body.enrollmentPassword) {
      return res.status(403).json({
        message: 'Invalid enrollment password',
      });
    }
  }

  const student = await User.findOne({
    _id: studentId,
    tenant: req.tenantId,
    role: 'student',
  });

  if (!student) {
    return res.status(400).json({
      message: 'Invalid student ID or not a student in this tenant',
    });
  }

  const existing = await Enrollment.findOne({
    tenant: req.tenantId,
    student: studentId,
    course: req.body.course,
    status: { $ne: 'cancelled' },
  });

  if (existing && !existing.isDeleted) {
    return res.status(400).json({
      message: 'Student is already enrolled in this course',
    });
  }

  const enrollmentData = {
    student: studentId,
    course: req.body.course,
    tenant: req.tenantId,
    status: req.body.status || 'active',
    createdBy: req.user.id,
  };

  const enrollment = await Enrollment.create(enrollmentData);
  await enrollment.populate('student', 'firstName lastName email');
  await enrollment.populate('course', 'name price');

  res.status(201).json(enrollment);
});

const updateEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid enrollment ID' });
  }

  await assertSameTenantForDoc(Enrollment, id, req.tenantId);

  const enrollment = await Enrollment.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  delete req.body.tenant;
  delete req.body.student;
  delete req.body.course;
  req.body.updatedBy = req.user.id;

  Object.assign(enrollment, req.body);
  await enrollment.save();

  await enrollment.populate('student', 'firstName lastName email');
  await enrollment.populate('course', 'name price');

  res.json(enrollment);
});

const addPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  requireFields(req.body, ['amount']);

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid enrollment ID' });
  }

  await assertSameTenantForDoc(Enrollment, id, req.tenantId);

  const enrollment = await Enrollment.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  }).populate('course', 'price');

  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  if (req.user.role === 'student') {
    const studentId =
      typeof enrollment.student === 'string'
        ? enrollment.student.toString()
        : enrollment.student._id.toString();
    if (studentId !== req.user.id) {
      return res.status(403).json({
        message: 'You can only add payments to your own enrollments',
      });
    }
  } else if (!['admin', 'professor'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only admins or professors can register payments',
    });
  }

  if (req.body.amount <= 0) {
    return res.status(400).json({
      message: 'Payment amount must be greater than zero',
    });
  }

  const totalPaid = enrollment.payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  const coursePrice = enrollment.course?.price || 0;
  if (coursePrice > 0 && totalPaid + req.body.amount > coursePrice) {
    return res.status(400).json({
      message: 'Payment exceeds remaining balance',
    });
  }

  // Students can only submit payments with 'pending' status
  // Admins, accountants, and professors can set status
  const paymentStatus =
    req.user.role === 'student' ? 'pending' : req.body.status || 'pending';

  enrollment.payments.push({
    amount: req.body.amount,
    date: req.body.date || new Date(),
    status: paymentStatus,
  });

  // Only admins/accountants can automatically mark payments as paid
  // If an admin/accountant sets status to 'paid' and total matches or exceeds course price,
  // mark all payments as paid
  if (
    ['admin', 'accountant'].includes(req.user.role) &&
    paymentStatus === 'paid'
  ) {
    const newTotalPaid = totalPaid + req.body.amount;
    if (coursePrice > 0 && newTotalPaid >= coursePrice) {
      enrollment.payments.forEach(payment => {
        payment.status = 'paid';
      });
    }
  }

  enrollment.updatedBy = req.user.id;
  await enrollment.save();

  await enrollment.populate('student', 'firstName lastName email');
  await enrollment.populate('course', 'name price');

  res.json(enrollment);
});

const deleteEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid enrollment ID' });
  }

  await assertSameTenantForDoc(Enrollment, id, req.tenantId);

  const enrollment = await Enrollment.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  enrollment.isDeleted = true;
  enrollment.updatedBy = req.user.id;
  await enrollment.save();

  res.json({
    message: 'Enrollment deleted successfully',
    id: enrollment._id,
  });
});

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  addPayment,
  deleteEnrollment,
};
