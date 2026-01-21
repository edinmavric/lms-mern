import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../lib/api/users';

export function useUserById(userId: string | undefined | null) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getById(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry on 404 (deleted users)
  });

  const getUserName = () => {
    if (isLoading) return 'Loading...';
    if (error || !user) return 'Unknown User';
    return `${user.firstName} ${user.lastName}`;
  };

  return { user, isLoading, error, getUserName };
}
