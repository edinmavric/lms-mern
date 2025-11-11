import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { Home } from '../pages/Home';
import { Landing } from '../pages/Landing';
import { SignupIndividual } from '../pages/SignupIndividual';
import { SignupTenant } from '../pages/SignupTenant';
import { Login } from '../pages/Login';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { NotFound } from '../pages/NotFound';
import { Unauthorized } from '../pages/Unauthorized';
import { PendingApproval } from '../pages/PendingApproval';
import { UsersList } from '../pages/admin/UsersList';
import { UserEdit } from '../pages/admin/UserEdit';
import { UserDetail } from '../pages/admin/UserDetail';
import { CoursesList } from '../pages/admin/CoursesList';
import { CourseEdit } from '../pages/admin/CourseEdit';
import { CourseDetail } from '../pages/admin/CourseDetail';
import { LessonsList } from '../pages/admin/LessonsList';
import { LessonEdit } from '../pages/admin/LessonEdit';
import { LessonDetail } from '../pages/admin/LessonDetail';
import { EnrollmentsList } from '../pages/admin/EnrollmentsList';
import { EnrollmentEdit } from '../pages/admin/EnrollmentEdit';
import { EnrollmentDetail } from '../pages/admin/EnrollmentDetail';
import { GradesList } from '../pages/admin/GradesList';
import { GradeEdit } from '../pages/admin/GradeEdit';
import { GradeDetail } from '../pages/admin/GradeDetail';
import { AttendancesList } from '../pages/admin/AttendancesList';
import { AttendanceEdit } from '../pages/admin/AttendanceEdit';
import { AttendanceDetail } from '../pages/admin/AttendanceDetail';
import { BankAccountsList } from '../pages/admin/BankAccountsList';
import { BankAccountEdit } from '../pages/admin/BankAccountEdit';
import { BankAccountDetail } from '../pages/admin/BankAccountDetail';
import { DepartmentsList } from '../pages/admin/DepartmentsList';
import { ActivityLogsList } from '../pages/admin/ActivityLogsList';
import { ActivityLogDetail } from '../pages/admin/ActivityLogDetail';
import { DepartmentEdit } from '../pages/admin/DepartmentEdit';
import { DepartmentDetail } from '../pages/admin/DepartmentDetail';
import { LessonMaterialEdit } from '../pages/admin/LessonMaterialEdit';
import { EnrollmentPaymentApproval } from '../pages/admin/EnrollmentPaymentApproval';
import { ExamsList } from '../pages/admin/ExamsList';
import { ExamDetail } from '../pages/admin/ExamDetail';
import { ExamEdit } from '../pages/admin/ExamEdit';
import { PointsList } from '../pages/admin/PointsList';
import { PointDetail } from '../pages/admin/PointDetail';
import { PointEdit } from '../pages/admin/PointEdit';
import { ExamSubscriptionsList } from '../pages/admin/ExamSubscriptionsList';
import { ExamSubscriptionDetail } from '../pages/admin/ExamSubscriptionDetail';
import { LessonMaterialsList } from '../pages/admin/LessonMaterialsList';
import { LessonMaterialDetail } from '../pages/admin/LessonMaterialDetail';
import { StudentCourses } from '../pages/student/StudentCourses';
import { StudentCourseDetail } from '../pages/student/StudentCourseDetail';
import { StudentEnrollmentsList } from '../pages/student/StudentEnrollmentsList';
import { StudentLessonsList } from '../pages/student/StudentLessonsList';
import { StudentGradesList } from '../pages/student/StudentGradesList';
import { StudentExamsList } from '../pages/student/StudentExamsList';
import { StudentPointsList } from '../pages/student/StudentPointsList';
import { StudentEnrollmentDetail } from '../pages/student/StudentEnrollmentDetail';
import { StudentLessonDetail } from '../pages/student/StudentLessonDetail';
import { StudentGradeDetail } from '../pages/student/StudentGradeDetail';
import { StudentExamDetail } from '../pages/student/StudentExamDetail';
import { StudentPointDetail } from '../pages/student/StudentPointDetail';
import { ProfessorCoursesList } from '../pages/professor/ProfessorCoursesList';
import { ProfessorCourseDetail } from '../pages/professor/ProfessorCourseDetail';
import { ProfessorLessonsList } from '../pages/professor/ProfessorLessonsList';
import { ProfessorLessonDetail } from '../pages/professor/ProfessorLessonDetail';
import { ProfessorGradesList } from '../pages/professor/ProfessorGradesList';
import { ProfessorGradeDetail } from '../pages/professor/ProfessorGradeDetail';
import { ProfessorExamsList } from '../pages/professor/ProfessorExamsList';
import { ProfessorExamDetail } from '../pages/professor/ProfessorExamDetail';
import { ProfessorPointsList } from '../pages/professor/ProfessorPointsList';
import { ProfessorPointDetail } from '../pages/professor/ProfessorPointDetail';
import { ProfessorPointEdit } from '../pages/professor/ProfessorPointEdit';
import { ProfessorAttendancesList } from '../pages/professor/ProfessorAttendancesList';
import { ProfessorAttendanceDetail } from '../pages/professor/ProfessorAttendanceDetail';
import { ProfessorAttendanceEdit } from '../pages/professor/ProfessorAttendanceEdit';
import { ProfessorLessonMaterialsList } from '../pages/professor/ProfessorLessonMaterialsList';
import { ProfessorLessonMaterialDetail } from '../pages/professor/ProfessorLessonMaterialDetail';
import { ProfessorLessonMaterialEdit } from '../pages/professor/ProfessorLessonMaterialEdit';
import { ProfessorExamSubscriptionsList } from '../pages/professor/ProfessorExamSubscriptionsList';
import { ProfessorExamSubscriptionDetail } from '../pages/professor/ProfessorExamSubscriptionDetail';
import { ProfessorLessonEdit } from '../pages/professor/ProfessorLessonEdit';
import { ProfessorExamEdit } from '../pages/professor/ProfessorExamEdit';
import { ProfessorGradeEdit } from '../pages/professor/ProfessorGradeEdit';
import { NotificationsList } from '../pages/NotificationsList';
import { ProfessorConsultationsList } from '../pages/professor/ProfessorConsultationsList';
import { StudentConsultationsList } from '../pages/student/StudentConsultationsList';
import { AdminConsultationsList } from '../pages/admin/AdminConsultationsList';

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
            <NotificationsList />
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
