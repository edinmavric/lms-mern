const crypto = require('crypto');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  sanitizeUserOutput,
  validatePassword,
  validateEmail,
  sanitizeEmail,
  sanitizeString,
  sanitizeDomain,
} = require('../utils/validators');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const { sendUserCredentials } = require('../utils/email');
const {
  logAuthAttempt,
  logSecurityEvent,
  hashResetToken,
  verifyResetToken,
} = require('../utils/logger');
const env = require('../config/env');

const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);

  const { email, password, tenantId, tenantName } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  // Sanitize inputs
  const sanitizedEmail = validateEmail(email);
  const sanitizedTenantName = tenantName
    ? sanitizeString(tenantName, 100)
    : null;

  let tenant;

  if (tenantId) {
    tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false });
  } else if (sanitizedTenantName) {
    tenant = await Tenant.findOne({
      name: sanitizedTenantName,
      isDeleted: false,
    });
  } else {
    logAuthAttempt('login', false, {
      email: sanitizedEmail,
      reason: 'Missing tenant',
    });
    return res.status(400).json({
      message: 'Tenant ID or name is required',
    });
  }

  if (!tenant) {
    logAuthAttempt('login', false, {
      email: sanitizedEmail,
      reason: 'Tenant not found',
      ip: clientIp,
    });
    return res.status(404).json({
      message: 'Tenant not found',
    });
  }

  const user = await User.findOne({
    email: sanitizedEmail,
    tenant: tenant._id,
  });

  if (!user) {
    logAuthAttempt('login', false, {
      email: sanitizedEmail,
      tenantId: tenant._id.toString(),
      reason: 'User not found',
      ip: clientIp,
    });
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const isValidPassword = await user.validatePassword(password);

  if (!isValidPassword) {
    logAuthAttempt('login', false, {
      email: sanitizedEmail,
      userId: user._id.toString(),
      tenantId: tenant._id.toString(),
      reason: 'Invalid password',
      ip: clientIp,
    });
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  if (user.status !== 'active') {
    logAuthAttempt('login', false, {
      email: sanitizedEmail,
      userId: user._id.toString(),
      reason: 'Account not active',
      ip: clientIp,
    });
    return res.status(403).json({
      message: 'Account is not active. Please wait for approval.',
    });
  }

  if (user.pendingApproval) {
    logAuthAttempt('login', false, {
      email: sanitizedEmail,
      userId: user._id.toString(),
      reason: 'Account pending approval',
      ip: clientIp,
    });
    return res.status(403).json({
      message: 'Account is pending approval',
    });
  }

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  logAuthAttempt('login', true, {
    email: sanitizedEmail,
    userId: user._id.toString(),
    tenantId: tenant._id.toString(),
    role: user.role,
    ip: clientIp,
  });

  res.json({
    token,
    refreshToken,
    user: sanitizeUserOutput(user),
    tenant: {
      id: tenant._id,
      name: tenant.name,
      domain: tenant.domain,
    },
  });
});

const register = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password', 'firstName', 'lastName']);

  const { email, password, firstName, lastName, tenantId, tenantName } =
    req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  const sanitizedEmail = validateEmail(email);
  validatePassword(password);
  const sanitizedFirstName = sanitizeString(firstName, 100);
  const sanitizedLastName = sanitizeString(lastName, 100);
  const sanitizedTenantName = tenantName
    ? sanitizeString(tenantName, 100)
    : null;

  if (!sanitizedFirstName || !sanitizedLastName) {
    logAuthAttempt('register', false, {
      email: sanitizedEmail,
      reason: 'Invalid name fields',
      ip: clientIp,
    });
    return res.status(400).json({
      message: 'Invalid first name or last name',
    });
  }

  let tenant;

  if (tenantId) {
    tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false });
  } else if (sanitizedTenantName) {
    tenant = await Tenant.findOne({
      name: sanitizedTenantName,
      isDeleted: false,
    });
  } else {
    logAuthAttempt('register', false, {
      email: sanitizedEmail,
      reason: 'Missing tenant',
      ip: clientIp,
    });
    return res.status(400).json({
      message: 'Tenant ID or name is required',
    });
  }

  if (!tenant) {
    logAuthAttempt('register', false, {
      email: sanitizedEmail,
      reason: 'Tenant not found',
      ip: clientIp,
    });
    return res.status(404).json({
      message: 'Tenant not found',
    });
  }

  const existing = await User.findOne({
    email: sanitizedEmail,
    tenant: tenant._id,
  });

  if (existing) {
    logAuthAttempt('register', false, {
      email: sanitizedEmail,
      tenantId: tenant._id.toString(),
      reason: 'Email already exists',
      ip: clientIp,
    });
    return res.status(409).json({
      message: 'User with this email already exists in this tenant',
    });
  }

  const user = new User({
    email: sanitizedEmail,
    firstName: sanitizedFirstName,
    lastName: sanitizedLastName,
    tenant: tenant._id,
    role: 'student',
    status: 'pending',
    pendingApproval: true,
  });

  await user.setPassword(password);
  await user.save();

  logAuthAttempt('register', true, {
    email: sanitizedEmail,
    userId: user._id.toString(),
    tenantId: tenant._id.toString(),
    ip: clientIp,
  });

  res.status(201).json({
    message: 'Registration successful. Please wait for admin approval.',
    user: sanitizeUserOutput(user),
  });
});

const tenantSignup = asyncHandler(async (req, res) => {
  if (!env.allowTenantSignup) {
    logSecurityEvent('tenant_signup_blocked', {
      ip: req.ip || req.connection.remoteAddress,
      reason: 'Tenant signup disabled',
    });
    return res.status(403).json({
      message: 'Tenant signup is currently disabled',
    });
  }

  requireFields(req.body, [
    'tenantName',
    'adminEmail',
    'adminPassword',
    'adminFirstName',
    'adminLastName',
  ]);

  const {
    tenantName,
    domain,
    contactEmail,
    adminEmail,
    adminPassword,
    adminFirstName,
    adminLastName,
    settings,
  } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  const sanitizedTenantName = sanitizeString(tenantName, 100);
  const sanitizedAdminEmail = validateEmail(adminEmail);
  validatePassword(adminPassword);
  const sanitizedAdminFirstName = sanitizeString(adminFirstName, 100);
  const sanitizedAdminLastName = sanitizeString(adminLastName, 100);
  const sanitizedDomain = domain ? sanitizeDomain(domain) : null;
  const sanitizedContactEmail = contactEmail
    ? validateEmail(contactEmail)
    : null;

  if (
    !sanitizedTenantName ||
    !sanitizedAdminFirstName ||
    !sanitizedAdminLastName
  ) {
    logAuthAttempt('tenant_signup', false, {
      email: sanitizedAdminEmail,
      reason: 'Invalid name fields',
      ip: clientIp,
    });
    return res.status(400).json({
      message: 'Invalid tenant name or admin name fields',
    });
  }

  const existingTenant = await Tenant.findOne({
    name: sanitizedTenantName,
    isDeleted: false,
  });

  if (existingTenant) {
    logAuthAttempt('tenant_signup', false, {
      email: sanitizedAdminEmail,
      tenantName: sanitizedTenantName,
      reason: 'Tenant name already exists',
      ip: clientIp,
    });
    return res.status(409).json({
      message: 'Tenant with this name already exists',
    });
  }

  const tenant = await Tenant.create({
    name: sanitizedTenantName,
    domain: sanitizedDomain,
    contactEmail: sanitizedContactEmail || sanitizedAdminEmail,
    settings: settings || {
      gradeScale: { min: 1, max: 5, label: '1-5' },
      attendanceRules: { requiredPresencePercent: 75, allowRemote: false },
      currency: 'EUR',
      locale: 'en',
    },
  });

  const adminUser = new User({
    email: sanitizedAdminEmail,
    firstName: sanitizedAdminFirstName,
    lastName: sanitizedAdminLastName,
    tenant: tenant._id,
    role: 'admin',
    status: 'active',
    pendingApproval: false,
  });

  await adminUser.setPassword(adminPassword);
  await adminUser.save();

  const token = generateToken(adminUser);
  const refreshToken = generateRefreshToken(adminUser);

  logAuthAttempt('tenant_signup', true, {
    email: sanitizedAdminEmail,
    userId: adminUser._id.toString(),
    tenantId: tenant._id.toString(),
    tenantName: sanitizedTenantName,
    ip: clientIp,
  });

  res.status(201).json({
    message: 'Tenant and admin account created successfully',
    token,
    refreshToken,
    user: sanitizeUserOutput(adminUser),
    tenant: {
      id: tenant._id,
      name: tenant.name,
      domain: tenant.domain,
    },
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'tenantId']);

  const { email, tenantId } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  const sanitizedEmail = validateEmail(email);

  const tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false });

  if (!tenant) {
    logAuthAttempt('password_reset', false, {
      email: sanitizedEmail,
      reason: 'Tenant not found',
      ip: clientIp,
    });
    return res.status(404).json({
      message: 'Tenant not found',
    });
  }

  const user = await User.findOne({
    email: sanitizedEmail,
    tenant: tenant._id,
  });

  if (!user) {
    logAuthAttempt('password_reset', false, {
      email: sanitizedEmail,
      tenantId: tenant._id.toString(),
      reason: 'User not found',
      ip: clientIp,
    });
    return res.status(200).json({
      message: 'If email exists, password reset link has been sent',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashResetToken(resetToken);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 3600000;

  await user.save();

  if (env.nodeEnv === 'development') {
    console.log(`Password reset token for ${sanitizedEmail}: ${resetToken}`);
    console.log(
      `Reset link: /api/auth/reset-password?token=${resetToken}&tenantId=${tenantId}`
    );
  } else {
    // TODO: Send email with reset link in production
    // await sendPasswordResetEmail(sanitizedEmail, resetToken, tenantId);
  }

  logAuthAttempt('password_reset', true, {
    email: sanitizedEmail,
    userId: user._id.toString(),
    tenantId: tenant._id.toString(),
    ip: clientIp,
  });

  res.json({
    message: 'If email exists, password reset link has been sent',
    ...(env.nodeEnv === 'development' && { resetToken }),
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ['token', 'newPassword', 'tenantId']);

  const { token, newPassword, tenantId } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  validatePassword(newPassword);

  const tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false });

  if (!tenant) {
    logAuthAttempt('password_reset_confirm', false, {
      reason: 'Tenant not found',
      ip: clientIp,
    });
    return res.status(404).json({
      message: 'Tenant not found',
    });
  }

  const hashedToken = hashResetToken(token);

  const user = await User.findOne({
    tenant: tenant._id,
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    logAuthAttempt('password_reset_confirm', false, {
      tenantId: tenant._id.toString(),
      reason: 'Invalid or expired token',
      ip: clientIp,
    });
    return res.status(400).json({
      message: 'Invalid or expired reset token',
    });
  }

  await user.setPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logAuthAttempt('password_reset_confirm', true, {
    email: user.email,
    userId: user._id.toString(),
    tenantId: tenant._id.toString(),
    ip: clientIp,
  });

  res.json({
    message: 'Password reset successful',
  });
});

const searchTenants = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string' || query.length < 2) {
    return res.status(400).json({
      message: 'Search query must be at least 2 characters',
    });
  }

  const sanitizedQuery = sanitizeString(query, 100);

  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return res.status(400).json({
      message: 'Invalid search query',
    });
  }

  const tenants = await Tenant.find({
    isDeleted: false,
    $or: [
      { name: new RegExp(sanitizedQuery, 'i') },
      { domain: new RegExp(sanitizedQuery, 'i') },
    ],
  })
    .select('name domain contactEmail')
    .limit(10);

  res.json(tenants);
});

const refreshToken = asyncHandler(async (req, res) => {
  requireFields(req.body, ['refreshToken']);

  const { refreshToken: token } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  try {
    const payload = verifyRefreshToken(token);

    const user = await User.findById(payload.sub).select(
      '_id role tenant status pendingApproval'
    );

    if (!user) {
      logAuthAttempt('refresh_token', false, {
        reason: 'User not found',
        ip: clientIp,
      });
      return res.status(401).json({
        message: 'Invalid refresh token',
      });
    }

    if (user.status !== 'active' || user.pendingApproval) {
      logAuthAttempt('refresh_token', false, {
        userId: user._id.toString(),
        reason: 'Account not active',
        ip: clientIp,
      });
      return res.status(403).json({
        message: 'Account is not active',
      });
    }

    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    logAuthAttempt('refresh_token', true, {
      userId: user._id.toString(),
      ip: clientIp,
    });

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    logAuthAttempt('refresh_token', false, {
      reason: err.message,
      ip: clientIp,
    });
    return res.status(401).json({
      message: 'Invalid or expired refresh token',
    });
  }
});

module.exports = {
  login,
  register,
  tenantSignup,
  forgotPassword,
  resetPassword,
  searchTenants,
  refreshToken,
};
