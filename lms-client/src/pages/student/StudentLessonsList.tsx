import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  BookOpen,
  Loader2,
  Search,
} from 'lucide-react';

import { lessonsApi } from '../../lib/api/lessons';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { useAuthStore } from '../../store/authStore';
import type { Lesson } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Button,
} from '../../components/ui';

export function StudentLessonsList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTitle, setSearchTitle] = useState('');

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => enrollmentsApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const { data: allLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: () => lessonsApi.list({}),
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

  const myLessons = useMemo(() => {
    if (!allLessons || !Array.isArray(allLessons)) return [];
    if (!enrolledCourseIds || enrolledCourseIds.length === 0) return [];
    
    return allLessons.filter(lesson => {
      if (!lesson || !lesson.course) return false;
      const lessonCourseId =
        typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
      return enrolledCourseIds.includes(lessonCourseId);
    });
  }, [allLessons, enrolledCourseIds]);

  const filteredLessons = useMemo(() => {
    if (!myLessons || !Array.isArray(myLessons)) return [];
    if (!searchTitle) return myLessons;
    return myLessons.filter(lesson =>
      lesson?.title?.toLowerCase().includes(searchTitle.toLowerCase())
    );
  }, [myLessons, searchTitle]);

  const { scheduledLessons, passedLessons } = useMemo(() => {
    const now = new Date();
    const scheduled: Lesson[] = [];
    const passed: Lesson[] = [];

    if (!filteredLessons || !Array.isArray(filteredLessons)) {
      return { scheduledLessons: scheduled, passedLessons: passed };
    }

    filteredLessons.forEach((lesson: Lesson) => {
      if (!lesson || !lesson.date || !lesson.startTime) return;
      
      try {
        const lessonDate = new Date(lesson.date);
        if (isNaN(lessonDate.getTime())) return;
        
        const timeParts = lesson.startTime.split(':');
        if (timeParts.length !== 2) return;
        
        const [startHours, startMinutes] = timeParts.map(Number);
        if (isNaN(startHours) || isNaN(startMinutes)) return;
        
        const lessonDateTime = new Date(lessonDate);
        lessonDateTime.setHours(startHours, startMinutes, 0, 0);

        if (lessonDateTime >= now) {
          scheduled.push(lesson);
        } else {
          passed.push(lesson);
        }
      } catch (error) {
        console.error('Error processing lesson:', error, lesson);
      }
    });

    scheduled.sort((a, b) => {
      try {
        const dateA = new Date(a.date + 'T' + a.startTime);
        const dateB = new Date(b.date + 'T' + b.startTime);
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    });

    passed.sort((a, b) => {
      try {
        const dateA = new Date(a.date + 'T' + a.startTime);
        const dateB = new Date(b.date + 'T' + b.startTime);
        return dateB.getTime() - dateA.getTime();
      } catch {
        return 0;
      }
    });

    return { scheduledLessons: scheduled, passedLessons: passed };
  }, [filteredLessons]);

  const getCourseName = (lesson: Lesson): string => {
    if (!lesson || !lesson.course) return 'Unknown Course';
    
    if (typeof lesson.course === 'string') {
      const enrollment = enrollments.find(
        e => {
          if (!e || !e.course) return false;
          const courseId = typeof e.course === 'string' ? e.course : e.course._id;
          return courseId === lesson.course;
        }
      );
      if (enrollment && typeof enrollment.course !== 'string' && enrollment.course?.name) {
        return enrollment.course.name;
      }
      return 'Unknown Course';
    }
    
    if (lesson.course && typeof lesson.course === 'object' && 'name' in lesson.course) {
      return lesson.course.name || 'Unknown Course';
    }
    
    return 'Unknown Course';
  };

  const getCourseId = (lesson: Lesson): string | null => {
    if (!lesson || !lesson.course) return null;
    return typeof lesson.course === 'string'
      ? lesson.course
      : lesson.course._id || null;
  };

  const isLoading = enrollmentsLoading || lessonsLoading;

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
          <h1 className="text-2xl md:text-3xl font-bold">My Lessons</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View your scheduled and past lessons
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search lessons..."
            icon={<Search className="h-4 w-4" />}
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
          />
        </div>
      </div>

      {scheduledLessons && scheduledLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Lessons ({scheduledLessons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledLessons
                .map((lesson: Lesson) => {
                  const courseId = getCourseId(lesson);
                  if (!courseId) return null;
                  
                  return (
                    <div
                      key={lesson._id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/student/lessons/${lesson._id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base">
                              {lesson.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              Upcoming
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{getCourseName(lesson)}</span>
                          </div>
                          {lesson.content && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {lesson.content}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(lesson.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
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
                  );
                })
                .filter((item): item is React.ReactElement => item !== null)}
            </div>
          </CardContent>
        </Card>
      )}

      {passedLessons && passedLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Past Lessons ({passedLessons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {passedLessons
                .map((lesson: Lesson) => {
                  const courseId = getCourseId(lesson);
                  if (!courseId) return null;
                  
                  return (
                    <div
                      key={lesson._id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer opacity-75"
                      onClick={() => navigate(`/app/student/lessons/${lesson._id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base">
                              {lesson.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              Past
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{getCourseName(lesson)}</span>
                          </div>
                          {lesson.content && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {lesson.content}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(lesson.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
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
                  );
                })
                .filter((item): item is React.ReactElement => item !== null)}
            </div>
          </CardContent>
        </Card>
      )}

      {(!scheduledLessons || scheduledLessons.length === 0) && (!passedLessons || passedLessons.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Lessons Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTitle
                ? 'No lessons match your search criteria.'
                : "You don't have any lessons yet. Enroll in a course to see lessons."}
            </p>
            {!searchTitle && (
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

