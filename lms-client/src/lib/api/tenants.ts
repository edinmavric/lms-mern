import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Tenant, TenantSettings } from '../../types';

export interface CreateTenantData {
  name: string;
  domain?: string;
  contactEmail?: string;
  settings?: TenantSettings;
}

export interface UpdateTenantData {
  name?: string;
  domain?: string;
  contactEmail?: string;
  settings?: TenantSettings;
}

export interface TenantListParams {
  page?: number;
  limit?: number;
  name?: string;
  domain?: string;
  createdAfter?: string;
  createdBefore?: string;
  includeDeleted?: boolean;
}

export interface TenantListResponse {
  data: Tenant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const tenantsApi = {
  list: async (params?: TenantListParams): Promise<TenantListResponse> => {
    const { data } = await apiClient.get<TenantListResponse>(
      API_ENDPOINTS.tenants.list,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Tenant> => {
    const { data } = await apiClient.get<Tenant>(API_ENDPOINTS.tenants.detail(id));
    return data;
  },

  create: async (tenantData: CreateTenantData): Promise<Tenant> => {
    const { data } = await apiClient.post<Tenant>(
      API_ENDPOINTS.tenants.create,
      tenantData
    );
    return data;
  },

  update: async (id: string, tenantData: UpdateTenantData): Promise<Tenant> => {
    const { data } = await apiClient.put<Tenant>(
      API_ENDPOINTS.tenants.update(id),
      tenantData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.tenants.delete(id)
    );
    return data;
  },
};
