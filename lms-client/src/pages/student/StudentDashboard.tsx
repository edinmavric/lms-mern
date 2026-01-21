import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Star,
  Video,
  ArrowRight,
} from 'lucide-react';

import { enrollmentsApi } from '../../lib/api/enrollments';
import { gradesApi } from '../../lib/api/grades';
import { attendanceApi } from '../../lib/api/attendance';
import { lessonsApi } from '../../lib/api/lessons';
import { pointsApi } from '../../lib/api/points';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import type { Course, Lesson, Point, Grade } from '../../types';

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

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: () => lessonsApi.list({}),
  });

  const { data: points = [] } = useQuery({
    queryKey: ['points', 'all'],
    queryFn: () => pointsApi.list({}),
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

  const myPoints = points.filter(
    (point: Point) =>
      (typeof point.student === 'string'
        ? point.student
        : point.student._id) === user?._id
  );

  // Get course IDs from enrollments for lesson filtering
  const myCourseIds = myEnrollments
    .filter(e => e.status === 'active')
    .map(e => (typeof e.course === 'string' ? e.course : e.course._id));

  // Filter upcoming lessons for my courses (next 7 days)
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingLessons = lessons
    .filter((lesson: Lesson) => {
      const courseId =
        typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
      const lessonDate = new Date(lesson.date);
      return (
        myCourseIds.includes(courseId) &&
        lessonDate >= now &&
        lessonDate <= sevenDaysFromNow
      );
    })
    .sort(
      (a: Lesson, b: Lesson) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .slice(0, 5);

  // Get recent grades (last 5)
  const recentGrades = [...myGrades]
    .sort(
      (a: Grade, b: Grade) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Calculate points summary
  const totalPoints = myPoints.reduce((sum: number, p: Point) => sum + p.points, 0);
  const maxPossiblePoints = myPoints.reduce(
    (sum: number, p: Point) => sum + p.maxPoints,
    0
  );
  const pointsPercentage =
    maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints) * 100 : 0;

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
    totalPoints,
    maxPossiblePoints,
    pointsPercentage,
  };

  const dashboardCards = [
    {
      title: 'My Courses',
      description: `${stats.activeEnrollments} active courses`,
      icon: BookOpen,
      href: '/app/student/courses',
      stats: {
        active: stats.activeEnrollments,
        completed: stats.completedEnrollments,
      },
    },
    {
      title: 'My Grades',
      description: `Average: ${stats.averageGrade.toFixed(2)}`,
      icon: Award,
      href: '/app/student/grades',
      stats: {
        total: stats.totalGrades,
        average: stats.averageGrade.toFixed(2),
      },
    },
    {
      title: 'My Attendance',
      description: `${stats.attendanceRate.toFixed(1)}% attendance rate`,
      icon: ClipboardCheck,
      href: '/app/student/enrollments',
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPoints}/{stats.maxPossiblePoints}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pointsPercentage.toFixed(1)}% achieved
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Lessons
            </CardTitle>
            <Link to="/app/student/lessons">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming lessons in the next 7 days
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingLessons.map((lesson: Lesson) => {
                  const course =
                    typeof lesson.course === 'object'
                      ? (lesson.course as Course)
                      : null;
                  return (
                    <Link
                      key={lesson._id}
                      to={`/app/student/lessons/${lesson._id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        {course && (
                          <p className="text-sm text-muted-foreground">
                            {course.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(lesson.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.startTime} - {lesson.endTime}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Grades
            </CardTitle>
            <Link to="/app/student/grades">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentGrades.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No grades received yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentGrades.map((grade: Grade) => {
                  const course =
                    typeof grade.course === 'object'
                      ? (grade.course as Course)
                      : null;
                  return (
                    <Link
                      key={grade._id}
                      to={`/app/student/grades/${grade._id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{grade.type}</p>
                        {course && (
                          <p className="text-sm text-muted-foreground">
                            {course.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={grade.value >= 6 ? 'default' : 'destructive'}
                        >
                          {grade.value}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(grade.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-4 p-6 border rounded-lg bg-card">
        <Video className="h-8 w-8 text-primary" />
        <div className="flex-1">
          <h3 className="font-semibold">Need help with your studies?</h3>
          <p className="text-sm text-muted-foreground">
            Book a consultation with your professor
          </p>
        </div>
        <Link to="/app/student/consultations">
          <Button>Book Consultation</Button>
        </Link>
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
