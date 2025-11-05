const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true },
  comment: String,
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

gradeSchema.pre('validate', async function(next) {
  const Tenant = mongoose.model('Tenant');
  const tenant = await Tenant.findById(this.tenant);
  if (tenant) {
    const { min, max } = tenant.settings?.gradeScale || {};
    if (typeof min === 'number' && typeof max === 'number') {
      if (this.value < min || this.value > max) {
        return next(new Error(`Grade must be between ${min} and ${max}`));
      }
    }
  }
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
