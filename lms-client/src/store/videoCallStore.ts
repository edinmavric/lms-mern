import { create } from 'zustand';
import type { Call, StreamVideoClient } from '@stream-io/video-react-sdk';
import type { VideoCall } from '../types';

type CallRole = 'host' | 'cohost' | 'participant';

interface VideoCallState {
  client: StreamVideoClient | null;
  activeCall: Call | null;
  callInfo?: VideoCall;
  role: CallRole | null;
  token?: string;
  expiresAt?: string;
  isDockVisible: boolean;
  isCallPageActive: boolean;
  setClient: (client: StreamVideoClient | null) => void;
  setActiveCall: (params: {
    call: Call;
    callInfo?: VideoCall;
    role: CallRole;
    token: string;
    expiresAt: string;
    isDockVisible?: boolean;
  }) => void;
  updateCallInfo: (info: Partial<VideoCall>) => void;
  setDockVisible: (visible: boolean) => void;
  setIsCallPageActive: (active: boolean) => void;
  clearCall: () => Promise<void>;
}

export const useVideoCallStore = create<VideoCallState>((set, get) => ({
  client: null,
  activeCall: null,
  callInfo: undefined,
  role: null,
  token: undefined,
  expiresAt: undefined,
  isDockVisible: false,
  isCallPageActive: false,

  setClient: client => set({ client }),

  setActiveCall: ({
    call,
    callInfo,
    role,
    token,
    expiresAt,
    isDockVisible = true,
  }) =>
    set({
      activeCall: call,
      callInfo,
      role,
      token,
      expiresAt,
      isDockVisible,
    }),

  updateCallInfo: info =>
    set(state => ({
      callInfo: state.callInfo
        ? { ...state.callInfo, ...info }
        : state.callInfo,
    })),

  setDockVisible: visible => set({ isDockVisible: visible }),

  setIsCallPageActive: active => set({ isCallPageActive: active }),

  clearCall: async () => {
    const { activeCall } = get();
    try {
      if (activeCall) {
        await activeCall.leave();
      }
    } catch (error) {
      console.warn('Failed to leave call gracefully', error);
    }

    set({
      client: null,
      activeCall: null,
      callInfo: undefined,
      role: null,
      token: undefined,
      expiresAt: undefined,
      isDockVisible: false,
      isCallPageActive: false,
    });
  },
}));
