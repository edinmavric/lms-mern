import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  UserRound,
  Calendar,
  FileText,
  Award,
  ClipboardCheck,
  Clock,
} from 'lucide-react';

import { coursesApi } from '../../lib/api/courses';
import { lessonsApi } from '../../lib/api/lessons';
import { gradesApi } from '../../lib/api/grades';
import { attendanceApi } from '../../lib/api/attendance';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { useAuthStore } from '../../store/authStore';
import type { Course } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

export function StudentCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getById(id!),
    enabled: !!id,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', 'course', id],
    queryFn: () => lessonsApi.list({ course: id }),
    enabled: !!id,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => enrollmentsApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const { data: allGrades = [] } = useQuery({
    queryKey: ['grades', 'my'],
    queryFn: () => gradesApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const { data: allAttendances = [] } = useQuery({
    queryKey: ['attendances', 'my'],
    queryFn: () => attendanceApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const courseGrades = allGrades.filter(
    grade =>
      (typeof grade.course === 'string' ? grade.course : grade.course._id) ===
      id
  );

  const courseLessonIds = lessons.map(l => l._id);

  const courseAttendances = allAttendances.filter(attendance => {
    if (typeof attendance.lesson === 'string') {
      return courseLessonIds.includes(attendance.lesson);
    }
    if (typeof attendance.lesson === 'object' && attendance.lesson) {
      const lessonCourseId =
        typeof attendance.lesson.course === 'string'
          ? attendance.lesson.course
          : attendance.lesson.course?._id;
      const lessonId = attendance.lesson._id;
      return lessonCourseId === id || courseLessonIds.includes(lessonId);
    }
    return false;
  });

  const enrollment = enrollments.find(
    e => (typeof e.course === 'string' ? e.course : e.course._id) === id
  );

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Course not found</p>
            <p className="text-sm">
              The course you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/student/courses')}>
          Back to My Courses
        </Button>
      </div>
    );
  }

  if (!enrollment || enrollment.status === 'cancelled') {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Not Enrolled</p>
            <p className="text-sm">
              You are not enrolled in this course. Please enroll to view course
              details.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/student/courses')}>
          Back to My Courses
        </Button>
      </div>
    );
  }

  const getProfessorName = (professor: Course['professor']) => {
    if (typeof professor === 'string') return 'Unknown Professor';
    return `${professor.firstName} ${professor.lastName}`;
  };

  const getProfessorEmail = (professor: Course['professor']) => {
    if (typeof professor === 'string') return '';
    return professor.email;
  };

  const getDepartmentName = () => {
    if (!course.department) return null;
    if (typeof course.department === 'string') return 'Unknown Department';
    return course.department.name;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'paused':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'destructive';
      case 'late':
        return 'warning';
      case 'excused':
        return 'default';
      default:
        return 'outline';
    }
  };

  const averageGrade =
    courseGrades.length > 0
      ? courseGrades.reduce((sum, g) => sum + g.value, 0) / courseGrades.length
      : 0;

  const attendanceStats = {
    total: courseAttendances.length,
    present: courseAttendances.filter(a => a.status === 'present').length,
    absent: courseAttendances.filter(a => a.status === 'absent').length,
    late: courseAttendances.filter(a => a.status === 'late').length,
    excused: courseAttendances.filter(a => a.status === 'excused').length,
    rate:
      courseAttendances.length > 0
        ? (courseAttendances.filter(a => a.status === 'present').length /
            courseAttendances.length) *
          100
        : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/student/courses')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{course.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Course Details
            </p>
          </div>
        </div>
        {enrollment && (
          <Badge variant={getStatusBadgeVariant(enrollment.status)}>
            {enrollment.status}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lessons
                </p>
                <p className="text-2xl font-bold">{lessons.length}</p>
              </div>
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Grades
                </p>
                <p className="text-2xl font-bold">{courseGrades.length}</p>
              </div>
              <Award className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Grade
                </p>
                <p className="text-2xl font-bold">
                  {averageGrade > 0 ? averageGrade.toFixed(2) : 'N/A'}
                </p>
              </div>
              <Award className="h-6 w-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold">
                  {attendanceStats.rate.toFixed(1)}%
                </p>
              </div>
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course Name
              </p>
              <p className="text-base font-semibold mt-1">{course.name}</p>
            </div>
            {course.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-base mt-1">{course.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <p className="text-base font-semibold mt-1">
                {course.price ? `$${course.price.toFixed(2)}` : 'Free'}
              </p>
            </div>
            {getDepartmentName() && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Department
                </p>
                <p className="text-base mt-1">{getDepartmentName()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Professor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Professor
              </p>
              <p className="text-base font-semibold mt-1">
                {getProfessorName(course.professor)}
              </p>
              {getProfessorEmail(course.professor) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {getProfessorEmail(course.professor)}
                </p>
              )}
            </div>
            {enrollment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Enrollment Status
                </p>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                    {enrollment.status}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {course.schedule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {course.schedule.days && course.schedule.days.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Days
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {course.schedule.days.map((day, idx) => (
                      <Badge key={idx} variant="outline">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {course.schedule.startTime && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Start Time
                  </p>
                  <p className="text-base mt-1">{course.schedule.startTime}</p>
                </div>
              )}
              {course.schedule.endTime && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    End Time
                  </p>
                  <p className="text-base mt-1">{course.schedule.endTime}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {lessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lessons.map(lesson => (
                <div
                  key={lesson._id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">
                        {lesson.title}
                      </h3>
                      {lesson.content && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {lesson.content}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(lesson.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {lesson.startTime} - {lesson.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {courseGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              My Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseGrades.map(grade => (
                <div
                  key={grade._id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">
                          Grade: {grade.value}
                        </h3>
                        {grade.attempt && (
                          <Badge variant="outline">
                            Attempt {grade.attempt}
                          </Badge>
                        )}
                      </div>
                      {grade.comment && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {grade.comment}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Date: {new Date(grade.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {courseAttendances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              My Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{attendanceStats.total}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-success">
                  Present
                </p>
                <p className="text-2xl font-bold text-success">
                  {attendanceStats.present}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-destructive">
                  Absent
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {attendanceStats.absent}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-warning">
                  Late
                </p>
                <p className="text-2xl font-bold text-warning">
                  {attendanceStats.late}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {courseAttendances.map(attendance => {
                let lessonTitle = 'Unknown Lesson';
                let lessonDate = new Date(attendance.date).toLocaleDateString();

                if (
                  typeof attendance.lesson === 'object' &&
                  attendance.lesson
                ) {
                  lessonTitle = attendance.lesson.title || 'Unknown Lesson';
                  if (attendance.lesson.date) {
                    lessonDate = new Date(
                      attendance.lesson.date
                    ).toLocaleDateString();
                  }
                } else if (typeof attendance.lesson === 'string') {
                  const lesson = lessons.find(l => l._id === attendance.lesson);
                  if (lesson) {
                    lessonTitle = lesson.title;
                    lessonDate = new Date(lesson.date).toLocaleDateString();
                  }
                }

                return (
                  <div
                    key={attendance._id}
                    className="flex items-center justify-between border border-border rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">{lessonTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {lessonDate}
                      </p>
                    </div>
                    <Badge
                      variant={getAttendanceStatusBadge(attendance.status)}
                    >
                      {attendance.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {lessons.length === 0 &&
        courseGrades.length === 0 &&
        courseAttendances.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No course content available yet.
            </CardContent>
          </Card>
        )}
    </div>
  );
}
