const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const enrollmentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
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
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active',
  },
  payments: [
    {
      amount: Number,
      date: Date,
      status: { type: String, enum: ['paid', 'pending'], default: 'pending' },
    },
  ],
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

enrollmentSchema.pre('validate', async function (next) {
  const User = mongoose.model('User');
  const student = await User.findById(this.student);
  if (student && student.role !== 'student') {
    return next(new Error('Enrolled user must have role: student'));
  }
  next();
});

enrollmentSchema.index({ tenant: 1, student: 1, course: 1 }, { unique: true });

enrollmentSchema.plugin(activityLogPlugin, { entityType: 'Enrollment' });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
