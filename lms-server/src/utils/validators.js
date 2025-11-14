const mongoose = require('mongoose');

function isValidObjectId(id) {
  return Boolean(id) && mongoose.Types.ObjectId.isValid(String(id));
}

function requireFields(payload, fields) {
  for (const field of fields) {
    if (
      payload[field] === undefined ||
      payload[field] === null ||
      payload[field] === ''
    ) {
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
  const tenant = await Tenant.findById(tenantId)
    .select('settings.gradeScale')
    .lean();
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

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    throw new Error('Password must be at most 128 characters long');
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUpperCase) {
    throw new Error('Password must contain at least one uppercase letter');
  }

  if (!hasLowerCase) {
    throw new Error('Password must contain at least one lowercase letter');
  }

  if (!hasNumber) {
    throw new Error('Password must contain at least one number');
  }

  if (!hasSpecialChar) {
    throw new Error('Password must contain at least one special character');
  }

  return true;
}

function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }
  return email.toLowerCase().trim();
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  const sanitized = sanitizeEmail(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  if (sanitized.length > 254) {
    throw new Error('Email is too long');
  }

  return sanitized;
}

function sanitizeString(str, maxLength = 255) {
  if (!str || typeof str !== 'string') {
    return null;
  }
  let sanitized = str.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return null;
  }
  const sanitized = domain.toLowerCase().trim();
  const domainRegex =
    /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
  if (!domainRegex.test(sanitized)) {
    throw new Error('Invalid domain format');
  }
  return sanitized;
}

function createSafeSearchRegex(userInput, maxLength = 100) {
  if (!userInput || typeof userInput !== 'string') {
    return null;
  }
  const trimmed = userInput.trim().substring(0, maxLength);
  if (!trimmed) {
    return null;
  }
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

module.exports = {
  isValidObjectId,
  requireFields,
  assertSameTenantForDoc,
  assertUserHasRole,
  validateGradeWithinTenantScale,
  buildTenantCriteria,
  sanitizeUserOutput,
  validatePassword,
  sanitizeEmail,
  validateEmail,
  sanitizeString,
  sanitizeDomain,
  createSafeSearchRegex,
};
