const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const consultationSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    maxStudents: {
      type: Number,
      default: null,
      min: 1,
    },
    registeredStudents: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly'],
      },
      daysOfWeek: [Number],
      endDate: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
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

consultationSchema.pre('validate', async function (next) {
  const User = mongoose.model('User');

  const professor = await User.findById(this.professor);
  if (!professor || professor.role !== 'professor') {
    return next(new Error('Consultation must be created by a professor'));
  }
  if (this.startTime >= this.endTime) {
    return next(new Error('End time must be after start time'));
  }
  if (this.maxStudents && this.registeredStudents.length > this.maxStudents) {
    return next(new Error(`Maximum ${this.maxStudents} students can register`));
  }
  next();
});

consultationSchema.index({ tenant: 1, professor: 1, date: -1 });
consultationSchema.index({ tenant: 1, status: 1, date: -1 });
consultationSchema.index({ tenant: 1, courses: 1 });

consultationSchema.virtual('availableSpots').get(function () {
  if (!this.maxStudents) return null;
  return this.maxStudents - this.registeredStudents.length;
});

consultationSchema.virtual('isFull').get(function () {
  if (!this.maxStudents) return false;
  return this.registeredStudents.length >= this.maxStudents;
});

consultationSchema.set('toJSON', { virtuals: true });
consultationSchema.set('toObject', { virtuals: true });

consultationSchema.plugin(activityLogPlugin, { entityType: 'Consultation' });

module.exports = mongoose.model('Consultation', consultationSchema);
