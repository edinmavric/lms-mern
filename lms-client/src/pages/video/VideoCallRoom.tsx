import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  StreamCall,
  SpeakerLayout,
  CallControls,
  CallParticipantsList,
  StreamVideoClient,
} from '@stream-io/video-react-sdk';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, LogOut, MonitorDot } from 'lucide-react';
import { videoCallsApi } from '../../lib/api/videoCalls';
import { useAuthStore } from '../../store/authStore';
import { useVideoCallStore } from '../../store/videoCallStore';
import type { VideoCallTokenResponse } from '../../types';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui';
import { getErrorMessage } from '../../lib/utils';

export function VideoCallRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const {
    client,
    activeCall,
    callInfo,
    role,
    setClient,
    setActiveCall,
    clearCall,
    setDockVisible,
    setIsCallPageActive,
  } = useVideoCallStore(state => ({
    client: state.client,
    activeCall: state.activeCall,
    callInfo: state.callInfo,
    role: state.role,
    setClient: state.setClient,
    setActiveCall: state.setActiveCall,
    clearCall: state.clearCall,
    setDockVisible: state.setDockVisible,
    setIsCallPageActive: state.setIsCallPageActive,
  }));
  const joiningRef = useRef(false);
  const fromPath = (location.state as { from?: string })?.from;
  const fallbackPath =
    user?.role === 'professor'
      ? '/app/professor/video-calls'
      : user?.role === 'student'
      ? '/app/student/video-calls'
      : '/app';

  const {
    data: videoCall,
    isLoading: callLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['video-calls', 'detail', id],
    queryFn: () => videoCallsApi.getById(id ?? ''),
    enabled: Boolean(id),
    staleTime: 15_000,
  });

  const tokenMutation = useMutation({
    mutationFn: (callId: string) => videoCallsApi.token(callId),
    onError: err => {
      toast.error(getErrorMessage(err));
    },
  });

  const endCallMutation = useMutation({
    mutationFn: (callId: string) => videoCallsApi.end(callId),
    onSuccess: async () => {
      toast.success('Video call ended');
      await clearCall();
      await queryClient.invalidateQueries({ queryKey: ['video-calls'] });
      navigate('/app/professor/video-calls');
    },
    onError: err => {
      toast.error(getErrorMessage(err));
    },
  });

  const leaveCall = async () => {
    await clearCall();
    navigate(fromPath || fallbackPath);
  };

  useEffect(() => {
    setIsCallPageActive(true);
    setDockVisible(false);
    return () => {
      setIsCallPageActive(false);
      setDockVisible(true);
    };
  }, [setDockVisible, setIsCallPageActive]);

  useEffect(() => {
    if (!id || !user || !videoCall || joiningRef.current) {
      return;
    }
    if (videoCall.status !== 'active') {
      return;
    }
    const currentCallCid = callInfo?.callCid ?? null;
    if (currentCallCid === videoCall.callCid && activeCall && client) {
      return;
    }

    joiningRef.current = true;
    tokenMutation
      .mutateAsync(id)
      .then(async (tokenResponse: VideoCallTokenResponse) => {
        if (!user) return;

        let streamClient = client;
        if (!streamClient) {
          streamClient = new StreamVideoClient({
            apiKey: tokenResponse.apiKey,
            user: {
              id: user._id,
              name: `${user.firstName} ${user.lastName}`.trim(),
            },
            token: tokenResponse.token,
          });
          setClient(streamClient);
        }

        const call = streamClient.call(
          tokenResponse.call.callType,
          tokenResponse.call.callId
        );

        if (tokenResponse.role === 'host') {
          await call.join({ create: true });
        } else {
          await call.join();
        }

        setActiveCall({
          call,
          callInfo: videoCall,
          role: tokenResponse.role,
          token: tokenResponse.token,
          expiresAt: tokenResponse.expiresAt,
          isDockVisible: false,
        });
      })
      .catch(err => {
        toast.error(getErrorMessage(err));
      })
      .finally(() => {
        joiningRef.current = false;
      });
  }, [
    activeCall,
    callInfo?.callCid,
    client,
    id,
    setActiveCall,
    setClient,
    tokenMutation,
    user,
    videoCall,
  ]);

  const activeStreamCall = useMemo(() => {
    if (!activeCall || !callInfo || !videoCall) return null;
    if (videoCall.callCid !== callInfo.callCid) return null;
    return activeCall;
  }, [activeCall, callInfo, videoCall]);

  const handleEndCall = () => {
    if (!id) return;
    endCallMutation.mutate(id);
  };

  const handleReturnBack = () => {
    navigate(fromPath || fallbackPath);
  };

  if (callLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading video call...</span>
        </div>
      </div>
    );
  }

  if (isError || !videoCall) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Alert variant="destructive">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Video call unavailable</p>
              <p className="text-sm">
                {getErrorMessage(error) ||
                  'We could not load the requested call. It may no longer be active.'}
              </p>
            </div>
          </div>
        </Alert>
        <Button onClick={handleReturnBack}>Go back</Button>
      </div>
    );
  }

  if (videoCall.status !== 'active') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <MonitorDot className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Call is not active</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            This session has ended or is no longer available. If you believe
            this is a mistake, please contact the administrator.
          </p>
        </div>
        <Button onClick={handleReturnBack}>Return</Button>
      </div>
    );
  }

  if (!activeStreamCall) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Connecting to Stream call...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {videoCall.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Powered by Stream Video &mdash; stay connected with your class.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">Live</Badge>
          <Badge variant="outline">
            {role === 'host' ? 'Host' : 'Participant'}
          </Badge>
        </div>
      </div>

      <StreamCall call={activeStreamCall}>
        <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
          <Card className="overflow-hidden border-border/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
                <SpeakerLayout />
              </div>
              <CallControls onLeave={leaveCall} />
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CallParticipantsList onClose={() => {}} />
              <div className="flex flex-col gap-2">
                {role === 'host' ? (
                  <Button
                    variant="destructive"
                    onClick={handleEndCall}
                    loading={endCallMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    End call for everyone
                  </Button>
                ) : (
                  <Button variant="outline" onClick={leaveCall}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave call
                  </Button>
                )}
                <Button variant="ghost" onClick={handleReturnBack}>
                  Return to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </StreamCall>
    </div>
  );
}
