const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const examSubscriptionSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['subscribed', 'graded', 'passed', 'failed'],
      default: 'subscribed',
    },
    points: {
      type: Number,
      min: 0,
    },
    grade: {
      type: Number,
      min: 5,
      max: 10,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedAt: Date,
    comment: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

examSubscriptionSchema.pre('validate', async function (next) {
  const User = mongoose.model('User');
  const student = await User.findById(this.student);
  if (student && student.role !== 'student') {
    return next(new Error('Subscribed user must have role: student'));
  }
  if (
    this.status === 'graded' ||
    this.status === 'passed' ||
    this.status === 'failed'
  ) {
    if (this.points === undefined || this.points === null) {
      return next(new Error('Points are required when exam is graded'));
    }
  }
  if (this.status === 'passed' && (!this.grade || this.grade < 6)) {
    return next(new Error('Passed exam must have a grade between 6 and 10'));
  }
  if (this.status === 'failed' && this.grade !== 5) {
    return next(new Error('Failed exam must have grade 5'));
  }
  next();
});

examSubscriptionSchema.index(
  { tenant: 1, exam: 1, student: 1 },
  { unique: true }
);

examSubscriptionSchema.plugin(activityLogPlugin, {
  entityType: 'ExamSubscription',
});

module.exports = mongoose.model('ExamSubscription', examSubscriptionSchema);
