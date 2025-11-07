import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { Button, Dialog, DialogContent, DialogFooter } from '../components/ui';

export function MainLayout() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const { clearAuth, user } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card text-card-foreground shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">LMS Platform</h1>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">
                  {user.firstName} {user.lastName}
                </span>
                <span className="hidden md:inline text-xs">({user.role})</span>
              </div>
            )}
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLogoutDialog(true)}
                className="relative"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                <div className="whitespace-nowrap rounded-md bg-popover border border-border px-3 py-1.5 text-sm text-popover-foreground shadow-md">
                  Logout
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
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

      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title="Confirm Logout"
        description="Are you sure you want to logout? You'll need to sign in again to access your account."
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
