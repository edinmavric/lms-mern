import { useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Users,
  BookOpen,
  X,
  FileText,
  GraduationCap,
  Award,
  ClipboardCheck,
  Wallet,
  Building2,
  ClipboardList,
  Target,
  Activity,
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
  roles?: ('admin' | 'professor' | 'student')[];
}

export function Sidebar({ open, onClose, mobile = false }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const userRole = user?.role;

  const adminNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/app',
      icon: HomeIcon,
      roles: ['admin'],
    },
    {
      label: 'Users',
      href: '/app/admin/users',
      icon: Users,
      roles: ['admin'],
    },
    {
      label: 'Departments',
      href: '/app/admin/departments',
      icon: Building2,
      roles: ['admin'],
    },
    {
      label: 'Courses',
      href: '/app/admin/courses',
      icon: BookOpen,
      roles: ['admin', 'professor'],
    },
    {
      label: 'Lessons',
      href: '/app/admin/lessons',
      icon: FileText,
      roles: ['admin', 'professor'],
    },
    {
      label: 'Enrollments',
      href: '/app/admin/enrollments',
      icon: GraduationCap,
      roles: ['admin', 'professor'],
    },
    {
      label: 'Grades',
      href: '/app/admin/grades',
      icon: Award,
      roles: ['admin', 'professor'],
    },
    {
      label: 'Attendance',
      href: '/app/admin/attendances',
      icon: ClipboardCheck,
      roles: ['admin', 'professor'],
    },
    {
      label: 'Bank Accounts',
      href: '/app/admin/bank-accounts',
      icon: Wallet,
      roles: ['admin'],
    },
    {
      label: 'Activity Logs',
      href: '/app/admin/activity-logs',
      icon: Activity,
      roles: ['admin'],
    },
  ];

  const professorNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/app',
      icon: HomeIcon,
      roles: ['professor'],
    },
    {
      label: 'My Courses',
      href: '/app/professor/courses',
      icon: BookOpen,
      roles: ['professor'],
    },
    {
      label: 'My Lessons',
      href: '/app/professor/lessons',
      icon: FileText,
      roles: ['professor'],
    },
    {
      label: 'My Exams',
      href: '/app/professor/exams',
      icon: ClipboardList,
      roles: ['professor'],
    },
    {
      label: 'Points',
      href: '/app/professor/points',
      icon: Target,
      roles: ['professor'],
    },
    {
      label: 'My Grades',
      href: '/app/professor/grades',
      icon: Award,
      roles: ['professor'],
    },
  ];

  const studentNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/app',
      icon: HomeIcon,
      roles: ['student'],
    },
    {
      label: 'My Courses',
      href: '/app/student/courses',
      icon: BookOpen,
      roles: ['student'],
    },
    {
      label: 'My Lessons',
      href: '/app/student/lessons',
      icon: FileText,
      roles: ['student'],
    },
    {
      label: 'My Exams',
      href: '/app/student/exams',
      icon: ClipboardList,
      roles: ['student'],
    },
    {
      label: 'My Points',
      href: '/app/student/points',
      icon: Target,
      roles: ['student'],
    },
    {
      label: 'My Grades',
      href: '/app/student/grades',
      icon: Award,
      roles: ['student'],
    },
    {
      label: 'My Enrollments',
      href: '/app/student/enrollments',
      icon: GraduationCap,
      roles: ['student'],
    },
  ];

  const getNavItems = (): NavItem[] => {
    if (userRole === 'admin') {
      return adminNavItems;
    }
    if (userRole === 'professor') {
      return professorNavItems;
    }
    if (userRole === 'student') {
      return studentNavItems;
    }
    return [];
  };

  const navItems = getNavItems();

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
