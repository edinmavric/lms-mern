const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const examSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    date: {
      type: Date,
      required: true,
    },
    location: String,
    maxPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    passingPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['preliminary', 'finishing'],
      default: 'finishing',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscriptionDeadline: {
      type: Date,
      required: true,
    },
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

examSchema.pre('validate', async function (next) {
  const User = mongoose.model('User');
  const professor = await User.findById(this.professor);
  if (professor && professor.role !== 'professor') {
    return next(new Error('Assigned user must have role: professor'));
  }
  if (this.passingPoints > this.maxPoints) {
    return next(new Error('Passing points cannot exceed max points'));
  }
  if (this.type === 'finishing' && this.subscriptionDeadline > this.date) {
    return next(new Error('Subscription deadline must be before exam date'));
  }
  next();
});

examSchema.plugin(activityLogPlugin, { entityType: 'Exam' });

module.exports = mongoose.model('Exam', examSchema);
