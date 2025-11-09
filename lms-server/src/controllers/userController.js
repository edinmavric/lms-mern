const User = require('../models/User');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
  sanitizeUserOutput,
} = require('../utils/validators');
const env = require('../config/env');
const { sendApprovalEmail } = require('../utils/email');

const getAllUsers = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({});
  if (req.query.role) criteria.role = req.query.role;
  if (req.query.status) criteria.status = req.query.status;
  if (req.query.email) criteria.email = new RegExp(req.query.email, 'i');

  const users = await User.find(criteria)
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  await assertSameTenantForDoc(User, id, req.tenantId);

  const user = await User.findById(id).select('-passwordHash');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

const createUser = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password', 'role']);

  const existing = await User.findOne({
    email: req.body.email,
    tenant: req.tenantId,
  });
  if (existing) {
    return res
      .status(409)
      .json({ message: 'User with this email already exists in this tenant' });
  }

  const allowedRoles = ['admin', 'professor', 'student'];
  if (!allowedRoles.includes(req.body.role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const userData = {
    ...req.body,
    tenant: req.tenantId,
    createdBy: req.user.id,
  };

  const user = new User(userData);
  await user.setPassword(req.body.password);
  delete userData.password;

  await user.save();

  res.status(201).json(sanitizeUserOutput(user));
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  await assertSameTenantForDoc(User, id, req.tenantId);

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (String(user._id) === String(req.user.id)) {
    if (req.body.role && req.body.role !== user.role) {
      return res.status(400).json({
        message: 'You cannot change your own role',
      });
    }
  }

  const allowedFields = ['firstName', 'lastName', 'email', 'role', 'status'];
  const updateData = {};

  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  }

  if (req.body.password) {
    await user.setPassword(req.body.password);
  }

  delete updateData.tenant;

  Object.assign(user, updateData);
  await user.save();

  res.json(sanitizeUserOutput(user));
});

const approveUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  await assertSameTenantForDoc(User, id, req.tenantId);

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.pendingApproval = false;
  user.status = 'active';
  user.approvedBy = req.user.id;
  user.approvedAt = new Date();
  await user.save();

  try {
    const loginLink = `${env.frontendUrl}/login`;
    await sendApprovalEmail(user.email, null, loginLink);
  } catch (e) {
  }

  res.json(sanitizeUserOutput(user));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  await assertSameTenantForDoc(User, id, req.tenantId);

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (String(user._id) === String(req.user.id)) {
    return res.status(400).json({
      message: 'You cannot delete your own account',
    });
  }

  await User.findByIdAndDelete(id);

  res.json({ message: 'User deleted successfully', id: user._id });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  approveUser,
  deleteUser,
};
