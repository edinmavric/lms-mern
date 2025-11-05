const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },

  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'excused'], 
    default: 'present' 
  },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

attendanceSchema.index({ student: 1, lesson: 1 }, { unique: true });

attendanceSchema.pre('validate', async function (next) {
  const User = mongoose.model('User');
  const student = await User.findById(this.student);
  if (student && student.role !== 'student') {
    return next(new Error('Attendance user must have role: student'));
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
