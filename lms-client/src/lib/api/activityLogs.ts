import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ActivityLog, ActivityLogStats } from '../../types';

export interface ActivityLogListParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ActivityLogListResponse {
  success: boolean;
  data: {
    logs: ActivityLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ActivityLogEntityResponse {
  success: boolean;
  data: {
    logs: ActivityLog[];
  };
}

export interface ActivityLogStatsResponse {
  success: boolean;
  data: ActivityLogStats;
}

export const activityLogsApi = {
  list: async (
    params?: ActivityLogListParams
  ): Promise<ActivityLogListResponse['data']> => {
    const { data } = await apiClient.get<ActivityLogListResponse>(
      API_ENDPOINTS.activityLogs.list,
      { params }
    );
    return data.data;
  },

  getStats: async (days?: number): Promise<ActivityLogStats> => {
    const { data } = await apiClient.get<ActivityLogStatsResponse>(
      API_ENDPOINTS.activityLogs.stats,
      { params: days ? { days } : {} }
    );
    return data.data;
  },

  getEntityActivity: async (
    entityType: string,
    entityId: string
  ): Promise<ActivityLog[]> => {
    const { data } = await apiClient.get<ActivityLogEntityResponse>(
      API_ENDPOINTS.activityLogs.entity(entityType, entityId)
    );
    return data.data.logs;
  },
};
