import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar, Clock, Play, VideoOff } from 'lucide-react';
import { coursesApi } from '../../lib/api/courses';
import { lessonsApi } from '../../lib/api/lessons';
import { videoCallsApi } from '../../lib/api/videoCalls';
import { useAuthStore } from '../../store/authStore';
import { useVideoCallStore } from '../../store/videoCallStore';
import type { Lesson, VideoCall } from '../../types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui';
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { cn, getErrorMessage } from '../../lib/utils';

interface LessonOption extends Lesson {
  startAt: Date;
  endAt: Date;
}

function buildLessonWindow(lesson: Lesson): { start: Date; end: Date } {
  const date = new Date(lesson.date);
  const [startHour = 0, startMinute = 0] = lesson.startTime
    .split(':')
    .map(Number);
  const [endHour = 0, endMinute = 0] = lesson.endTime.split(':').map(Number);

  const start = new Date(date);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMinute, 0, 0);

  return { start, end };
}

export function ProfessorVideoCallsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { callInfo, activeCall } = useVideoCallStore(state => ({
    callInfo: state.callInfo,
    activeCall: state.activeCall,
  }));

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
    enabled: !!user?._id,
    staleTime: 5 * 60_000,
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', 'course', selectedCourseId],
    queryFn: () => lessonsApi.list({ course: selectedCourseId }),
    enabled: Boolean(selectedCourseId),
    staleTime: 60_000,
  });

  const { data: videoCalls = [], isLoading: callsLoading } = useQuery({
    queryKey: ['video-calls', 'professor'],
    queryFn: () => videoCallsApi.list(),
    staleTime: 30_000,
  });

  const lessonOptions: LessonOption[] = useMemo(() => {
    return lessons
      .map(lesson => {
        const { start, end } = buildLessonWindow(lesson);
        return { ...lesson, startAt: start, endAt: end };
      })
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }, [lessons]);

  const selectedLesson = useMemo(
    () => lessonOptions.find(lesson => lesson._id === selectedLessonId),
    [lessonOptions, selectedLessonId]
  );

  const callForSelectedLesson = useMemo(() => {
    if (!selectedLesson) return null;
    return (
      videoCalls.find(call => {
        const callLessonId =
          typeof call.lesson === 'string' ? call.lesson : call.lesson?._id;
        return callLessonId === selectedLesson._id;
      }) || null
    );
  }, [videoCalls, selectedLesson]);

  const now = new Date();
  const lessonWindowState = useMemo(() => {
    if (!selectedLesson) return 'idle';
    if (isBefore(now, selectedLesson.startAt)) return 'upcoming';
    if (isAfter(now, selectedLesson.endAt)) return 'finished';
    if (
      isWithinInterval(now, {
        start: selectedLesson.startAt,
        end: selectedLesson.endAt,
      })
    ) {
      return 'active';
    }
    return 'idle';
  }, [selectedLesson, now]);

  const createCallMutation = useMutation({
    mutationFn: videoCallsApi.create,
    onSuccess: async (createdCall: VideoCall) => {
      toast.success('Video call created. Redirecting to call room...');
      await queryClient.invalidateQueries({ queryKey: ['video-calls'] });
      navigate(`/app/video-calls/${createdCall._id}`, {
        state: { from: '/app/professor/video-calls' },
      });
    },
    onError: error => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleStartCall = () => {
    if (!selectedLesson) return;
    createCallMutation.mutate({
      lessonId: selectedLesson._id,
      callType: 'default',
    });
  };

  const handleNavigateToActive = (id: string) => {
    navigate(`/app/video-calls/${id}`, {
      state: { from: '/app/professor/video-calls' },
    });
  };

  const isStartDisabled =
    !selectedLesson ||
    lessonWindowState !== 'active' ||
    Boolean(callForSelectedLesson) ||
    createCallMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Live Video Sessions
        </h1>
        <p className="text-muted-foreground">
          Create and manage Stream-powered video calls tied to your lessons.
          Calls can only be launched during the scheduled lesson time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prepare a Live Lesson Call</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Course">
              {coursesLoading ? (
                <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
              ) : (
                <Select
                  value={selectedCourseId}
                  onValueChange={value => {
                    setSelectedCourseId(value);
                    setSelectedLessonId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>

            <FormField label="Lesson">
              {lessonsLoading ? (
                <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
              ) : (
                <Select
                  value={selectedLessonId}
                  onValueChange={setSelectedLessonId}
                  disabled={!selectedCourseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessonOptions.length === 0 && (
                      <SelectItem value="placeholder" disabled>
                        No lessons found for selected course
                      </SelectItem>
                    )}
                    {lessonOptions.map(lesson => (
                      <SelectItem key={lesson._id} value={lesson._id}>
                        <div className="flex flex-col">
                          <span>{lesson.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(lesson.startAt, 'PPP p')} –{' '}
                            {format(lesson.endAt, 'p')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          </div>

          {selectedLesson && (
            <div
              className={cn(
                'rounded-lg border p-4 flex flex-col gap-3',
                lessonWindowState === 'active'
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : lessonWindowState === 'upcoming'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : lessonWindowState === 'finished'
                  ? 'border-destructive/40 bg-destructive/10'
                  : 'border-border bg-muted/30'
              )}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedLesson.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedLesson.startAt, 'PPP p')} –{' '}
                    {format(selectedLesson.endAt, 'p')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {lessonWindowState === 'upcoming' && (
                  <span>Video call will unlock when the lesson begins.</span>
                )}
                {lessonWindowState === 'active' && (
                  <span>
                    The lesson is live. You can start the video call now.
                  </span>
                )}
                {lessonWindowState === 'finished' && (
                  <span>The scheduled lesson time has ended.</span>
                )}
              </div>

              {callForSelectedLesson && (
                <div className="flex items-center justify-between rounded-md border border-primary/50 bg-primary/10 px-4 py-3 text-primary">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Active call already running
                    </span>
                    <span className="text-sm">
                      Continue the existing call instead of creating a new
                      session.
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleNavigateToActive(callForSelectedLesson._id)
                    }
                  >
                    Rejoin
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button
                  onClick={handleStartCall}
                  disabled={isStartDisabled}
                  loading={createCallMutation.isPending}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Stream Call
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live & Recent Calls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {callsLoading ? (
            <div className="space-y-2">
              <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : videoCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border/80 p-6 text-center text-muted-foreground">
              <VideoOff className="h-8 w-8" />
              <div>
                <p className="font-medium text-foreground">
                  No video calls yet
                </p>
                <p className="text-sm">
                  Start a call for a lesson to see it listed here.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-md border border-border/80">
              {videoCalls.map(call => {
                const isActive =
                  call.status === 'active' ||
                  (callInfo && call._id === callInfo._id && activeCall);
                return (
                  <div
                    key={call._id}
                    className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {call.title}
                        </span>
                        <Badge variant={isActive ? 'default' : 'outline'}>
                          {isActive ? 'Live' : 'Ended'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {typeof call.lesson !== 'string'
                          ? call.lesson?.title
                          : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Started {format(new Date(call.startedAt), 'PPP p')}
                        {call.endedAt && (
                          <>
                            {' '}
                            · Ended {format(new Date(call.endedAt), 'PPP p')}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleNavigateToActive(call._id)}
                      >
                        Manage Call
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
