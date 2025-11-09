import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Search,
  Loader2,
  TrendingUp,
  Calendar,
  User,
} from 'lucide-react';

import { gradesApi } from '../../lib/api/grades';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { coursesApi } from '../../lib/api/courses';
import { useAuthStore } from '../../store/authStore';
import type { Grade, Course } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Button,
} from '../../components/ui';

interface CourseGradeSummary {
  course: Course;
  grades: Grade[];
  averageGrade: number;
  latestGrade: Grade | null;
  totalGrades: number;
}

export function StudentGradesList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchName, setSearchName] = useState('');

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => enrollmentsApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const { data: allGrades = [], isLoading: gradesLoading } = useQuery({
    queryKey: ['grades', 'my'],
    queryFn: () => gradesApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const { data: allCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const enrolledCourseIds = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return [];
    return enrollments
      .filter(e => e && e.status !== 'cancelled')
      .map(e => {
        if (!e.course) return null;
        return typeof e.course === 'string' ? e.course : e.course._id;
      })
      .filter((id): id is string => id !== null);
  }, [enrollments]);

  const enrolledCourses = useMemo(() => {
    if (!allCourses || !Array.isArray(allCourses)) return [];
    return allCourses.filter(c => enrolledCourseIds.includes(c._id));
  }, [allCourses, enrolledCourseIds]);

  const courseGradeSummaries = useMemo(() => {
    if (!allGrades || !Array.isArray(allGrades)) return [];
    if (!enrolledCourses || enrolledCourses.length === 0) return [];

    const courseMap = new Map<string, CourseGradeSummary>();

    enrolledCourses.forEach(course => {
      courseMap.set(course._id, {
        course,
        grades: [],
        averageGrade: 0,
        latestGrade: null,
        totalGrades: 0,
      });
    });

    allGrades.forEach((grade: Grade) => {
      const courseId =
        typeof grade.course === 'string' ? grade.course : grade.course._id;
      const summary = courseMap.get(courseId);
      if (summary) {
        summary.grades.push(grade);
      }
    });

    courseMap.forEach(summary => {
      if (summary.grades.length > 0) {
        summary.totalGrades = summary.grades.length;
        summary.averageGrade =
          summary.grades.reduce((sum, g) => sum + g.value, 0) /
          summary.grades.length;

        summary.latestGrade = summary.grades.reduce((latest, current) => {
          if (!latest) return current;
          return new Date(current.date) > new Date(latest.date)
            ? current
            : latest;
        }, null as Grade | null);
      }
    });

    return Array.from(courseMap.values());
  }, [allGrades, enrolledCourses]);

  const { coursesWithGrades, coursesWithoutGrades } = useMemo(() => {
    const withGrades: CourseGradeSummary[] = [];
    const withoutGrades: Course[] = [];

    courseGradeSummaries.forEach(summary => {
      if (summary.grades.length > 0) {
        withGrades.push(summary);
      } else {
        withoutGrades.push(summary.course);
      }
    });

    const filteredWithGrades = searchName
      ? withGrades.filter(s =>
          s.course.name.toLowerCase().includes(searchName.toLowerCase())
        )
      : withGrades;

    const filteredWithoutGrades = searchName
      ? withoutGrades.filter(c =>
          c.name.toLowerCase().includes(searchName.toLowerCase())
        )
      : withoutGrades;

    filteredWithGrades.sort((a, b) => {
      if (!a.latestGrade || !b.latestGrade) return 0;
      return (
        new Date(b.latestGrade.date).getTime() -
        new Date(a.latestGrade.date).getTime()
      );
    });

    filteredWithoutGrades.sort((a, b) => a.name.localeCompare(b.name));

    return {
      coursesWithGrades: filteredWithGrades,
      coursesWithoutGrades: filteredWithoutGrades,
    };
  }, [courseGradeSummaries, searchName]);

  const getProfessorName = (grade: Grade): string => {
    if (!grade.professor) return 'Unknown Professor';
    if (typeof grade.professor === 'string') return 'Unknown Professor';
    return `${grade.professor.firstName} ${grade.professor.lastName}`;
  };

  const getGradeBadgeVariant = (grade: number) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'default';
    if (grade >= 70) return 'warning';
    return 'destructive';
  };

  const overallAverage = useMemo(() => {
    if (coursesWithGrades.length === 0) return 0;
    const totalAverage =
      coursesWithGrades.reduce((sum, s) => sum + s.averageGrade, 0) /
      coursesWithGrades.length;
    return totalAverage;
  }, [coursesWithGrades]);

  const isLoading = enrollmentsLoading || gradesLoading || coursesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Grades</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View all your grades across all courses
          </p>
        </div>
        {coursesWithGrades.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Overall Average</p>
              <p className="text-2xl font-bold">{overallAverage.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search courses..."
            icon={<Search className="h-4 w-4" />}
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
        </div>
      </div>

      {coursesWithGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Graded Courses ({coursesWithGrades.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Course
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Latest Grade
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Average Grade
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Total Grades
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Latest Date
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Professor
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coursesWithGrades.map(summary => (
                    <tr
                      key={summary.course._id}
                      className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        navigate(`/app/student/courses/${summary.course._id}`)
                      }
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {summary.course.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {summary.latestGrade && (
                          <Badge
                            variant={getGradeBadgeVariant(
                              summary.latestGrade.value
                            )}
                          >
                            {summary.latestGrade.value}
                            {summary.latestGrade.attempt > 1 &&
                              ` (Attempt ${summary.latestGrade.attempt})`}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getGradeBadgeVariant(summary.averageGrade)}
                          >
                            {summary.averageGrade.toFixed(2)}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {summary.totalGrades}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {summary.latestGrade && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(
                                summary.latestGrade.date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {summary.latestGrade && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{getProfessorName(summary.latestGrade)}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(
                              `/app/student/courses/${summary.course._id}`
                            );
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {coursesWithoutGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ungraded Courses ({coursesWithoutGrades.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Course
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coursesWithoutGrades.map(course => {
                    const enrollment = enrollments.find(
                      e =>
                        (typeof e.course === 'string'
                          ? e.course
                          : e.course._id) === course._id
                    );

                    return (
                      <tr
                        key={course._id}
                        className="border-b cursor-pointer hover:bg-muted/50 transition-colors opacity-75"
                        onClick={() =>
                          navigate(`/app/student/courses/${course._id}`)
                        }
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{course.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">No grades yet</Badge>
                            {enrollment && (
                              <Badge
                                variant={
                                  enrollment.status === 'active'
                                    ? 'success'
                                    : enrollment.status === 'completed'
                                    ? 'default'
                                    : 'warning'
                                }
                              >
                                {enrollment.status}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/app/student/courses/${course._id}`);
                            }}
                          >
                            View Course
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {coursesWithGrades.length === 0 && coursesWithoutGrades.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchName
                ? 'No courses match your search criteria.'
                : "You're not enrolled in any courses yet. Enroll in a course to see your grades."}
            </p>
            {!searchName && (
              <Button onClick={() => navigate('/app/student/courses')}>
                Browse Courses
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
