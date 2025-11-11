import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MonitorUp, Play } from 'lucide-react';
import { videoCallsApi } from '../../lib/api/videoCalls';
import type { VideoCall } from '../../types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui';
import { formatDistanceToNow } from 'date-fns';

export function StudentVideoCallsPage() {
  const navigate = useNavigate();

  const { data: activeCalls = [], isLoading } = useQuery({
    queryKey: ['video-calls', 'student'],
    queryFn: () => videoCallsApi.list({ status: 'active' }),
    staleTime: 15_000,
  });

  const groupedCalls = useMemo(() => {
    const active: VideoCall[] = [];
    const ended: VideoCall[] = [];

    for (const call of activeCalls) {
      if (call.status === 'active') {
        active.push(call);
      } else {
        ended.push(call);
      }
    }
    return { active, ended };
  }, [activeCalls]);

  const handleJoin = (callId: string) => {
    navigate(`/app/video-calls/${callId}`, {
      state: { from: '/app/student/video-calls' },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Live Sessions</h1>
        <p className="text-sm text-muted-foreground">
          Join live lessons hosted by your professors. Calls appear here once
          your lesson has started.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active calls</CardTitle>
            <p className="text-sm text-muted-foreground">
              Live sessions available to join
            </p>
          </div>
          <Badge variant="secondary">{groupedCalls.active.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : groupedCalls.active.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border/70 p-6 text-center text-muted-foreground">
              <MonitorUp className="h-8 w-8" />
              <div>
                <p className="font-medium text-foreground">
                  No live calls right now
                </p>
                <p className="text-sm">
                  Live sessions will appear here once your lesson begins. Check
                  back closer to the scheduled start time.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {groupedCalls.active.map(call => {
                const lessonTitle =
                  typeof call.lesson === 'string'
                    ? ''
                    : call.lesson?.title ?? '';
                return (
                  <div
                    key={call._id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card/70 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {call.title}
                        </span>
                        <Badge variant="default">Live</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lessonTitle || 'Lesson session'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started{' '}
                        {formatDistanceToNow(new Date(call.startedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Button onClick={() => handleJoin(call._id)}>
                      <Play className="mr-2 h-4 w-4" />
                      Join Live Call
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {groupedCalls.ended.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent calls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupedCalls.ended.map(call => (
              <div
                key={call._id}
                className="flex flex-col gap-1 rounded-md border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <span className="text-foreground">{call.title}</span>
                  <Badge variant="outline">Ended</Badge>
                </div>
                <span>
                  Ended{' '}
                  {formatDistanceToNow(
                    new Date(call.endedAt ?? call.updatedAt),
                    {
                      addSuffix: true,
                    }
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
