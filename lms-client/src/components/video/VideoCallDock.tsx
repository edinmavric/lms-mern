import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  StreamCall,
  PaginatedGridLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorDot,
  MessageSquare,
  Smile,
  LogOut,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useVideoCallStore } from '../../store/videoCallStore';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui';

export function VideoCallDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeCall = useVideoCallStore(state => state.activeCall);
  const callInfo = useVideoCallStore(state => state.callInfo);
  const isDockVisible = useVideoCallStore(state => state.isDockVisible);
  const isCallPageActive = useVideoCallStore(state => state.isCallPageActive);
  const clearCall = useVideoCallStore(state => state.clearCall);
  const role = useVideoCallStore(state => state.role);

  const handleReturnToCall = useCallback(() => {
    if (!callInfo) return;
    navigate(`/app/video-calls/${callInfo._id}`, {
      state: { from: location.pathname },
    });
  }, [callInfo, navigate, location.pathname]);

  const handleLeaveCall = useCallback(async () => {
    await clearCall();
  }, [clearCall]);

  if (!activeCall || !callInfo || !isDockVisible || isCallPageActive) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-md">
      <StreamCall call={activeCall}>
        <Card className="border-border/80 bg-card/95 shadow-2xl backdrop-blur">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                <span className="truncate">{callInfo.title}</span>
              </CardTitle>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">
                  {role === 'host' ? 'Host' : 'Participant'}
                </Badge>
                <Badge variant="secondary">Live</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveCall}
              aria-label="Leave call"
            >
              Leave
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-black">
              <PaginatedGridLayout />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <CustomCallControls onLeave={handleLeaveCall} />
            <Button onClick={handleReturnToCall} className="w-full">
              Return to full call
            </Button>
          </CardFooter>
        </Card>
      </StreamCall>
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
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Button
          variant={camera.isEnabled ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleCamera}
          className="h-10 w-10 rounded-full p-0"
          aria-label={camera.isEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {camera.isEnabled ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant={microphone.isEnabled ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleMicrophone}
          className="h-10 w-10 rounded-full p-0"
          aria-label={
            microphone.isEnabled ? 'Mute microphone' : 'Unmute microphone'
          }
        >
          {microphone.isEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant={hasOngoingScreenShare ? 'default' : 'outline'}
          size="lg"
          onClick={toggleScreenShare}
          className={`h-10 w-10 rounded-full p-0 ${
            hasOngoingScreenShare
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : ''
          }`}
          aria-label={hasOngoingScreenShare ? 'Stop sharing' : 'Share screen'}
        >
          <MonitorDot className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowReactions(!showReactions)}
            className="h-10 w-10 rounded-full p-0"
            aria-label="Send reaction"
          >
            <Smile className="h-4 w-4" />
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
          className="h-10 w-10 rounded-full p-0"
          aria-label={showChat ? 'Hide chat' : 'Show chat'}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={onLeave}
          className="h-10 w-10 rounded-full p-0"
          aria-label="Leave call"
        >
          <LogOut className="h-4 w-4" />
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
          </div>
        </div>
      )}
    </div>
  );
}
