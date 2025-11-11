import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  CreateVideoCallDto,
  VideoCall,
  VideoCallParticipant,
  VideoCallTokenResponse,
} from '../../types';

export const videoCallsApi = {
  list: async (params?: {
    status?: string;
    courseId?: string;
    lessonId?: string;
  }): Promise<VideoCall[]> => {
    const { data } = await apiClient.get<VideoCall[]>(
      API_ENDPOINTS.videoCalls.list,
      { params }
    );
    return data;
  },

  create: async (payload: CreateVideoCallDto): Promise<VideoCall> => {
    const { data } = await apiClient.post<VideoCall>(
      API_ENDPOINTS.videoCalls.create,
      payload
    );
    return data;
  },

  getById: async (id: string): Promise<VideoCall> => {
    const { data } = await apiClient.get<VideoCall>(
      API_ENDPOINTS.videoCalls.detail(id)
    );
    return data;
  },

  getActiveForLesson: async (lessonId: string): Promise<VideoCall> => {
    const { data } = await apiClient.get<VideoCall>(
      API_ENDPOINTS.videoCalls.activeForLesson(lessonId)
    );
    return data;
  },

  end: async (
    id: string
  ): Promise<{ message: string; videoCallId?: string }> => {
    const { data } = await apiClient.post<{
      message: string;
      videoCallId?: string;
    }>(API_ENDPOINTS.videoCalls.end(id));
    return data;
  },

  token: async (id: string): Promise<VideoCallTokenResponse> => {
    const { data } = await apiClient.post<VideoCallTokenResponse>(
      API_ENDPOINTS.videoCalls.token(id)
    );
    return data;
  },

  updateParticipants: async (
    id: string,
    participants: VideoCallParticipant[]
  ): Promise<VideoCall> => {
    const { data } = await apiClient.put<VideoCall>(
      API_ENDPOINTS.videoCalls.updateParticipants(id),
      { participants }
    );
    return data;
  },
};
