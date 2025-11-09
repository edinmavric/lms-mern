import { useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Users,
  BookOpen,
  X,
  FileText,
  GraduationCap,
  Award,
  Building2,
  ClipboardList,
  Target,
  Activity,
  Banknote,
  CalendarCheck,
  FolderOpen,
  UserCheck,
  DollarSign,
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

interface MenuGroup {
  label: string;
  items: NavItem[];
}

export function Sidebar({ open, onClose, mobile = false }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const userRole = user?.role;

  const adminMenuGroups: MenuGroup[] = [
    {
      label: 'Administration',
      items: [
        {
          label: 'Dashboard',
          href: '/app',
          icon: HomeIcon,
          roles: ['admin'],
        },
      ],
    },
    {
      label: 'Users & Enrollment',
      items: [
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
          label: 'Enrollments',
          href: '/app/admin/enrollments',
          icon: GraduationCap,
          roles: ['admin'],
        },
      ],
    },
    {
      label: 'Academics',
      items: [
        {
          label: 'Courses',
          href: '/app/admin/courses',
          icon: BookOpen,
          roles: ['admin'],
        },
        {
          label: 'Lessons',
          href: '/app/admin/lessons',
          icon: FileText,
          roles: ['admin'],
        },
        {
          label: 'Lesson Materials',
          href: '/app/admin/lesson-materials',
          icon: FolderOpen,
          roles: ['admin'],
        },
        {
          label: 'Exams',
          href: '/app/admin/exams',
          icon: ClipboardList,
          roles: ['admin'],
        },
        {
          label: 'Grades',
          href: '/app/admin/grades',
          icon: Award,
          roles: ['admin'],
        },
        {
          label: 'Points',
          href: '/app/admin/points',
          icon: Target,
          roles: ['admin'],
        },
      ],
    },
    {
      label: 'Attendance & Tracking',
      items: [
        {
          label: 'Attendance',
          href: '/app/admin/attendances',
          icon: CalendarCheck,
          roles: ['admin'],
        },
        {
          label: 'Exam Subscriptions',
          href: '/app/admin/exam-subscriptions',
          icon: UserCheck,
          roles: ['admin'],
        },
        {
          label: 'Activity Logs',
          href: '/app/admin/activity-logs',
          icon: Activity,
          roles: ['admin'],
        },
      ],
    },
    {
      label: 'Finance',
      items: [
        {
          label: 'Bank Accounts',
          href: '/app/admin/bank-accounts',
          icon: Banknote,
          roles: ['admin'],
        },
        {
          label: 'Payment Approval',
          href: '/app/admin/enrollment-payment-approval',
          icon: DollarSign,
          roles: ['admin'],
        },
      ],
    },
  ];

  const professorMenuGroups: MenuGroup[] = [
    {
      label: 'Administration',
      items: [
        {
          label: 'Dashboard',
          href: '/app',
          icon: HomeIcon,
          roles: ['professor'],
        },
      ],
    },
    {
      label: 'Academics',
      items: [
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
          label: 'Lesson Materials',
          href: '/app/professor/lesson-materials',
          icon: FolderOpen,
          roles: ['professor'],
        },
        {
          label: 'My Exams',
          href: '/app/professor/exams',
          icon: ClipboardList,
          roles: ['professor'],
        },
        {
          label: 'My Grades',
          href: '/app/professor/grades',
          icon: Award,
          roles: ['professor'],
        },
        {
          label: 'Points',
          href: '/app/professor/points',
          icon: Target,
          roles: ['professor'],
        },
      ],
    },
    {
      label: 'Attendance & Tracking',
      items: [
        {
          label: 'Attendance',
          href: '/app/professor/attendances',
          icon: CalendarCheck,
          roles: ['professor'],
        },
        {
          label: 'Exam Subscriptions',
          href: '/app/professor/exam-subscriptions',
          icon: UserCheck,
          roles: ['professor'],
        },
      ],
    },
  ];

  const studentMenuGroups: MenuGroup[] = [
    {
      label: 'Administration',
      items: [
        {
          label: 'Dashboard',
          href: '/app',
          icon: HomeIcon,
          roles: ['student'],
        },
      ],
    },
    {
      label: 'Academics',
      items: [
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
          label: 'My Grades',
          href: '/app/student/grades',
          icon: Award,
          roles: ['student'],
        },
        {
          label: 'My Points',
          href: '/app/student/points',
          icon: Target,
          roles: ['student'],
        },
      ],
    },
    {
      label: 'Users & Enrollment',
      items: [
        {
          label: 'My Enrollments',
          href: '/app/student/enrollments',
          icon: GraduationCap,
          roles: ['student'],
        },
      ],
    },
  ];

  const getMenuGroups = (): MenuGroup[] => {
    if (userRole === 'admin') {
      return adminMenuGroups;
    }
    if (userRole === 'professor') {
      return professorMenuGroups;
    }
    if (userRole === 'student') {
      return studentMenuGroups;
    }
    return [];
  };

  const menuGroups = getMenuGroups();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border overflow-hidden">
      <div
        className={cn(
          'flex items-center justify-between border-b border-border flex-shrink-0',
          mobile ? 'p-6' : 'p-4'
        )}
      >
        <h2
          className={cn(
            'font-semibold text-foreground',
            mobile ? 'text-xl' : 'text-lg'
          )}
        >
          LMS Platform
        </h2>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>

      <nav
        className={cn('flex-1 overflow-y-auto min-h-0', mobile ? 'p-6' : 'p-4')}
      >
        <div className={cn('space-y-6', mobile ? 'space-y-6' : 'space-y-4')}>
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <h3
                className={cn(
                  'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                  mobile ? 'px-4 mb-2' : 'px-3 mb-1'
                )}
              >
                {group.label}
              </h3>
              <div className={cn('space-y-1', mobile && 'space-y-3')}>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== '/app' &&
                      location.pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={mobile ? onClose : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg font-medium transition-colors',
                        mobile ? 'px-4 py-4 text-base' : 'px-3 py-2 text-sm',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className={cn(mobile ? 'h-6 w-6' : 'h-5 w-5')} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
