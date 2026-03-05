import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Award,
  TrendingUp,
  Users,
  ClipboardCheck,
  Calendar,
  Video,
  ArrowRight,
} from 'lucide-react';

import { coursesApi } from '../../lib/api/courses';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { gradesApi } from '../../lib/api/grades';
import { lessonsApi } from '../../lib/api/lessons';
import { attendanceApi } from '../../lib/api/attendance';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { GradeDistributionChart } from '../../components/charts/GradeDistributionChart';
import { AttendanceStatusChart } from '../../components/charts/AttendanceStatusChart';
import type { Lesson, Course } from '../../types';

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

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: () => lessonsApi.list({}),
  });

  const { data: attendances = [] } = useQuery({
    queryKey: ['attendances', 'all'],
    queryFn: () => attendanceApi.list({}),
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

  const myCourseIds = myCourses.map(c => c._id);

  const myLessons = lessons.filter((lesson: Lesson) => {
    const courseId =
      typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
    return myCourseIds.includes(courseId);
  });

  const myAttendances = attendances.filter(attendance => {
    const lesson = typeof attendance.lesson === 'object' ? attendance.lesson as Lesson : null;
    if (!lesson) return false;
    const courseId = typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
    return myCourseIds.includes(courseId);
  });

  // Get today's lessons
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysLessons = myLessons
    .filter((lesson: Lesson) => {
      const lessonDate = new Date(lesson.date);
      lessonDate.setHours(0, 0, 0, 0);
      return lessonDate >= today && lessonDate < tomorrow;
    })
    .sort((a: Lesson, b: Lesson) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

  // Calculate attendance rate
  const attendanceRate =
    myAttendances.length > 0
      ? (myAttendances.filter(a => a.status === 'present').length /
          myAttendances.length) *
        100
      : 0;

  const stats = {
    totalCourses: myCourses.length,
    totalEnrollments: myEnrollments.length,
    activeEnrollments: myEnrollments.filter(e => e.status === 'active').length,
    totalGrades: myGrades.length,
    averageGrade:
      myGrades.length > 0
        ? myGrades.reduce((sum, g) => sum + g.value, 0) / myGrades.length
        : 0,
    totalLessons: myLessons.length,
    attendanceRate,
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLessons} lessons created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
              {stats.totalGrades} grades recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.attendanceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              across all my courses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Lessons
            </CardTitle>
            <Link to="/app/professor/lessons">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todaysLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No lessons scheduled for today
              </p>
            ) : (
              <div className="space-y-3">
                {todaysLessons.slice(0, 5).map((lesson: Lesson) => {
                  const course =
                    typeof lesson.course === 'object'
                      ? (lesson.course as Course)
                      : null;
                  return (
                    <Link
                      key={lesson._id}
                      to={`/app/professor/lessons/${lesson._id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{lesson.title}</p>
                        {course && (
                          <p className="text-sm text-muted-foreground truncate">
                            {course.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        <p className="text-sm font-medium">
                          {lesson.startTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.endTime}
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GradeDistributionChart grades={myGrades} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceStatusChart attendances={myAttendances} />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-4 p-6 border rounded-lg bg-card">
        <Video className="h-8 w-8 text-primary" />
        <div className="flex-1">
          <h3 className="font-semibold">Start a Video Call</h3>
          <p className="text-sm text-muted-foreground">
            Connect with your students through video conferencing
          </p>
        </div>
        <Link to="/app/professor/video-calls">
          <Button>View Video Calls</Button>
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
