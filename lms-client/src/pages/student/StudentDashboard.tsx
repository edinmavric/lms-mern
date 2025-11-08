import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react';

import { enrollmentsApi } from '../../lib/api/enrollments';
import { gradesApi } from '../../lib/api/grades';
import { attendanceApi } from '../../lib/api/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

export function StudentDashboard() {
  const { user } = useAuthStore();

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

  const myEnrollments = enrollments.filter(
    enrollment =>
      (typeof enrollment.student === 'string'
        ? enrollment.student
        : enrollment.student._id) === user?._id
  );

  const myGrades = grades.filter(
    grade =>
      (typeof grade.student === 'string'
        ? grade.student
        : grade.student._id) === user?._id
  );

  const myAttendances = attendances.filter(
    attendance =>
      (typeof attendance.student === 'string'
        ? attendance.student
        : attendance.student._id) === user?._id
  );

  const stats = {
    totalEnrollments: myEnrollments.length,
    activeEnrollments: myEnrollments.filter(e => e.status === 'active').length,
    completedEnrollments: myEnrollments.filter(e => e.status === 'completed')
      .length,
    totalGrades: myGrades.length,
    averageGrade:
      myGrades.length > 0
        ? myGrades.reduce((sum, g) => sum + g.value, 0) / myGrades.length
        : 0,
    totalAttendance: myAttendances.length,
    presentAttendance: myAttendances.filter(a => a.status === 'present').length,
    attendanceRate:
      myAttendances.length > 0
        ? (myAttendances.filter(a => a.status === 'present').length /
            myAttendances.length) *
          100
        : 0,
  };

  const dashboardCards = [
    {
      title: 'My Courses',
      description: `${stats.activeEnrollments} active courses`,
      icon: BookOpen,
      href: '#', // TODO: Create student courses page
      stats: {
        active: stats.activeEnrollments,
        completed: stats.completedEnrollments,
      },
    },
    {
      title: 'My Grades',
      description: `Average: ${stats.averageGrade.toFixed(2)}`,
      icon: Award,
      href: '#', // TODO: Create student grades page
      stats: {
        total: stats.totalGrades,
        average: stats.averageGrade.toFixed(2),
      },
    },
    {
      title: 'My Attendance',
      description: `${stats.attendanceRate.toFixed(1)}% attendance rate`,
      icon: ClipboardCheck,
      href: '#', // TODO: Create student attendance page
      stats: {
        present: stats.presentAttendance,
        total: stats.totalAttendance,
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
          Here's an overview of your academic progress
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEnrollments}</div>
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
              {stats.totalGrades} grades received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.attendanceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.presentAttendance} present out of {stats.totalAttendance}
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
