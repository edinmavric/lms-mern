const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const lessonSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: { type: String, required: true },
  content: String,
  recordingUrl: String,
  recordingKey: String,
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

lessonSchema.plugin(activityLogPlugin, { entityType: 'Lesson' });

module.exports = mongoose.model('Lesson', lessonSchema);
