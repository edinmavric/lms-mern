import { isAxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  FileText,
  BookOpen,
  User,
  Link as LinkIcon,
  Video,
  Image,
  Presentation,
  Folder,
  ExternalLink,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

import { lessonsApi } from '../../lib/api/lessons';
import { lessonMaterialsApi } from '../../lib/api/lessonMaterials';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { videoCallsApi } from '../../lib/api/videoCalls';
import { useAuthStore } from '../../store/authStore';
import { getMaterialUrl } from '../../lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

const getMaterialTypeIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return FileText;
    case 'video':
      return Video;
    case 'presentation':
      return Presentation;
    case 'link':
      return LinkIcon;
    case 'document':
      return FileText;
    case 'image':
      return Image;
    default:
      return Folder;
  }
};

const getMaterialTypeLabel = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'PDF';
    case 'video':
      return 'Video';
    case 'presentation':
      return 'Presentation';
    case 'link':
      return 'Link';
    case 'document':
      return 'Document';
    case 'image':
      return 'Image';
    default:
      return 'Other';
  }
};

export function StudentLessonDetail() {
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

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => enrollmentsApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const { data: lessonMaterials = [] } = useQuery({
    queryKey: ['lessonMaterials', 'lesson', id],
    queryFn: () => lessonMaterialsApi.list({ lesson: id }),
    enabled: !!id,
  });

  const { data: activeVideoCall, isLoading: activeVideoCallLoading } = useQuery(
    {
      queryKey: ['video-calls', 'lesson', id],
      queryFn: async () => {
        if (!id) return null;
        try {
          return await videoCallsApi.getActiveForLesson(id);
        } catch (err) {
          if (isAxiosError(err) && err.response?.status === 404) {
            return null;
          }
          throw err;
        }
      },
      enabled: !!id,
      staleTime: 15_000,
    }
  );

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
        <Button onClick={() => navigate('/app/student/lessons')}>
          Back to My Lessons
        </Button>
      </div>
    );
  }

  const courseId =
    typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
  const enrollment = enrollments.find(
    e =>
      (typeof e.course === 'string' ? e.course : e.course._id) === courseId &&
      e.status !== 'cancelled'
  );

  if (!enrollment) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">
              You are not enrolled in this course. Please enroll to view lesson
              details.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/student/lessons')}>
          Back to My Lessons
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof lesson.course === 'string') {
      return 'Unknown Course';
    }
    return lesson.course.name || 'Unknown Course';
  };

  const getProfessorName = () => {
    if (!lesson.course || typeof lesson.course === 'string') {
      return 'Unknown Professor';
    }
    if (!lesson.course.professor) {
      return 'Unknown Professor';
    }
    if (typeof lesson.course.professor === 'string') {
      return 'Unknown Professor';
    }
    return `${lesson.course.professor.firstName} ${lesson.course.professor.lastName}`;
  };

  const lessonDate = new Date(lesson.date);
  const [startHour = 0, startMinute = 0] = lesson.startTime
    .split(':')
    .map(Number);
  const [endHour = 0, endMinute = 0] = lesson.endTime.split(':').map(Number);

  const lessonStart = new Date(lessonDate);
  lessonStart.setHours(startHour, startMinute, 0, 0);

  const lessonEnd = new Date(lessonDate);
  lessonEnd.setHours(endHour, endMinute, 0, 0);

  const now = new Date();
  const isLessonUpcoming = now < lessonStart;
  const isLessonActive = now >= lessonStart && now <= lessonEnd;
  const badgeVariant = isLessonActive
    ? 'default'
    : isLessonUpcoming
    ? 'secondary'
    : 'outline';
  const badgeLabel = isLessonActive
    ? 'Live'
    : isLessonUpcoming
    ? 'Upcoming'
    : 'Past';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/student/lessons')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {getCourseName()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          <Button
            variant="outline"
            onClick={() => navigate(`/app/student/courses/${courseId}`)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Course
          </Button>
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
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-base font-semibold mt-1">{lesson.title}</p>
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
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">
                  {format(lessonDate, 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">
                  {format(lessonStart, 'p')} – {format(lessonEnd, 'p')}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-primary/40 bg-primary/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Video className="h-4 w-4" />
                  Live Video Session
                </div>
                {activeVideoCall && <Badge variant="default">Live</Badge>}
              </div>

              {activeVideoCallLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking live session status...
                </div>
              ) : activeVideoCall ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    Your professor has started a live session for this lesson.
                  </p>
                  <Button
                    onClick={() =>
                      navigate(`/app/video-calls/${activeVideoCall._id}`, {
                        state: { from: `/app/student/lessons/${lesson._id}` },
                      })
                    }
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Live Call
                  </Button>
                </div>
              ) : isLessonActive ? (
                <p className="text-sm text-muted-foreground">
                  The lesson is in progress. The live call will appear as soon
                  as your professor starts it.
                </p>
              ) : isLessonUpcoming ? (
                <p className="text-sm text-muted-foreground">
                  The live call will become available when the lesson begins{' '}
                  {formatDistanceToNow(lessonStart, { addSuffix: true })}.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This lesson has ended. No live sessions are currently active.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
                Course
              </p>
              <div className="flex items-center gap-2 mt-1">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-base font-semibold">{getCourseName()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Professor
              </p>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">{getProfessorName()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lessonMaterials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lesson Materials ({lessonMaterials.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lessonMaterials.map(material => {
                const TypeIcon = getMaterialTypeIcon(material.type);
                return (
                  <div
                    key={material._id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                        <Badge variant="outline">
                          {getMaterialTypeLabel(material.type)}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-base mb-1">
                      {material.name}
                    </h3>
                    {material.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                    {(() => {
                      const materialUrl = getMaterialUrl(material);
                      return materialUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(materialUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Material
                        </Button>
                      ) : null;
                    })()}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
