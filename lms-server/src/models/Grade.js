const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
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
    value: {
      type: Number,
      required: true,
    },
    comment: String,
    attempt: {
      type: Number,
      default: 1,
    },
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
    history: [
      {
        oldValue: Number,
        newValue: Number,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

gradeSchema.pre('validate', async function (next) {
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
