import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';

import { lessonsApi } from '../../lib/api/lessons';
import { coursesApi } from '../../lib/api/courses';
import { useAuthStore } from '../../store/authStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
} from '../../components/ui';

export function ProfessorLessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    data: lesson,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonsApi.getById(id!),
    enabled: !!id,
  });

  // Verify the lesson belongs to a course the professor teaches
  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
    enabled: !!user?._id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Lesson not found</p>
            <p className="text-sm">
              The lesson you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/lessons')}>
          Back to My Lessons
        </Button>
      </div>
    );
  }

  // Verify that the lesson belongs to a course the professor teaches
  const lessonCourseId =
    typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
  const isMyLesson = myCourses.some(course => course._id === lessonCourseId);

  if (!isMyLesson) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">
              This lesson does not belong to any of your courses.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/lessons')}>
          Back to My Lessons
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof lesson.course === 'string') {
      const course = myCourses.find(c => c._id === lesson.course);
      return course?.name || 'Unknown Course';
    }
    return lesson.course.name || 'Unknown Course';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/professor/lessons')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Lesson Details
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lesson Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Lesson Title
              </p>
              <p className="text-base font-semibold mt-1">{lesson.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course
              </p>
              <p className="text-base mt-1">{getCourseName()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-base mt-1">
                {new Date(lesson.date).toLocaleDateString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start Time
                </p>
                <p className="text-base mt-1">{lesson.startTime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  End Time
                </p>
                <p className="text-base mt-1">{lesson.endTime}</p>
              </div>
            </div>
            {lesson.content && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Content
                </p>
                <p className="text-base mt-1 whitespace-pre-wrap">
                  {lesson.content}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date
                </p>
                <p className="text-base">
                  {new Date(lesson.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Time
                </p>
                <p className="text-base">
                  {lesson.startTime} - {lesson.endTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
