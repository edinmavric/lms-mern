import { useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Users,
  BookOpen,
  X,
  FileText,
  GraduationCap,
  Award,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from './ui/Link';
import { Button } from './ui/Button';
import { Sheet, SheetContent } from './ui/Sheet';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  mobile?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

export function Sidebar({ open, onClose, mobile = false }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/app',
      icon: HomeIcon,
    },
    {
      label: 'Users',
      href: '/app/admin/users',
      icon: Users,
      adminOnly: true,
    },
    {
      label: 'Courses',
      href: '/app/admin/courses',
      icon: BookOpen,
      adminOnly: false,
    },
    {
      label: 'Lessons',
      href: '/app/admin/lessons',
      icon: FileText,
      adminOnly: false,
    },
    {
      label: 'Enrollments',
      href: '/app/admin/enrollments',
      icon: GraduationCap,
      adminOnly: false,
    },
    {
      label: 'Grades',
      href: '/app/admin/grades',
      icon: Award,
      adminOnly: false,
    },
  ].filter(item => !item.adminOnly || isAdmin);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">LMS Platform</h2>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/app' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={mobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  if (mobile) {
    return (
      <Sheet open={open} onClose={onClose} side="left">
        <SheetContent>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64 transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <SidebarContent />
    </aside>
  );
}
