import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Notification, CreateNotificationData } from '../../types';

export const notificationsApi = {
  my: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
    priority?: string;
  }): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>(
      API_ENDPOINTS.notifications.my,
      { params }
    );
    return data;
  },

  unreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<{ data: { unreadCount: number } }>(
      API_ENDPOINTS.notifications.unreadCount
    );
    return data.data.unreadCount;
  },

  list: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    priority?: string;
    published?: boolean;
  }): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>(
      API_ENDPOINTS.notifications.list,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Notification> => {
    const { data } = await apiClient.get<Notification>(
      API_ENDPOINTS.notifications.detail(id)
    );
    return data;
  },

  create: async (payload: CreateNotificationData): Promise<Notification> => {
    const { data } = await apiClient.post<Notification>(
      API_ENDPOINTS.notifications.create,
      payload
    );
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateNotificationData>
  ): Promise<Notification> => {
    const { data } = await apiClient.put<Notification>(
      API_ENDPOINTS.notifications.update(id),
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string; id: string }> => {
    const { data } = await apiClient.delete<{ message: string; id: string }>(
      API_ENDPOINTS.notifications.delete(id)
    );
    return data;
  },

  markRead: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.notifications.markRead(id)
    );
    return data;
  },

  markAllRead: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.notifications.markAllRead
    );
    return data;
  },
};
