const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const lessonMaterialSchema = new mongoose.Schema(
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
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        'pdf',
        'video',
        'presentation',
        'link',
        'document',
        'image',
        'other',
      ],
      required: true,
    },
    url: {
      type: String,
      required: false,
    },
    storageKey: String,
    isDeleted: {
      type: Boolean,
      default: false,
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

lessonMaterialSchema.pre('validate', async function (next) {
  const User = mongoose.model('User');
  const professor = await User.findById(this.professor);
  if (professor && professor.role !== 'professor') {
    return next(new Error('Assigned user must have role: professor'));
  }
  next();
});

lessonMaterialSchema.index({ tenant: 1, course: 1 });
lessonMaterialSchema.index({ tenant: 1, lesson: 1 });

lessonMaterialSchema.plugin(activityLogPlugin, {
  entityType: 'LessonMaterial',
});

module.exports = mongoose.model('LessonMaterial', lessonMaterialSchema);
