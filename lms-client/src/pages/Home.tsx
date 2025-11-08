import { useAuthStore } from '../store/authStore';
import { AdminDashboard } from './admin/AdminDashboard';
import { ProfessorDashboard } from './professor/ProfessorDashboard';
import { StudentDashboard } from './student/StudentDashboard';

export function Home() {
  const { user } = useAuthStore();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'professor') {
    return <ProfessorDashboard />;
  }

  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome!</h1>
        <p className="text-muted-foreground mt-2">
          Please contact an administrator to set up your account.
        </p>
      </div>
    </div>
  );
}
