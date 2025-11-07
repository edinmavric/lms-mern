import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card text-card-foreground shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">LMS Platform</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-card text-card-foreground border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Learning Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
