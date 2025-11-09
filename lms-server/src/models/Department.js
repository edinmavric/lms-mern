const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const departmentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  name: { type: String, required: true },
  description: String,
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

departmentSchema.index({ tenant: 1, name: 1 }, { unique: true });

departmentSchema.plugin(activityLogPlugin, { entityType: 'Department' });

module.exports = mongoose.model('Department', departmentSchema);
