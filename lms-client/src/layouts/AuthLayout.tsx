import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">LMS Platform</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Learning Management System
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
