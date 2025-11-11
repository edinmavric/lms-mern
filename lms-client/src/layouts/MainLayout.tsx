import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../lib/api/notifications';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { Sidebar } from '../components/Sidebar';
import { Button, Dialog, DialogContent, DialogFooter } from '../components/ui';
import { cn } from '../lib/utils';

export function MainLayout() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { clearAuth, user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: recentNotifications = [] } = useQuery({
    queryKey: ['notifications', 'my', { limit: 3 }],
    queryFn: () => notificationsApi.my({ page: 1, limit: 3 }),
    staleTime: 60_000,
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    clearAuth();
    try {
      queryClient.clear();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {!isMobile && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          mobile={false}
        />
      )}

      {isMobile && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          mobile={true}
        />
      )}

      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          !isMobile && sidebarOpen && 'lg:pl-64'
        )}
      >
        <header className="bg-card text-card-foreground shadow-sm border-b border-border sticky top-0 z-30">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  aria-label="Toggle sidebar"
                  className="shrink-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-lg sm:text-2xl font-semibold truncate">
                  LMS++
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/app/notifications')}
                    className="relative shrink-0"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                  <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto w-72">
                    <div className="rounded-md bg-popover border border-border text-popover-foreground shadow-md">
                      <div className="px-3 py-2 border-b border-border font-semibold text-sm">
                        Notifications
                      </div>
                      <div className="max-h-64 overflow-auto">
                        {recentNotifications.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No recent notifications
                          </div>
                        ) : (
                          recentNotifications.map(n => (
                            <button
                              key={n._id}
                              className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors"
                              onClick={() => navigate(`/app/notifications`)}
                            >
                              <div className="text-sm font-medium truncate">
                                {n.title}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {n.content}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="px-3 py-2 border-t border-border">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate('/app/notifications')}
                        >
                          View all
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {user && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="hidden sm:inline truncate max-w-[120px] md:max-w-none">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="hidden md:inline">({user.role})</span>
                  </div>
                )}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLogoutDialog(true)}
                    className="relative shrink-0"
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
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
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
