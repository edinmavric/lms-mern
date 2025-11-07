import { Outlet, useNavigate } from 'react-router-dom';

import { ThemeToggle } from '../components/ThemeToggle';
import { Button, Link } from '../components/ui';

export function PublicLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xl font-semibold text-foreground hover:text-primary"
          >
            LMS Platform
          </button>

          <div className="flex items-center gap-4">
            <Link to="/login" variant="muted">
              Log in
            </Link>
            <Link to="/signup" variant="muted">
              Join an organisation
            </Link>
            <Button size="sm" onClick={() => navigate('/signup/tenant')}>
              Start as organisation
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} LMS Platform. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/signup" variant="muted">
                Request access
              </Link>
              <Link to="/signup/tenant" variant="muted">
                Become a partner
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

