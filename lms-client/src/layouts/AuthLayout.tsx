import { Outlet } from 'react-router-dom';

import { PublicHeader } from '../components/PublicHeader';
import { Link } from '../components/ui';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} LMS++. All rights reserved.
            </p>
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
