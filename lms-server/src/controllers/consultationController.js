const Consultation = require('../models/Consultation');
const Course = require('../models/Course');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllConsultations = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });
  if (req.query.professorId) criteria.professor = req.query.professorId;
  if (req.query.courseId) criteria.courses = req.query.courseId;
  if (req.query.status) criteria.status = req.query.status;
  if (req.query.upcoming === 'true') criteria.date = { $gte: new Date() };

  const consultations = await Consultation.find(criteria)
    .populate('professor', 'firstName lastName email')
    .populate('courses', 'name')
    .populate('registeredStudents.student', 'firstName lastName email')
    .sort({ date: 1, startTime: 1 });

  res.json(consultations);
});

const getConsultationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid consultation ID' });
  }

  await assertSameTenantForDoc(Consultation, id, req.tenantId);

  const consultation = await Consultation.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  })
    .populate('professor', 'firstName lastName email')
    .populate('courses', 'name')
    .populate('registeredStudents.student', 'firstName lastName email');

  if (!consultation) {
    return res.status(404).json({ message: 'Consultation not found' });
  }
  res.json(consultation);
});

const createConsultation = asyncHandler(async (req, res) => {
  requireFields(req.body, [
    'title',
    'date',
    'startTime',
    'endTime',
    'roomNumber',
  ]);

  const data = {
    ...req.body,
    tenant: req.tenantId,
    createdBy: req.user.id,
    professor: req.body.professor || req.user.id,
  };

  if (data.courses?.length) {
    const count = await Course.countDocuments({
      _id: { $in: data.courses },
      tenant: req.tenantId,
      isDeleted: false,
    });
    if (count !== data.courses.length) {
      return res.status(400).json({ message: 'Invalid course IDs' });
    }
  }

  const consultation = await Consultation.create(data);
  await consultation.populate('professor', 'firstName lastName email');
  await consultation.populate('courses', 'name');
  res.status(201).json(consultation);
});

const updateConsultation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid consultation ID' });
  }
  await assertSameTenantForDoc(Consultation, id, req.tenantId);

  const consultation = await Consultation.findById(id);
  if (!consultation || consultation.isDeleted) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  if (req.body.courses?.length) {
    const count = await Course.countDocuments({
      _id: { $in: req.body.courses },
      tenant: req.tenantId,
      isDeleted: false,
    });
    if (count !== req.body.courses.length) {
      return res.status(400).json({ message: 'Invalid course IDs' });
    }
  }

  delete req.body.tenant;
  delete req.body.professor;
  req.body.updatedBy = req.user.id;

  Object.assign(consultation, req.body);
  await consultation.save();
  await consultation.populate('professor', 'firstName lastName email');
  await consultation.populate('courses', 'name');
  await consultation.populate(
    'registeredStudents.student',
    'firstName lastName email'
  );
  res.json(consultation);
});

const deleteConsultation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid consultation ID' });
  }
  await assertSameTenantForDoc(Consultation, id, req.tenantId);

  const consultation = await Consultation.findById(id);
  if (!consultation || consultation.isDeleted) {
    return res.status(404).json({ message: 'Consultation not found' });
  }
  consultation.isDeleted = true;
  consultation.deletedAt = new Date();
  consultation.updatedBy = req.user.id;
  await consultation.save();
  res.json({
    message: 'Consultation deleted successfully',
    id: consultation._id,
  });
});

const registerForConsultation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid consultation ID' });
  }
  await assertSameTenantForDoc(Consultation, id, req.tenantId);

  const consultation = await Consultation.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  });
  if (!consultation) {
    return res.status(404).json({ message: 'Consultation not found' });
  }
  const userId = req.user.id;
  const already = consultation.registeredStudents.some(
    r => r.student.toString() === userId.toString()
  );
  if (already) {
    return res.status(400).json({ message: 'Already registered' });
  }
  if (
    consultation.maxStudents &&
    consultation.registeredStudents.length >= consultation.maxStudents
  ) {
    return res.status(400).json({ message: 'Consultation is full' });
  }
  consultation.registeredStudents.push({
    student: userId,
    registeredAt: new Date(),
  });
  consultation.updatedBy = userId;
  await consultation.save();
  res.json(consultation);
});

const unregisterFromConsultation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid consultation ID' });
  }
  await assertSameTenantForDoc(Consultation, id, req.tenantId);

  const consultation = await Consultation.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  });
  if (!consultation) {
    return res.status(404).json({ message: 'Consultation not found' });
  }
  const userId = req.user.id;
  consultation.registeredStudents = consultation.registeredStudents.filter(
    r => r.student.toString() !== userId.toString()
  );
  consultation.updatedBy = userId;
  await consultation.save();
  res.json(consultation);
});

module.exports = {
  getAllConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  registerForConsultation,
  unregisterFromConsultation,
};
