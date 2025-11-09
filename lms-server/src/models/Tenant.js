const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const tenantSettingsSchema = new mongoose.Schema(
  {
    gradeScale: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 5 },
      label: { type: String, enum: ['1-5', '1-10', '6-10'], default: '1-5' },
    },
    attendanceRules: {
      requiredPresencePercent: { type: Number, default: 75 },
      allowRemote: { type: Boolean, default: false },
    },
    currency: { type: String, default: 'EUR' },
    locale: { type: String, default: 'en' },
  },
  { _id: false }
);

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    domain: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(
            v
          );
        },
        message: 'Invalid domain format',
      },
    },
    contactEmail: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format',
      },
    },
    settings: tenantSettingsSchema,
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

tenantSchema.plugin(activityLogPlugin, { entityType: 'Tenant' });

module.exports = mongoose.model('Tenant', tenantSchema);
