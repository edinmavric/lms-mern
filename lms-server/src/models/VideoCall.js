const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['host', 'cohost', 'participant'],
      default: 'participant',
    },
    joinedAt: Date,
    leftAt: Date,
  },
  { _id: false }
);

const videoCallSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    callType: {
      type: String,
      default: 'default',
      trim: true,
    },
    callId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    callCid: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['active', 'ended', 'cancelled'],
      default: 'active',
      index: true,
    },
    lessonStartAt: {
      type: Date,
      required: true,
    },
    lessonEndAt: {
      type: Date,
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
    participants: [participantSchema],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

videoCallSchema.index(
  { tenant: 1, lesson: 1, status: 1 },
  { name: 'tenant_lesson_status_idx' }
);
videoCallSchema.index(
  { tenant: 1, course: 1, status: 1 },
  { name: 'tenant_course_status_idx' }
);

videoCallSchema.virtual('isLive').get(function () {
  return this.status === 'active';
});

videoCallSchema.set('toJSON', { virtuals: true });
videoCallSchema.set('toObject', { virtuals: true });

videoCallSchema.plugin(activityLogPlugin, { entityType: 'VideoCall' });

module.exports = mongoose.model('VideoCall', videoCallSchema);
