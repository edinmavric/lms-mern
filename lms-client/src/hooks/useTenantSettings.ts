import { useQuery } from '@tanstack/react-query';
import { tenantsApi } from '../lib/api/tenants';
import { useAuthStore } from '../store/authStore';

export function useTenantSettings() {
  const tenant = useAuthStore(state => state.tenant);

  const { data: fullTenant, isLoading } = useQuery({
    queryKey: ['tenant', tenant?.id],
    queryFn: () => tenantsApi.getById(tenant!.id),
    enabled: !!tenant?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    tenant: fullTenant,
    isLoading,
    gradeScale: fullTenant?.settings?.gradeScale ?? { min: 1, max: 10, label: '1-10' as const },
    attendanceRules: fullTenant?.settings?.attendanceRules ?? {
      requiredPresencePercent: 70,
      allowRemote: true,
    },
    currency: fullTenant?.settings?.currency ?? 'USD',
    locale: fullTenant?.settings?.locale ?? 'en-US',
  };
}
