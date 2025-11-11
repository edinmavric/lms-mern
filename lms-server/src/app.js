const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const auth = require('./middleware/auth');
const tenant = require('./middleware/tenant');
const error = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimit');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const lessonMaterialRoutes = require('./routes/lessonMaterialRoutes');
const bankAccountRoutes = require('./routes/bankAccountRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const pointRoutes = require('./routes/pointRoutes');
const examRoutes = require('./routes/examRoutes');
const examSubscriptionRoutes = require('./routes/examSubscriptionRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const docsRoutes = require('./routes/docsRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const videoCallRoutes = require('./routes/videoCallRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus =
    mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  if (dbStatus === 'connected') {
    return res.json({
      ok: true,
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    ok: false,
    database: 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api-docs', docsRoutes);

app.use('/api/auth', authRoutes);

app.use(auth);
app.use(apiLimiter);
app.use(tenant);

app.use('/api/tenants', tenantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/lesson-materials', lessonMaterialRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exam-subscriptions', examSubscriptionRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/video-calls', videoCallRoutes);

app.use(error);

module.exports = app;
