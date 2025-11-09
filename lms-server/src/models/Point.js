const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const pointSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    maxPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    date: {
      type: Date,
      default: Date.now,
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

pointSchema.pre('validate', async function (next) {
  const User = mongoose.model('User');
  const professor = await User.findById(this.professor);
  if (professor && professor.role !== 'professor') {
    return next(new Error('Assigned user must have role: professor'));
  }
  const student = await User.findById(this.student);
  if (student && student.role !== 'student') {
    return next(new Error('Assigned user must have role: student'));
  }
  if (this.points > this.maxPoints) {
    return next(new Error('Points cannot exceed max points'));
  }
  next();
});

pointSchema.plugin(activityLogPlugin, { entityType: 'Point' });

module.exports = mongoose.model('Point', pointSchema);
