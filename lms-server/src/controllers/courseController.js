const Course = require('../models/Course');
const User = require('../models/User');
const Department = require('../models/Department');
const Enrollment = require('../models/Enrollment');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const syncCourseStudents = async (courseId, tenantId) => {
  try {
    const enrollments = await Enrollment.find({
      course: courseId,
      tenant: tenantId,
      isDeleted: false,
      status: { $in: ['active', 'completed'] },
    }).select('student');

    const studentIds = enrollments.map(e => e.student);

    await Course.findByIdAndUpdate(courseId, {
      $set: { students: studentIds },
    });
  } catch (error) {
    console.error(`Error syncing students for course ${courseId}:`, error);
  }
};

const getAllCourses = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });
  if (req.query.professor) criteria.professor = req.query.professor;
  if (req.query.department) criteria.department = req.query.department;
  if (req.query.name) criteria.name = new RegExp(req.query.name, 'i');

  let courses = await Course.find(criteria)
    .populate('professor', 'firstName lastName email')
    .populate('department', 'name description')
    .populate('students', 'firstName lastName email')
    .sort({ createdAt: -1 });

  const coursesToSync = courses.filter(
    c => !c.students || c.students.length === 0
  );
  if (coursesToSync.length > 0) {
    await Promise.all(
      coursesToSync.map(c => syncCourseStudents(c._id, req.tenantId))
    );
    const syncedCourseIds = coursesToSync.map(c => c._id);
    const syncedCourses = await Course.find({
      _id: { $in: syncedCourseIds },
    }).populate('students', 'firstName lastName email');

    const syncedMap = new Map(
      syncedCourses.map(sc => [sc._id.toString(), sc.students])
    );
    courses.forEach(course => {
      const syncedStudents = syncedMap.get(course._id.toString());
      if (syncedStudents) {
        course.students = syncedStudents;
      }
    });
  }

  res.json(courses);
});

const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  await assertSameTenantForDoc(Course, id, req.tenantId);

  const course = await Course.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  })
    .populate('professor', 'firstName lastName email')
    .populate('department', 'name description')
    .populate('students', 'firstName lastName email');

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (!course.students || course.students.length === 0) {
    await syncCourseStudents(course._id, req.tenantId);
    await course.populate('students', 'firstName lastName email');
  }

  res.json(course);
});

const createCourse = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'professor']);

  const courseData = {
    ...req.body,
    tenant: req.tenantId,
    createdBy: req.user.id,
  };

  const professorId = req.body.professor;
  const professor = await User.findOne({
    _id: professorId,
    tenant: req.tenantId,
    role: 'professor',
  });

  if (!professor) {
    return res
      .status(400)
      .json({ message: 'Invalid professor ID or not part of tenant' });
  }

  if (req.body.department) {
    const department = await Department.findOne({
      _id: req.body.department,
      tenant: req.tenantId,
      isDeleted: false,
    });

    if (!department) {
      return res.status(400).json({
        message: 'Invalid department ID or department not found in tenant',
      });
    }
  }

  const course = await Course.create(courseData);
  await course.populate('professor', 'firstName lastName email');
  await course.populate('department', 'name description');

  res.status(201).json(course);
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  await assertSameTenantForDoc(Course, id, req.tenantId);

  const course = await Course.findById(id);
  if (!course || course.isDeleted) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (req.body.department) {
    const department = await Department.findOne({
      _id: req.body.department,
      tenant: req.tenantId,
      isDeleted: false,
    });

    if (!department) {
      return res.status(400).json({
        message: 'Invalid department ID or department not found in tenant',
      });
    }
  }

  delete req.body.tenant;
  req.body.updatedBy = req.user.id;

  Object.assign(course, req.body);
  await course.save();

  await course.populate('professor', 'firstName lastName email');
  await course.populate('department', 'name description');
  await course.populate('students', 'firstName lastName email');

  res.json(course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  await assertSameTenantForDoc(Course, id, req.tenantId);

  const course = await Course.findById(id);
  if (!course || course.isDeleted) {
    return res.status(404).json({ message: 'Course not found' });
  }

  course.isDeleted = true;
  course.updatedBy = req.user.id;
  await course.save();

  res.json({ message: 'Course deleted successfully', id: course._id });
});

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  syncCourseStudents,
};
