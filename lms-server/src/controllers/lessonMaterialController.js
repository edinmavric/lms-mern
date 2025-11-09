const LessonMaterial = require('../models/LessonMaterial');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllLessonMaterials = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });

  if (req.query.lesson) criteria.lesson = req.query.lesson;
  if (req.query.course) criteria.course = req.query.course;
  if (req.query.professor) criteria.professor = req.query.professor;

  const materials = await LessonMaterial.find(criteria)
    .populate('lesson', 'title date')
    .populate('course', 'name')
    .populate('professor', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.json(materials);
});

const getLessonMaterialById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid material ID' });
  }

  await assertSameTenantForDoc(LessonMaterial, id, req.tenantId);

  const material = await LessonMaterial.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate('lesson', 'title date startTime endTime')
    .populate('course', 'name')
    .populate('professor', 'firstName lastName email');

  if (!material) {
    return res.status(404).json({ message: 'Lesson material not found' });
  }

  res.json(material);
});

const createLessonMaterial = asyncHandler(async (req, res) => {
  requireFields(req.body, ['lesson', 'name', 'type', 'url']);

  const lesson = await Lesson.findOne({
    _id: req.body.lesson,
    tenant: req.tenantId,
    isDeleted: false,
  }).populate('course');

  if (!lesson) {
    return res.status(400).json({
      message: 'Invalid lesson ID or lesson not found in tenant',
    });
  }

  const courseId =
    typeof lesson.course === 'string' ? lesson.course : lesson.course._id;

  const course = await Course.findOne({
    _id: courseId,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!course) {
    return res.status(400).json({
      message: 'Course not found',
    });
  }

  if (
    String(course.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only add materials to lessons for courses you teach',
    });
  }

  const materialData = {
    ...req.body,
    tenant: req.tenantId,
    course: courseId,
    professor: req.user.id,
    createdBy: req.user.id,
  };

  const material = await LessonMaterial.create(materialData);
  await material.populate('lesson', 'title date');
  await material.populate('course', 'name');
  await material.populate('professor', 'firstName lastName email');

  res.status(201).json(material);
});

const updateLessonMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid material ID' });
  }

  await assertSameTenantForDoc(LessonMaterial, id, req.tenantId);

  const material = await LessonMaterial.findById(id);
  if (!material || material.isDeleted) {
    return res.status(404).json({ message: 'Lesson material not found' });
  }

  const course = await Course.findOne({
    _id: material.course,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!course) {
    return res.status(400).json({
      message: 'Course not found',
    });
  }

  if (
    String(material.professor) !== String(req.user.id) &&
    String(course.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only update materials for lessons you teach',
    });
  }

  delete req.body.tenant;
  delete req.body.lesson;
  delete req.body.course;
  delete req.body.professor;
  req.body.updatedBy = req.user.id;

  Object.assign(material, req.body);
  await material.save();

  await material.populate('lesson', 'title date');
  await material.populate('course', 'name');
  await material.populate('professor', 'firstName lastName email');

  res.json(material);
});

const deleteLessonMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid material ID' });
  }

  await assertSameTenantForDoc(LessonMaterial, id, req.tenantId);

  const material = await LessonMaterial.findById(id);
  if (!material || material.isDeleted) {
    return res.status(404).json({ message: 'Lesson material not found' });
  }

  const course = await Course.findOne({
    _id: material.course,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!course) {
    return res.status(400).json({
      message: 'Course not found',
    });
  }

  if (
    String(material.professor) !== String(req.user.id) &&
    String(course.professor) !== String(req.user.id) &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can only delete materials for lessons you teach',
    });
  }

  material.isDeleted = true;
  material.updatedBy = req.user.id;
  await material.save();

  res.json({
    message: 'Lesson material deleted successfully',
    id: material._id,
  });
});

module.exports = {
  getAllLessonMaterials,
  getLessonMaterialById,
  createLessonMaterial,
  updateLessonMaterial,
  deleteLessonMaterial,
};
