import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

import { Home } from '../pages/Home';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { NotFound } from '../pages/NotFound';
import { Unauthorized } from '../pages/Unauthorized';
import { PendingApproval } from '../pages/PendingApproval';

const SignupIndividual = lazy(() => import('../pages/SignupIndividual').then(m => ({ default: m.SignupIndividual })));
const SignupTenant = lazy(() => import('../pages/SignupTenant').then(m => ({ default: m.SignupTenant })));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const UsersList = lazy(() => import('../pages/admin/UsersList').then(m => ({ default: m.UsersList })));
const UserEdit = lazy(() => import('../pages/admin/UserEdit').then(m => ({ default: m.UserEdit })));
const UserDetail = lazy(() => import('../pages/admin/UserDetail').then(m => ({ default: m.UserDetail })));
const CoursesList = lazy(() => import('../pages/admin/CoursesList').then(m => ({ default: m.CoursesList })));
const CourseEdit = lazy(() => import('../pages/admin/CourseEdit').then(m => ({ default: m.CourseEdit })));
const CourseDetail = lazy(() => import('../pages/admin/CourseDetail').then(m => ({ default: m.CourseDetail })));
const LessonsList = lazy(() => import('../pages/admin/LessonsList').then(m => ({ default: m.LessonsList })));
const LessonEdit = lazy(() => import('../pages/admin/LessonEdit').then(m => ({ default: m.LessonEdit })));
const LessonDetail = lazy(() => import('../pages/admin/LessonDetail').then(m => ({ default: m.LessonDetail })));
const EnrollmentsList = lazy(() => import('../pages/admin/EnrollmentsList').then(m => ({ default: m.EnrollmentsList })));
const EnrollmentEdit = lazy(() => import('../pages/admin/EnrollmentEdit').then(m => ({ default: m.EnrollmentEdit })));
const EnrollmentDetail = lazy(() => import('../pages/admin/EnrollmentDetail').then(m => ({ default: m.EnrollmentDetail })));
const GradesList = lazy(() => import('../pages/admin/GradesList').then(m => ({ default: m.GradesList })));
const GradeEdit = lazy(() => import('../pages/admin/GradeEdit').then(m => ({ default: m.GradeEdit })));
const GradeDetail = lazy(() => import('../pages/admin/GradeDetail').then(m => ({ default: m.GradeDetail })));
const AttendancesList = lazy(() => import('../pages/admin/AttendancesList').then(m => ({ default: m.AttendancesList })));
const AttendanceEdit = lazy(() => import('../pages/admin/AttendanceEdit').then(m => ({ default: m.AttendanceEdit })));
const AttendanceDetail = lazy(() => import('../pages/admin/AttendanceDetail').then(m => ({ default: m.AttendanceDetail })));
const BankAccountsList = lazy(() => import('../pages/admin/BankAccountsList').then(m => ({ default: m.BankAccountsList })));
const BankAccountEdit = lazy(() => import('../pages/admin/BankAccountEdit').then(m => ({ default: m.BankAccountEdit })));
const BankAccountDetail = lazy(() => import('../pages/admin/BankAccountDetail').then(m => ({ default: m.BankAccountDetail })));
const DepartmentsList = lazy(() => import('../pages/admin/DepartmentsList').then(m => ({ default: m.DepartmentsList })));
const ActivityLogsList = lazy(() => import('../pages/admin/ActivityLogsList').then(m => ({ default: m.ActivityLogsList })));
const ActivityLogDetail = lazy(() => import('../pages/admin/ActivityLogDetail').then(m => ({ default: m.ActivityLogDetail })));
const DepartmentEdit = lazy(() => import('../pages/admin/DepartmentEdit').then(m => ({ default: m.DepartmentEdit })));
const DepartmentDetail = lazy(() => import('../pages/admin/DepartmentDetail').then(m => ({ default: m.DepartmentDetail })));
const LessonMaterialEdit = lazy(() => import('../pages/admin/LessonMaterialEdit').then(m => ({ default: m.LessonMaterialEdit })));
const EnrollmentPaymentApproval = lazy(() => import('../pages/admin/EnrollmentPaymentApproval').then(m => ({ default: m.EnrollmentPaymentApproval })));
const ExamsList = lazy(() => import('../pages/admin/ExamsList').then(m => ({ default: m.ExamsList })));
const ExamDetail = lazy(() => import('../pages/admin/ExamDetail').then(m => ({ default: m.ExamDetail })));
const ExamEdit = lazy(() => import('../pages/admin/ExamEdit').then(m => ({ default: m.ExamEdit })));
const PointsList = lazy(() => import('../pages/admin/PointsList').then(m => ({ default: m.PointsList })));
const PointDetail = lazy(() => import('../pages/admin/PointDetail').then(m => ({ default: m.PointDetail })));
const PointEdit = lazy(() => import('../pages/admin/PointEdit').then(m => ({ default: m.PointEdit })));
const ExamSubscriptionsList = lazy(() => import('../pages/admin/ExamSubscriptionsList').then(m => ({ default: m.ExamSubscriptionsList })));
const ExamSubscriptionDetail = lazy(() => import('../pages/admin/ExamSubscriptionDetail').then(m => ({ default: m.ExamSubscriptionDetail })));
const LessonMaterialsList = lazy(() => import('../pages/admin/LessonMaterialsList').then(m => ({ default: m.LessonMaterialsList })));
const LessonMaterialDetail = lazy(() => import('../pages/admin/LessonMaterialDetail').then(m => ({ default: m.LessonMaterialDetail })));
const AdminConsultationsList = lazy(() => import('../pages/admin/AdminConsultationsList').then(m => ({ default: m.AdminConsultationsList })));
const StudentCourses = lazy(() => import('../pages/student/StudentCourses').then(m => ({ default: m.StudentCourses })));
const StudentCourseDetail = lazy(() => import('../pages/student/StudentCourseDetail').then(m => ({ default: m.StudentCourseDetail })));
const StudentEnrollmentsList = lazy(() => import('../pages/student/StudentEnrollmentsList').then(m => ({ default: m.StudentEnrollmentsList })));
const StudentLessonsList = lazy(() => import('../pages/student/StudentLessonsList').then(m => ({ default: m.StudentLessonsList })));
const StudentGradesList = lazy(() => import('../pages/student/StudentGradesList').then(m => ({ default: m.StudentGradesList })));
const StudentExamsList = lazy(() => import('../pages/student/StudentExamsList').then(m => ({ default: m.StudentExamsList })));
const StudentPointsList = lazy(() => import('../pages/student/StudentPointsList').then(m => ({ default: m.StudentPointsList })));
const StudentEnrollmentDetail = lazy(() => import('../pages/student/StudentEnrollmentDetail').then(m => ({ default: m.StudentEnrollmentDetail })));
const StudentLessonDetail = lazy(() => import('../pages/student/StudentLessonDetail').then(m => ({ default: m.StudentLessonDetail })));
const StudentGradeDetail = lazy(() => import('../pages/student/StudentGradeDetail').then(m => ({ default: m.StudentGradeDetail })));
const StudentExamDetail = lazy(() => import('../pages/student/StudentExamDetail').then(m => ({ default: m.StudentExamDetail })));
const StudentPointDetail = lazy(() => import('../pages/student/StudentPointDetail').then(m => ({ default: m.StudentPointDetail })));
const StudentConsultationsList = lazy(() => import('../pages/student/StudentConsultationsList').then(m => ({ default: m.StudentConsultationsList })));
const StudentVideoCallsPage = lazy(() => import('../pages/student/StudentVideoCallsPage').then(m => ({ default: m.StudentVideoCallsPage })));
const ProfessorCoursesList = lazy(() => import('../pages/professor/ProfessorCoursesList').then(m => ({ default: m.ProfessorCoursesList })));
const ProfessorCourseDetail = lazy(() => import('../pages/professor/ProfessorCourseDetail').then(m => ({ default: m.ProfessorCourseDetail })));
const ProfessorLessonsList = lazy(() => import('../pages/professor/ProfessorLessonsList').then(m => ({ default: m.ProfessorLessonsList })));
const ProfessorLessonDetail = lazy(() => import('../pages/professor/ProfessorLessonDetail').then(m => ({ default: m.ProfessorLessonDetail })));
const ProfessorGradesList = lazy(() => import('../pages/professor/ProfessorGradesList').then(m => ({ default: m.ProfessorGradesList })));
const ProfessorGradeDetail = lazy(() => import('../pages/professor/ProfessorGradeDetail').then(m => ({ default: m.ProfessorGradeDetail })));
const ProfessorExamsList = lazy(() => import('../pages/professor/ProfessorExamsList').then(m => ({ default: m.ProfessorExamsList })));
const ProfessorExamDetail = lazy(() => import('../pages/professor/ProfessorExamDetail').then(m => ({ default: m.ProfessorExamDetail })));
const ProfessorPointsList = lazy(() => import('../pages/professor/ProfessorPointsList').then(m => ({ default: m.ProfessorPointsList })));
const ProfessorPointDetail = lazy(() => import('../pages/professor/ProfessorPointDetail').then(m => ({ default: m.ProfessorPointDetail })));
const ProfessorPointEdit = lazy(() => import('../pages/professor/ProfessorPointEdit').then(m => ({ default: m.ProfessorPointEdit })));
const ProfessorAttendancesList = lazy(() => import('../pages/professor/ProfessorAttendancesList').then(m => ({ default: m.ProfessorAttendancesList })));
const ProfessorAttendanceDetail = lazy(() => import('../pages/professor/ProfessorAttendanceDetail').then(m => ({ default: m.ProfessorAttendanceDetail })));
const ProfessorAttendanceEdit = lazy(() => import('../pages/professor/ProfessorAttendanceEdit').then(m => ({ default: m.ProfessorAttendanceEdit })));
const ProfessorLessonMaterialsList = lazy(() => import('../pages/professor/ProfessorLessonMaterialsList').then(m => ({ default: m.ProfessorLessonMaterialsList })));
const ProfessorLessonMaterialDetail = lazy(() => import('../pages/professor/ProfessorLessonMaterialDetail').then(m => ({ default: m.ProfessorLessonMaterialDetail })));
const ProfessorLessonMaterialEdit = lazy(() => import('../pages/professor/ProfessorLessonMaterialEdit').then(m => ({ default: m.ProfessorLessonMaterialEdit })));
const ProfessorExamSubscriptionsList = lazy(() => import('../pages/professor/ProfessorExamSubscriptionsList').then(m => ({ default: m.ProfessorExamSubscriptionsList })));
const ProfessorExamSubscriptionDetail = lazy(() => import('../pages/professor/ProfessorExamSubscriptionDetail').then(m => ({ default: m.ProfessorExamSubscriptionDetail })));
const ProfessorLessonEdit = lazy(() => import('../pages/professor/ProfessorLessonEdit').then(m => ({ default: m.ProfessorLessonEdit })));
const ProfessorExamEdit = lazy(() => import('../pages/professor/ProfessorExamEdit').then(m => ({ default: m.ProfessorExamEdit })));
const ProfessorGradeEdit = lazy(() => import('../pages/professor/ProfessorGradeEdit').then(m => ({ default: m.ProfessorGradeEdit })));
const ProfessorConsultationsList = lazy(() => import('../pages/professor/ProfessorConsultationsList').then(m => ({ default: m.ProfessorConsultationsList })));
const ProfessorVideoCallsPage = lazy(() => import('../pages/professor/ProfessorVideoCallsPage').then(m => ({ default: m.ProfessorVideoCallsPage })));

const NotificationsList = lazy(() => import('../pages/NotificationsList').then(m => ({ default: m.NotificationsList })));
const VideoCallRoom = lazy(() => import('../pages/video/VideoCallRoom').then(m => ({ default: m.VideoCallRoom })));

const router = createBrowserRouter([
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <Lazy>
              <NotificationsList />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'video-calls/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'professor', 'student']}>
            <Lazy>
              <VideoCallRoom />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'professor/consultations',
        element: (
          <ProtectedRoute allowedRoles={['professor']}>
            <ProfessorConsultationsList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'student/consultations',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <StudentConsultationsList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/consultations',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminConsultationsList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        children: [
          {
            path: 'users',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'users/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <UserDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'users/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <UserEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'departments',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <DepartmentsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'departments/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <DepartmentDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'departments/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <DepartmentEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'courses',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <CoursesList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'courses/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <CourseDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'courses/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <CourseEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lessons',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <LessonsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lessons/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <LessonDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lessons/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <LessonEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'enrollments',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <EnrollmentsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'enrollments/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <EnrollmentDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'enrollments/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <EnrollmentEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'grades',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <GradesList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'grades/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <GradeDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'grades/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <GradeEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'attendances',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <AttendancesList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'attendances/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <AttendanceDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'attendances/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <AttendanceEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'bank-accounts',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <BankAccountsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'bank-accounts/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <BankAccountDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'bank-accounts/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <BankAccountEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'activity-logs',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <ActivityLogsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'activity-logs/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <ActivityLogDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'enrollment-payment-approval',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <EnrollmentPaymentApproval />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exams',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exams/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exams/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'points',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <PointsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'points/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <PointDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'points/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <PointEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exam-subscriptions',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamSubscriptionsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exam-subscriptions/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamSubscriptionDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lesson-materials',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <LessonMaterialsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lesson-materials/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <LessonMaterialDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lesson-materials/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <LessonMaterialEdit />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'student',
        children: [
          {
            path: 'video-calls',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentVideoCallsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'courses',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCourses />
              </ProtectedRoute>
            ),
          },
          {
            path: 'courses/:id',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCourseDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'enrollments',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentEnrollmentsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'enrollments/:id',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentEnrollmentDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lessons',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLessonsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lessons/:id',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLessonDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'grades',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentGradesList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'grades/:id',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentGradeDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exams',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentExamsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exams/:id',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentExamDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'points',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPointsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'points/:id',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPointDetail />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'professor',
        children: [
          {
            path: 'video-calls',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorVideoCallsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'courses',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorCoursesList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'courses/:id',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorCourseDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lessons',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorLessonsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lessons/:id',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorLessonDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lessons/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorLessonEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'grades',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorGradesList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'grades/:id',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorGradeDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'grades/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorGradeEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exams',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorExamsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exams/:id',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorExamDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exams/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorExamEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'points',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorPointsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'points/:id',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorPointDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'points/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorPointEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'attendances',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorAttendancesList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'attendances/:id',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorAttendanceDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'attendances/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorAttendanceEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lesson-materials',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorLessonMaterialsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lesson-materials/:id',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorLessonMaterialDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: 'lesson-materials/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorLessonMaterialEdit />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exam-subscriptions',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorExamSubscriptionsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'exam-subscriptions/:id',
            element: (
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorExamSubscriptionDetail />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'signup',
        element: (
          <PublicRoute restricted>
            <SignupIndividual />
          </PublicRoute>
        ),
      },
      {
        path: 'signup/tenant',
        element: (
          <PublicRoute restricted>
            <SignupTenant />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicRoute restricted>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute restricted>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        index: true,
        element: <ForgotPassword />,
      },
    ],
  },
  {
    path: '/reset-password',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        index: true,
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: '/pending-approval',
    element: <PendingApproval />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
