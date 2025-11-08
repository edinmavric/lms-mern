import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Attendance } from '../../types';

export interface CreateAttendanceData {
  student: string;
  course?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface UpdateAttendanceData {
  status?: 'present' | 'absent' | 'late' | 'excused';
  date?: string;
}

export interface AttendanceListParams {
  student?: string;
  course?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
  date?: string;
}

export const attendanceApi = {
  list: async (params?: AttendanceListParams): Promise<Attendance[]> => {
    const { data } = await apiClient.get<Attendance[]>(
      API_ENDPOINTS.attendance.list,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Attendance> => {
    const { data } = await apiClient.get<Attendance>(
      API_ENDPOINTS.attendance.detail(id)
    );
    return data;
  },

  create: async (attendanceData: CreateAttendanceData): Promise<Attendance> => {
    const { data } = await apiClient.post<Attendance>(
      API_ENDPOINTS.attendance.create,
      attendanceData
    );
    return data;
  },

  update: async (
    id: string,
    attendanceData: UpdateAttendanceData
  ): Promise<Attendance> => {
    const { data } = await apiClient.put<Attendance>(
      API_ENDPOINTS.attendance.update(id),
      attendanceData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.attendance.delete(id)
    );
    return data;
  },
};
