import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { AuthResponse, User, TenantSummary } from '../../types';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string;
  tenantName?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
  tenantName?: string;
  role?: 'student' | 'professor';
}

export interface TenantSignupData {
  tenantName: string;
  domain?: string;
  contactEmail?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  settings?: {
    gradeScale?: {
      min: number;
      max: number;
      label: '1-5' | '1-10' | '6-10';
    };
    attendanceRules?: {
      requiredPresencePercent: number;
      allowRemote: boolean;
    };
    currency?: string;
    locale?: string;
  };
}

export interface ForgotPasswordData {
  email: string;
  tenantId: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  tenantId: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    return data;
  },

  register: async (registerData: RegisterData): Promise<{ message: string; user: User }> => {
    const { data } = await apiClient.post<{ message: string; user: User }>(
      API_ENDPOINTS.auth.register,
      registerData
    );
    return data;
  },

  tenantSignup: async (signupData: TenantSignupData): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.tenantSignup,
      signupData
    );
    return data;
  },

  forgotPassword: async (forgotData: ForgotPasswordData): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.forgotPassword,
      forgotData
    );
    return data;
  },

  resetPassword: async (resetData: ResetPasswordData): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.resetPassword,
      resetData
    );
    return data;
  },

  refreshToken: async (tokenData: RefreshTokenData): Promise<{ token: string; refreshToken: string }> => {
    const { data } = await apiClient.post<{ token: string; refreshToken: string }>(
      API_ENDPOINTS.auth.refreshToken,
      tokenData
    );
    return data;
  },

  searchTenants: async (query: string): Promise<TenantSummary[]> => {
    const { data } = await apiClient.get<
      Array<{ _id: string; name: string; domain?: string; contactEmail?: string }>
    >(API_ENDPOINTS.auth.searchTenants, { params: { query } });

    return data.map(item => ({
      id: item._id,
      name: item.name,
      domain: item.domain,
      contactEmail: item.contactEmail,
    }));
  },
};
