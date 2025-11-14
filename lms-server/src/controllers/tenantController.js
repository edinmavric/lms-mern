const Tenant = require('../models/Tenant');
const { asyncHandler } = require('../utils/async');
const { requireFields, isValidObjectId, createSafeSearchRegex } = require('../utils/validators');

const getAllTenants = asyncHandler(async (req, res) => {
  const criteria = {
    isDeleted: req.query.includeDeleted === 'true' ? undefined : false,
  };

  if (req.query.name) {
    const searchRegex = createSafeSearchRegex(req.query.name);
    if (searchRegex) criteria.name = searchRegex;
  }
  if (req.query.domain) criteria.domain = req.query.domain;

  if (req.query.createdAfter || req.query.createdBefore) {
    criteria.createdAt = {};
    if (req.query.createdAfter) {
      criteria.createdAt.$gte = new Date(req.query.createdAfter);
    }
    if (req.query.createdBefore) {
      criteria.createdAt.$lte = new Date(req.query.createdBefore);
    }
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [tenants, total] = await Promise.all([
    Tenant.find(criteria).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Tenant.countDocuments(criteria),
  ]);

  res.json({
    data: tenants,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getTenantById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid tenant ID' });
  }

  const tenant = await Tenant.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
  }

  res.json(tenant);
});

const createTenant = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name']);

  const tenantData = {
    ...req.body,
    createdBy: req.user.id,
    settings: req.body.settings || {
      gradeScale: { min: 1, max: 5, label: '1-5' },
      attendanceRules: { requiredPresencePercent: 75, allowRemote: false },
      currency: 'EUR',
      locale: 'en',
    },
  };

  const existing = await Tenant.findOne({ name: req.body.name });

  if (existing && !existing.isDeleted) {
    return res.status(400).json({
      message: 'Tenant with this name already exists',
    });
  }

  const tenant = await Tenant.create(tenantData);

  res.status(201).json(tenant);
});

const updateTenant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid tenant ID' });
  }

  const tenant = await Tenant.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
  }

  if (req.body.name && req.body.name !== tenant.name) {
    const existing = await Tenant.findOne({
      name: req.body.name,
      _id: { $ne: id },
      isDeleted: false,
    });

    if (existing) {
      return res.status(400).json({
        message: 'Tenant with this name already exists',
      });
    }
  }

  if (req.body.settings) {
    tenant.settings = { ...tenant.settings, ...req.body.settings };
  }

  const allowedFields = ['name', 'domain', 'logo', 'primaryColor', 'secondaryColor'];
  const updateData = {};
  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  }
  updateData.updatedBy = req.user.id;

  Object.assign(tenant, updateData);
  await tenant.save();

  res.json(tenant);
});

const deleteTenant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid tenant ID' });
  }

  const tenant = await Tenant.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
  }

  tenant.isDeleted = true;
  tenant.deletedAt = new Date();
  tenant.updatedBy = req.user.id;
  await tenant.save();

  res.json({
    message: 'Tenant deleted successfully',
    id: tenant._id,
  });
});

module.exports = {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
};
