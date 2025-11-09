const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const courseSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  name: { type: String, required: true },
  description: String,
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  price: Number,
  enrollmentPassword: String,
  schedule: {
    days: [String],
    startTime: String,
    endTime: String,
  },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

courseSchema.pre('validate', async function (next) {
  const User = mongoose.model('User');
  const professor = await User.findById(this.professor);
  if (professor && professor.role !== 'professor') {
    return next(new Error('Assigned user must have role: professor'));
  }
  next();
});

courseSchema.plugin(activityLogPlugin, { entityType: 'Course' });

module.exports = mongoose.model('Course', courseSchema);
