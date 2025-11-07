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
      // {
      //   path: 'courses',
      //   element: <Courses />,
      // },
      // {
      //   path: 'grades',
      //   element: <Grades />,
      // },
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
