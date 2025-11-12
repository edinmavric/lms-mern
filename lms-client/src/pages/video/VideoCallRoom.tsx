import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  StreamCall,
  SpeakerLayout,
  StreamVideoClient,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Loader2,
  LogOut,
  MonitorDot,
  Share2,
  Check,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  Smile,
  X,
} from 'lucide-react';
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
  const client = useVideoCallStore(state => state.client);
  const activeCall = useVideoCallStore(state => state.activeCall);
  const callInfo = useVideoCallStore(state => state.callInfo);
  const role = useVideoCallStore(state => state.role);
  const setClient = useVideoCallStore(state => state.setClient);
  const setActiveCall = useVideoCallStore(state => state.setActiveCall);
  const clearCall = useVideoCallStore(state => state.clearCall);
  const setDockVisible = useVideoCallStore(state => state.setDockVisible);
  const setIsCallPageActive = useVideoCallStore(
    state => state.setIsCallPageActive
  );
  const joiningRef = useRef(false);
  const processedCallIdRef = useRef<string | null>(null);
  const activeJoinsRef = useRef<Set<string>>(new Set());
  const joinInProgressRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
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
    onError: (err: any) => {
      if (isLeavingRef.current) {
        return;
      }
      const errorMessage = err?.response?.data?.message || getErrorMessage(err);
      if (
        errorMessage?.includes('not active') ||
        errorMessage?.includes('Video call is not active')
      ) {
        return;
      }
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
      if (isLeavingRef.current) {
        return;
      }
      toast.error(getErrorMessage(err));
    },
  });

  const isLeavingRef = useRef(false);

  const leaveCall = useCallback(async () => {
    console.log('Leaving call...');
    isLeavingRef.current = true;
    processedCallIdRef.current = null;
    joiningRef.current = false;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    joinInProgressRef.current = null;
    activeJoinsRef.current.clear();

    await clearCall();
    navigate(fromPath || fallbackPath);
  }, [clearCall, navigate, fromPath, fallbackPath]);

  useEffect(() => {
    setIsCallPageActive(true);
    setDockVisible(false);
    isLeavingRef.current = false;
    return () => {
      setIsCallPageActive(false);
      setDockVisible(true);
      isLeavingRef.current = true;
      processedCallIdRef.current = null;
      joiningRef.current = false;
      joinInProgressRef.current = null;
      activeJoinsRef.current.clear();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [setDockVisible, setIsCallPageActive]);

  useEffect(() => {
    if (isLeavingRef.current) {
      console.log('Join prevented - user is leaving the call');
      return;
    }

    if (!id || !user || !videoCall) {
      return;
    }

    if (videoCall._id !== id) {
      console.log('Join prevented - videoCall ID does not match URL id', {
        videoCallId: videoCall._id,
        urlId: id,
      });
      return;
    }

    const currentPagePath = location.pathname;
    const expectedPagePath = `/app/video-calls/${id}`;
    if (currentPagePath !== expectedPagePath) {
      console.log('Join prevented - not on video call page anymore', {
        currentPagePath,
        expectedPagePath,
      });
      return;
    }

    if (videoCall.status !== 'active') {
      return;
    }

    if (
      callInfo?.callCid === videoCall.callCid &&
      !activeCall &&
      !joiningRef.current &&
      !joinInProgressRef.current
    ) {
      console.log('Join prevented - user has already left this call');
      return;
    }

    if (
      activeCall &&
      callInfo?.callCid === videoCall.callCid &&
      activeCall.state?.session
    ) {
      console.log('Already in active session for this call - skipping join');
      return;
    }

    const callCid = videoCall.callCid;

    if (joinInProgressRef.current === callCid) {
      console.log(
        'Duplicate join prevented - join already in progress for:',
        callCid
      );
      return;
    }

    if (abortControllerRef.current) {
      console.log('Aborting previous join attempt');
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    joinInProgressRef.current = callCid;

    activeJoinsRef.current.add(callCid);
    console.log('Starting join process for callCid:', callCid);

    const cleanup = () => {
      if (
        joinInProgressRef.current === callCid &&
        abortControllerRef.current === abortController
      ) {
        console.log('Cleaning up join process for:', callCid);
        abortController.abort();
        joinInProgressRef.current = null;
        abortControllerRef.current = null;
        activeJoinsRef.current.delete(callCid);
        joiningRef.current = false;
      }
    };

    if (isLeavingRef.current) {
      console.log('Join prevented - leaving in progress');
      return cleanup;
    }

    if (joiningRef.current) {
      activeJoinsRef.current.delete(callCid);
      joinInProgressRef.current = null;
      abortController.abort();
      abortControllerRef.current = null;
      return cleanup;
    }

    if (isLeavingRef.current) {
      console.log('Join prevented - leaving flag set during checks');
      return cleanup;
    }

    const currentCallCid = callInfo?.callCid ?? null;
    if (currentCallCid === callCid && activeCall && client) {
      if (activeCall.state?.session) {
        console.log('Already in active session for this call');
        processedCallIdRef.current = callCid;
        activeJoinsRef.current.delete(callCid);
        joinInProgressRef.current = null;
        abortController.abort();
        abortControllerRef.current = null;
        return cleanup;
      }
    }

    processedCallIdRef.current = callCid;
    joiningRef.current = true;

    if (videoCall?._id !== id) {
      console.log('Join prevented - videoCall ID mismatch before API call', {
        videoCallId: videoCall?._id,
        urlId: id,
        callCid,
      });
      return cleanup;
    }

    if (isLeavingRef.current) {
      console.log('Join prevented - leaving flag set before API call');
      return cleanup;
    }

    const currentApiPath = location.pathname;
    const expectedApiPath = `/app/video-calls/${id}`;
    if (currentApiPath !== expectedApiPath) {
      console.log('Join prevented - not on video call page before API call', {
        currentApiPath,
        expectedApiPath,
      });
      return cleanup;
    }

    if (videoCall?.status !== 'active') {
      console.log('Join prevented - call is not active before API call', {
        status: videoCall?.status,
      });
      return cleanup;
    }

    if (
      activeCall &&
      callInfo?.callCid === callCid &&
      activeCall.state?.session
    ) {
      console.log('Join prevented - already in call before API call');
      return cleanup;
    }

    if (abortController.signal.aborted) {
      console.log(
        'Join prevented - abort signal already aborted before API call'
      );
      return cleanup;
    }

    if (
      videoCall?._id !== id ||
      isLeavingRef.current ||
      location.pathname !== `/app/video-calls/${id}` ||
      videoCall?.status !== 'active' ||
      abortController.signal.aborted
    ) {
      console.log('Join prevented - final check failed before API call', {
        videoCallId: videoCall?._id,
        urlId: id,
        isLeaving: isLeavingRef.current,
        pathname: location.pathname,
        status: videoCall?.status,
        aborted: abortController.signal.aborted,
      });
      return cleanup;
    }

    tokenMutation
      .mutateAsync(id)
      .then(async (tokenResponse: VideoCallTokenResponse) => {
        if (
          abortController.signal.aborted ||
          joinInProgressRef.current !== callCid ||
          isLeavingRef.current
        ) {
          console.log('Join cancelled - aborted, callCid changed, or leaving');
          joiningRef.current = false;
          activeJoinsRef.current.delete(callCid);
          return;
        }

        const currentTokenPath = location.pathname;
        const expectedTokenPath = `/app/video-calls/${id}`;
        if (currentTokenPath !== expectedTokenPath) {
          console.log('Join cancelled - navigated away from video call page');
          joiningRef.current = false;
          activeJoinsRef.current.delete(callCid);
          return;
        }

        if (videoCall?._id !== id) {
          console.log('Join cancelled - videoCall ID no longer matches URL', {
            videoCallId: videoCall?._id,
            urlId: id,
          });
          joiningRef.current = false;
          activeJoinsRef.current.delete(callCid);
          return;
        }

        if (!user || abortController.signal.aborted) {
          joiningRef.current = false;
          activeJoinsRef.current.delete(callCid);
          if (joinInProgressRef.current === callCid) {
            joinInProgressRef.current = null;
            abortControllerRef.current = null;
          }
          return;
        }

        console.log('Token received, role:', tokenResponse.role);

        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey: tokenResponse.apiKey,
          user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`.trim(),
          },
          token: tokenResponse.token,
        });

        setClient(streamClient);

        const call = streamClient.call(
          tokenResponse.call.callType,
          tokenResponse.call.callId
        );

        if (
          abortController.signal.aborted ||
          joinInProgressRef.current !== callCid ||
          isLeavingRef.current
        ) {
          console.log('Join cancelled before call.join() - leaving or aborted');
          return;
        }

        try {
          if (tokenResponse.role === 'host') {
            console.log('Joining as host...');
            await call.join({
              create: true,
              data: {
                members: [{ user_id: user._id, role: 'admin' }],
              },
            });
          } else {
            console.log('Joining as participant...');
            await call.join();
          }

          if (
            abortController.signal.aborted ||
            joinInProgressRef.current !== callCid ||
            isLeavingRef.current
          ) {
            console.log(
              'Join cancelled after call.join() - leaving or aborted'
            );
            await call.leave().catch(() => {});
            return;
          }

          console.log('Successfully joined call');

          setActiveCall({
            call,
            callInfo: videoCall,
            role: tokenResponse.role,
            token: tokenResponse.token,
            expiresAt: tokenResponse.expiresAt,
            isDockVisible: false,
          });
        } catch (joinError: any) {
          console.error('Join error:', joinError);

          if (
            joinError?.message?.includes('already') ||
            joinError?.message?.includes('active participant') ||
            call.state?.session
          ) {
            console.log(
              'Already in call or recovering from error, setting active call'
            );
            setActiveCall({
              call,
              callInfo: videoCall,
              role: tokenResponse.role,
              token: tokenResponse.token,
              expiresAt: tokenResponse.expiresAt,
              isDockVisible: false,
            });
          } else {
            throw joinError;
          }
        }
      })
      .catch(err => {
        if (isLeavingRef.current) {
          console.log('Join error ignored - user is leaving');
          processedCallIdRef.current = null;
          return;
        }

        const currentErrorPath = location.pathname;
        const expectedErrorPath = `/app/video-calls/${id}`;
        if (currentErrorPath !== expectedErrorPath) {
          console.log(
            'Join error ignored - navigated away from video call page'
          );
          processedCallIdRef.current = null;
          return;
        }

        const errorUrl = err?.config?.url || err?.request?.responseURL || '';
        const errorCallIdMatch = errorUrl.match(
          /\/video-calls\/([^/]+)\/token/
        );
        if (errorCallIdMatch && errorCallIdMatch[1] !== id) {
          console.log('Join error ignored - error is for a different call', {
            errorCallId: errorCallIdMatch[1],
            currentCallId: id,
          });
          processedCallIdRef.current = null;
          return;
        }

        const errorMessage =
          err?.response?.data?.message || getErrorMessage(err);

        if (
          errorMessage?.includes('not active') ||
          errorMessage?.includes('Video call is not active') ||
          errorMessage?.includes('Request failed with status code 400')
        ) {
          console.log(
            'Join error suppressed - call not active or status changed',
            {
              errorMessage,
              callStatus: videoCall?.status,
              isLeaving: isLeavingRef.current,
            }
          );
          processedCallIdRef.current = null;
          return;
        }

        console.error('Failed to join call:', {
          error: err,
          message: errorMessage,
          status: err?.response?.status,
        });
        toast.error(errorMessage || 'Failed to join video call');
        processedCallIdRef.current = null;
      })
      .finally(() => {
        if (
          joinInProgressRef.current === callCid &&
          abortControllerRef.current === abortController
        ) {
          joiningRef.current = false;
          activeJoinsRef.current.delete(callCid);
          joinInProgressRef.current = null;
          abortControllerRef.current = null;
        }
      });

    return cleanup;
  }, [id, user?._id, videoCall?.callCid, videoCall?.status]);

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

  const [linkCopied, setLinkCopied] = useState(false);
  const shareableLink = `${window.location.origin}/app/video-calls/${id}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setLinkCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  }, [shareableLink]);

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
        <VideoCallContent
          leaveCall={leaveCall}
          role={role}
          handleEndCall={handleEndCall}
          endCallMutation={endCallMutation}
          handleReturnBack={handleReturnBack}
          linkCopied={linkCopied}
          handleCopyLink={handleCopyLink}
        />
      </StreamCall>
    </div>
  );
}

function VideoCallContent({
  leaveCall,
  role,
  handleEndCall,
  endCallMutation,
  handleReturnBack,
  linkCopied,
  handleCopyLink,
}: {
  leaveCall: () => void;
  role: string | null;
  handleEndCall: () => void;
  endCallMutation: any;
  handleReturnBack: () => void;
  linkCopied: boolean;
  handleCopyLink: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
      <Card className="overflow-hidden border-border/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Session</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2"
          >
            {linkCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share Link
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
            <SpeakerLayout participantsBarPosition="bottom" />
          </div>
          <div className="w-full bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
            <CustomCallControls onLeave={leaveCall} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CustomParticipantList />
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
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
  );
}

function CustomParticipantList() {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  const uniqueParticipants = useMemo(() => {
    const seen = new Map<string, (typeof participants)[0]>();

    if (localParticipant) {
      seen.set(
        localParticipant.userId || localParticipant.sessionId,
        localParticipant
      );
    }

    participants.forEach(participant => {
      const key = participant.userId || participant.sessionId;
      if (!seen.has(key)) {
        seen.set(key, participant);
      }
    });

    return Array.from(seen.values());
  }, [participants, localParticipant]);

  if (uniqueParticipants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No participants yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {uniqueParticipants.map(participant => {
        const isLocal = participant.sessionId === localParticipant?.sessionId;
        const name = participant.name || participant.userId || 'Unknown';
        const initials = name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div
            key={participant.sessionId}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{name}</p>
                {isLocal && (
                  <Badge variant="secondary" className="text-xs">
                    Me
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CustomCallControls({ onLeave }: { onLeave: () => void }) {
  const call = useCall();
  const { useCameraState, useMicrophoneState, useHasOngoingScreenShare } =
    useCallStateHooks();
  const camera = useCameraState();
  const microphone = useMicrophoneState();
  const hasOngoingScreenShare = useHasOngoingScreenShare();
  const [showReactions, setShowReactions] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const toggleCamera = useCallback(async () => {
    try {
      if (camera.isEnabled) {
        await call?.camera.disable();
      } else {
        await call?.camera.enable();
      }
    } catch (error) {
      console.error('Failed to toggle camera:', error);
      toast.error('Failed to toggle camera');
    }
  }, [call, camera.isEnabled]);

  const toggleMicrophone = useCallback(async () => {
    try {
      if (microphone.isEnabled) {
        await call?.microphone.disable();
      } else {
        await call?.microphone.enable();
      }
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      toast.error('Failed to toggle microphone');
    }
  }, [call, microphone.isEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (hasOngoingScreenShare) {
        await call?.stopPublish();
        toast.success('Screen sharing stopped');
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        await call?.publishVideoStream(stream);
        toast.success('Screen sharing started');
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      toast.error('Failed to toggle screen share');
    }
  }, [call, hasOngoingScreenShare]);

  const sendReaction = useCallback(
    async (reaction: string) => {
      try {
        await call?.sendReaction({
          type: reaction,
        });
        setShowReactions(false);
        toast.success(`Sent ${reaction} reaction`);
      } catch (error) {
        console.error('Failed to send reaction:', error);
        toast.error('Failed to send reaction');
      }
    },
    [call]
  );

  const reactions = ['👍', '👎', '❤️', '🎉', '🔥', '👏', '😄', '😮'];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button
          variant={camera.isEnabled ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleCamera}
          className="h-12 w-12 rounded-full p-0"
          aria-label={camera.isEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {camera.isEnabled ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant={microphone.isEnabled ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleMicrophone}
          className="h-12 w-12 rounded-full p-0"
          aria-label={
            microphone.isEnabled ? 'Mute microphone' : 'Unmute microphone'
          }
        >
          {microphone.isEnabled ? (
            <Mic className="h-5 w-5" />
          ) : (
            <MicOff className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant={hasOngoingScreenShare ? 'default' : 'outline'}
          size="lg"
          onClick={toggleScreenShare}
          className={`h-12 w-12 rounded-full p-0 ${
            hasOngoingScreenShare
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : ''
          }`}
          aria-label={hasOngoingScreenShare ? 'Stop sharing' : 'Share screen'}
        >
          <MonitorDot className="h-5 w-5" />
        </Button>

        <div className="relative">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowReactions(!showReactions)}
            className="h-12 w-12 rounded-full p-0"
            aria-label="Send reaction"
          >
            <Smile className="h-5 w-5" />
          </Button>
          {showReactions && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-lg p-2 shadow-lg flex gap-2 z-50">
              {reactions.map(reaction => (
                <button
                  key={reaction}
                  onClick={() => sendReaction(reaction)}
                  className="text-2xl hover:scale-125 transition-transform p-1 rounded hover:bg-accent"
                  aria-label={`Send ${reaction} reaction`}
                >
                  {reaction}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant={showChat ? 'default' : 'outline'}
          size="lg"
          onClick={() => setShowChat(!showChat)}
          className="h-12 w-12 rounded-full p-0"
          aria-label={showChat ? 'Hide chat' : 'Show chat'}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={onLeave}
          className="h-12 w-12 rounded-full p-0"
          aria-label="Leave call"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {showChat && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Chat</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-48 border border-border rounded-lg bg-background p-3 overflow-y-auto">
            <p className="text-sm text-muted-foreground text-center py-8">
              Chat functionality coming soon
            </p>
            {/* TODO: Integrate Stream Chat SDK here */}
          </div>
        </div>
      )}
    </div>
  );
}
