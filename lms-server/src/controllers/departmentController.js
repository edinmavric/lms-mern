const Department = require('../models/Department');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
  createSafeSearchRegex,
} = require('../utils/validators');

const getAllDepartments = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });
  if (req.query.name) {
    const searchRegex = createSafeSearchRegex(req.query.name);
    if (searchRegex) criteria.name = searchRegex;
  }

  const departments = await Department.find(criteria)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email')
    .sort({ name: 1 });

  res.json(departments);
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid department ID' });
  }

  await assertSameTenantForDoc(Department, id, req.tenantId);

  const department = await Department.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  })
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!department) {
    return res.status(404).json({ message: 'Department not found' });
  }

  res.json(department);
});

const createDepartment = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name']);

  const departmentData = {
    ...req.body,
    tenant: req.tenantId,
    createdBy: req.user.id,
  };

  const department = await Department.create(departmentData);
  await department.populate('createdBy', 'firstName lastName email');

  res.status(201).json(department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid department ID' });
  }

  await assertSameTenantForDoc(Department, id, req.tenantId);

  const department = await Department.findById(id);
  if (!department || department.isDeleted) {
    return res.status(404).json({ message: 'Department not found' });
  }

  const allowedFields = ['name', 'description', 'head'];
  const updateData = {};
  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  }
  updateData.updatedBy = req.user.id;
  updateData.updatedAt = new Date();

  Object.assign(department, updateData);
  await department.save();

  await department.populate('createdBy', 'firstName lastName email');
  await department.populate('updatedBy', 'firstName lastName email');

  res.json(department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid department ID' });
  }

  await assertSameTenantForDoc(Department, id, req.tenantId);

  const department = await Department.findById(id);
  if (!department || department.isDeleted) {
    return res.status(404).json({ message: 'Department not found' });
  }

  department.isDeleted = true;
  department.updatedBy = req.user.id;
  department.updatedAt = new Date();
  await department.save();

  res.json({ message: 'Department deleted successfully', id: department._id });
});

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
