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
