const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  content: String,
  materials: [{
    type: { type: String, enum: ['pdf', 'video', 'presentation', 'link'], required: true },
    url: { type: String, required: true },
    storageKey: String
  }],
  recordingUrl: String,
  recordingKey: String,
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', lessonSchema);
