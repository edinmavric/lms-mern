const mongoose = require('mongoose');

function isValidObjectId(id) {
  return Boolean(id) && mongoose.Types.ObjectId.isValid(String(id));
}

function requireFields(payload, fields) {
  for (const field of fields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

async function assertSameTenantForDoc(Model, docId, tenantId) {
  if (!isValidObjectId(docId)) {
    throw new Error('Invalid id');
  }
  const doc = await Model.findById(docId).select('tenant').lean();
  if (!doc) {
    throw new Error('Resource not found');
  }
  if (String(doc.tenant) !== String(tenantId)) {
    throw new Error('Cross-tenant access forbidden');
  }
}

async function assertUserHasRole(userId, allowedRoles) {
  const User = mongoose.model('User');
  const user = await User.findById(userId).select('role').lean();
  if (!user) {
    throw new Error('User not found');
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: role not allowed');
  }
}

async function validateGradeWithinTenantScale(tenantId, gradeValue) {
  const Tenant = mongoose.model('Tenant');
  const tenant = await Tenant.findById(tenantId).select('settings.gradeScale').lean();
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  const { min, max } = tenant.settings.gradeScale || {};
  if (typeof min === 'number' && typeof max === 'number') {
    if (gradeValue < min || gradeValue > max) {
      throw new Error(`Grade must be between ${min} and ${max}`);
    }
  }
}

function buildTenantCriteria(tenantId, criteria) {
  const base = criteria && typeof criteria === 'object' ? criteria : {};
  return { ...base, tenant: String(tenantId) };
}

function sanitizeUserOutput(user) {
  if (!user) return user;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  return obj;
}

module.exports = {
  isValidObjectId,
  requireFields,
  assertSameTenantForDoc,
  assertUserHasRole,
  validateGradeWithinTenantScale,
  buildTenantCriteria,
  sanitizeUserOutput,
};
