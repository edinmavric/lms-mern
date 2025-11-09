import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  ClipboardCheck,
  Wallet,
  TrendingUp,
  Activity,
} from 'lucide-react';

import { usersApi } from '../../lib/api/users';
import { coursesApi } from '../../lib/api/courses';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { gradesApi } from '../../lib/api/grades';
import { attendanceApi } from '../../lib/api/attendance';
import { bankAccountsApi } from '../../lib/api/bankAccounts';
import { activityLogsApi } from '../../lib/api/activityLogs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

export function AdminDashboard() {
  const { user } = useAuthStore();

  const { data: users = [] } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersApi.list({}),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'all'],
    queryFn: () => enrollmentsApi.list({}),
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['grades', 'all'],
    queryFn: () => gradesApi.list({}),
  });

  const { data: attendances = [] } = useQuery({
    queryKey: ['attendances', 'all'],
    queryFn: () => attendanceApi.list({}),
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts', 'all'],
    queryFn: () => bankAccountsApi.list({}),
  });

  const { data: activityLogsStats } = useQuery({
    queryKey: ['activityLogs', 'stats', 7],
    queryFn: () => activityLogsApi.getStats(7),
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    activeEnrollments: enrollments.filter(e => e.status === 'active').length,
    totalGrades: grades.length,
    averageGrade:
      grades.length > 0
        ? grades.reduce((sum, g) => sum + g.value, 0) / grades.length
        : 0,
    totalAttendance: attendances.length,
    presentAttendance: attendances.filter(a => a.status === 'present').length,
    totalBankAccounts: bankAccounts.length,
    primaryBankAccounts: bankAccounts.filter(a => a.isPrimary).length,
  };

  const dashboardCards = [
    {
      title: 'Users',
      description: `${stats.totalUsers} total users`,
      icon: Users,
      href: '/app/admin/users',
      stats: {
        active: stats.activeUsers,
        pending: stats.pendingUsers,
      },
    },
    {
      title: 'Courses',
      description: `${stats.totalCourses} courses`,
      icon: BookOpen,
      href: '/app/admin/courses',
    },
    {
      title: 'Enrollments',
      description: `${stats.activeEnrollments} active enrollments`,
      icon: GraduationCap,
      href: '/app/admin/enrollments',
      stats: {
        total: stats.totalEnrollments,
        active: stats.activeEnrollments,
      },
    },
    {
      title: 'Grades',
      description: `Average: ${stats.averageGrade.toFixed(2)}`,
      icon: Award,
      href: '/app/admin/grades',
      stats: {
        total: stats.totalGrades,
        average: stats.averageGrade.toFixed(2),
      },
    },
    {
      title: 'Attendance',
      description: `${stats.presentAttendance} present records`,
      icon: ClipboardCheck,
      href: '/app/admin/attendances',
      stats: {
        total: stats.totalAttendance,
        present: stats.presentAttendance,
      },
    },
    {
      title: 'Bank Accounts',
      description: `${stats.primaryBankAccounts} primary account(s)`,
      icon: Wallet,
      href: '/app/admin/bank-accounts',
      stats: {
        total: stats.totalBankAccounts,
        primary: stats.primaryBankAccounts,
      },
    },
    {
      title: 'Activity Logs',
      description: `${
        activityLogsStats?.actionStats.reduce(
          (sum, stat) => sum + stat.count,
          0
        ) || 0
      } actions (7 days)`,
      icon: Activity,
      href: '/app/admin/activity-logs',
      stats: {
        total:
          activityLogsStats?.actionStats.reduce(
            (sum, stat) => sum + stat.count,
            0
          ) || 0,
        critical:
          activityLogsStats?.severityStats.find(s => s._id === 'critical')
            ?.count || 0,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your LMS platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active, {stats.pendingUsers} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEnrollments} total enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageGrade.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalGrades} total grades
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map(card => (
            <Link
              key={card.title}
              to={card.href}
              className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            >
              <Card className="p-6 hover:border-primary/50 hover:shadow-lg transition-all h-full">
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-muted-foreground mb-4">{card.description}</p>
                {card.stats && (
                  <div className="flex gap-4 text-sm">
                    {Object.entries(card.stats).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground capitalize">
                          {key}:
                        </span>{' '}
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
