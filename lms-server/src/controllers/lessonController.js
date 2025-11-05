const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllLessons = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });
  if (req.query.course) criteria.course = req.query.course;
  if (req.query.title) criteria.title = new RegExp(req.query.title, 'i');

  const lessons = await Lesson.find(criteria)
    .populate('course', 'name')
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.json(lessons);
});

const getLessonById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  await assertSameTenantForDoc(Lesson, id, req.tenantId);

  const lesson = await Lesson.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  })
    .populate('course', 'name description')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  res.json(lesson);
});

const createLesson = asyncHandler(async (req, res) => {
  requireFields(req.body, ['course', 'title']);

  const lessonData = {
    ...req.body,
    tenant: req.tenantId,
    createdBy: req.user.id,
  };

  const course = await Course.findOne({
    _id: req.body.course,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!course) {
    return res.status(400).json({
      message: 'Invalid course ID or course not found in tenant',
    });
  }

  const lesson = await Lesson.create(lessonData);
  await lesson.populate('course', 'name');
  await lesson.populate('createdBy', 'firstName lastName email');

  res.status(201).json(lesson);
});

const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  await assertSameTenantForDoc(Lesson, id, req.tenantId);

  const lesson = await Lesson.findById(id).populate('course', 'professor');
  if (!lesson || lesson.isDeleted) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  const courseProfessorId = lesson.course?.professor?.toString();
  const isCourseProfessor = courseProfessorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCourseProfessor && !isAdmin) {
    return res.status(403).json({
      message: 'Only the course professor or admin can update this lesson',
    });
  }

  delete req.body.tenant;
  req.body.updatedBy = req.user.id;

  Object.assign(lesson, req.body);
  await lesson.save();

  await lesson.populate('course', 'name');
  await lesson.populate('createdBy', 'firstName lastName email');
  await lesson.populate('updatedBy', 'firstName lastName email');

  res.json(lesson);
});

const deleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  await assertSameTenantForDoc(Lesson, id, req.tenantId);

  const lesson = await Lesson.findById(id).populate('course', 'professor');
  if (!lesson || lesson.isDeleted) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  const courseProfessorId = lesson.course?.professor?.toString();
  const isCourseProfessor = courseProfessorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCourseProfessor && !isAdmin) {
    return res.status(403).json({
      message: 'Only the course professor or admin can delete this lesson',
    });
  }

  lesson.isDeleted = true;
  lesson.updatedBy = req.user.id;
  await lesson.save();

  res.json({ message: 'Lesson deleted successfully', id: lesson._id });
});

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};
