import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { NotFound } from '../pages/NotFound';
import { Unauthorized } from '../pages/Unauthorized';
import { PendingApproval } from '../pages/PendingApproval';

const router = createBrowserRouter([
  {
    path: '/',
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
