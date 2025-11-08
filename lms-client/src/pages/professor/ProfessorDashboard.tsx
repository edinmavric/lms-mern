import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Award, TrendingUp } from 'lucide-react';

import { coursesApi } from '../../lib/api/courses';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { gradesApi } from '../../lib/api/grades';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

export function ProfessorDashboard() {
  const { user } = useAuthStore();

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

  const myCourses = courses.filter(course =>
    typeof course.professor === 'string'
      ? course.professor === user?._id
      : course.professor?._id === user?._id
  );

  const myEnrollments = enrollments.filter(enrollment =>
    myCourses.some(
      course =>
        (typeof enrollment.course === 'string'
          ? enrollment.course
          : enrollment.course._id) === course._id
    )
  );

  const myGrades = grades.filter(
    grade =>
      (typeof grade.professor === 'string'
        ? grade.professor
        : grade.professor?._id) === user?._id
  );

  const stats = {
    totalCourses: myCourses.length,
    totalEnrollments: myEnrollments.length,
    activeEnrollments: myEnrollments.filter(e => e.status === 'active').length,
    totalGrades: myGrades.length,
    averageGrade:
      myGrades.length > 0
        ? myGrades.reduce((sum, g) => sum + g.value, 0) / myGrades.length
        : 0,
  };

  const dashboardCards = [
    {
      title: 'My Courses',
      description: `${stats.totalCourses} courses`,
      icon: BookOpen,
      href: '/app/professor/courses',
    },
    {
      title: 'My Lessons',
      description: 'Manage your lessons',
      icon: FileText,
      href: '/app/professor/lessons',
    },
    {
      title: 'My Grades',
      description: `Average: ${stats.averageGrade.toFixed(2)}`,
      icon: Award,
      href: '/app/professor/grades',
      stats: {
        total: stats.totalGrades,
        average: stats.averageGrade.toFixed(2),
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
          Here's an overview of your courses and students
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEnrollments} active students
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
              {stats.totalGrades} grades recorded
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
