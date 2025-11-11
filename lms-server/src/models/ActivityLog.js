const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'user.created',
        'user.updated',
        'user.deleted',
        'user.approved',
        'user.disabled',
        'user.login',
        'user.logout',
        'user.password_reset',

        'course.created',
        'course.updated',
        'course.deleted',
        'course.enrolled',
        'course.unenrolled',

        'lesson.created',
        'lesson.updated',
        'lesson.deleted',
        'lesson.material_added',
        'lesson.material_deleted',

        'grade.created',
        'grade.updated',
        'grade.deleted',

        'exam.created',
        'exam.updated',
        'exam.deleted',
        'exam.subscribed',
        'exam.graded',

        'attendance.marked',
        'attendance.updated',

        'payment.received',
        'payment.updated',

        'department.created',
        'department.updated',
        'department.deleted',

        'settings.updated',
        'bank_account.created',
        'bank_account.updated',
        'bank_account.deleted',

        'point.created',
        'point.updated',
        'point.deleted',

        'enrollment.created',
        'enrollment.updated',
        'enrollment.deleted',

        'consultation.created',
        'consultation.updated',
        'consultation.deleted',
        'consultation.registered',
        'consultation.unregistered',
        'consultation.cancelled',

        'notification.created',
        'notification.updated',
        'notification.deleted',
        'notification.published',
        'notification.read',

        'videoCall.created',
        'videoCall.updated',
        'videoCall.ended',
        'videoCall.cancelled',
        'videoCall.participants_updated',
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: [
        'User',
        'Course',
        'Lesson',
        'Grade',
        'Exam',
        'ExamSubscription',
        'Attendance',
        'Enrollment',
        'Payment',
        'Department',
        'BankAccount',
        'LessonMaterial',
        'Point',
        'Tenant',
        'Consultation',
        'Notification',
        'VideoCall',
      ],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ tenant: 1, createdAt: -1 });
activityLogSchema.index({ tenant: 1, user: 1, createdAt: -1 });
activityLogSchema.index({ tenant: 1, action: 1, createdAt: -1 });
activityLogSchema.index({ tenant: 1, entityType: 1, entityId: 1 });

activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
