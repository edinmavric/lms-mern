import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  StreamCall,
  CallControls,
  PaginatedGridLayout,
} from '@stream-io/video-react-sdk';
import { Video } from 'lucide-react';
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
  const {
    activeCall,
    callInfo,
    isDockVisible,
    isCallPageActive,
    clearCall,
    role,
  } = useVideoCallStore(state => ({
    activeCall: state.activeCall,
    callInfo: state.callInfo,
    isDockVisible: state.isDockVisible,
    isCallPageActive: state.isCallPageActive,
    clearCall: state.clearCall,
    role: state.role,
  }));

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
            <CallControls onLeave={handleLeaveCall} />
            <Button onClick={handleReturnToCall} className="w-full">
              Return to full call
            </Button>
          </CardFooter>
        </Card>
      </StreamCall>
    </div>
  );
}
