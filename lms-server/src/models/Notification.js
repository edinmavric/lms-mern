const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const notificationSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['general', 'urgent', 'maintenance', 'event', 'academic'],
      default: 'general',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'professors', 'specific'],
      default: 'all',
      required: true,
    },
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    targetCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    targetDepartments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
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

notificationSchema.pre('validate', function (next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  if (this.targetAudience === 'specific' && this.targetUsers.length === 0) {
    return next(
      new Error('Specific notifications must have at least one target user')
    );
  }
  next();
});

notificationSchema.index({ tenant: 1, isPublished: 1, publishedAt: -1 });
notificationSchema.index({ tenant: 1, targetAudience: 1 });
notificationSchema.index({ tenant: 1, isPinned: 1, publishedAt: -1 });
notificationSchema.index({ tenant: 1, expiresAt: 1 });
notificationSchema.index({ 'readBy.user': 1 });

notificationSchema.virtual('readCount').get(function () {
  return this.readBy.length;
});

notificationSchema.methods.isReadBy = function (userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

notificationSchema.methods.markAsRead = async function (userId) {
  if (!this.isReadBy(userId)) {
    this.readBy.push({ user: userId, readAt: new Date() });
    await this.save();
  }
};

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

notificationSchema.plugin(activityLogPlugin, { entityType: 'Notification' });

module.exports = mongoose.model('Notification', notificationSchema);
