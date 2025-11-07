const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  health: `${API_BASE.replace('/api', '')}/health`,

  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    tenantSignup: `${API_BASE}/auth/tenant-signup`,
    forgotPassword: `${API_BASE}/auth/forgot-password`,
    resetPassword: `${API_BASE}/auth/reset-password`,
    refreshToken: `${API_BASE}/auth/refresh-token`,
    searchTenants: `${API_BASE}/auth/search-tenants`,
  },

  users: {
    list: `${API_BASE}/users`,
    create: `${API_BASE}/users`,
    detail: (id: string) => `${API_BASE}/users/${id}`,
    update: (id: string) => `${API_BASE}/users/${id}`,
    delete: (id: string) => `${API_BASE}/users/${id}`,
    approve: (id: string) => `${API_BASE}/users/${id}/approve`,
  },

  tenants: {
    list: `${API_BASE}/tenants`,
    create: `${API_BASE}/tenants`,
    detail: (id: string) => `${API_BASE}/tenants/${id}`,
    update: (id: string) => `${API_BASE}/tenants/${id}`,
    delete: (id: string) => `${API_BASE}/tenants/${id}`,
  },

  courses: {
    list: `${API_BASE}/courses`,
    create: `${API_BASE}/courses`,
    detail: (id: string) => `${API_BASE}/courses/${id}`,
    update: (id: string) => `${API_BASE}/courses/${id}`,
    delete: (id: string) => `${API_BASE}/courses/${id}`,
  },

  enrollments: {
    list: `${API_BASE}/enrollments`,
    create: `${API_BASE}/enrollments`,
    detail: (id: string) => `${API_BASE}/enrollments/${id}`,
    update: (id: string) => `${API_BASE}/enrollments/${id}`,
    delete: (id: string) => `${API_BASE}/enrollments/${id}`,
    addPayment: (id: string) => `${API_BASE}/enrollments/${id}/payments`,
  },

  lessons: {
    list: `${API_BASE}/lessons`,
    create: `${API_BASE}/lessons`,
    detail: (id: string) => `${API_BASE}/lessons/${id}`,
    update: (id: string) => `${API_BASE}/lessons/${id}`,
    delete: (id: string) => `${API_BASE}/lessons/${id}`,
  },

  grades: {
    list: `${API_BASE}/grades`,
    create: `${API_BASE}/grades`,
    detail: (id: string) => `${API_BASE}/grades/${id}`,
    update: (id: string) => `${API_BASE}/grades/${id}`,
    delete: (id: string) => `${API_BASE}/grades/${id}`,
  },

  attendance: {
    list: `${API_BASE}/attendance`,
    create: `${API_BASE}/attendance`,
    detail: (id: string) => `${API_BASE}/attendance/${id}`,
    update: (id: string) => `${API_BASE}/attendance/${id}`,
    delete: (id: string) => `${API_BASE}/attendance/${id}`,
  },

  bankAccounts: {
    list: `${API_BASE}/bank-accounts`,
    create: `${API_BASE}/bank-accounts`,
    detail: (id: string) => `${API_BASE}/bank-accounts/${id}`,
    update: (id: string) => `${API_BASE}/bank-accounts/${id}`,
    delete: (id: string) => `${API_BASE}/bank-accounts/${id}`,
  },
} as const;
