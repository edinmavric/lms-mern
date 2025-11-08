import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  Mail, 
  UserRound, 
  Shield, 
  Calendar,
  Clock,
  Edit,
} from 'lucide-react';

import { usersApi } from '../../lib/api/users';
import type { User } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(id!),
    enabled: !!id,
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'professor':
        return 'secondary';
      case 'student':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (userData: User | undefined) => {
    if (!userData) return 'outline';
    if (userData.pendingApproval || userData.status === 'pending') {
      return 'warning';
    }
    if (userData.status === 'active') {
      return 'success';
    }
    if (userData.status === 'disabled') {
      return 'destructive';
    }
    return 'outline';
  };

  const getStatusLabel = (userData: User | undefined) => {
    if (!userData) return 'Unknown';
    if (userData.pendingApproval || userData.status === 'pending') {
      return 'Pending';
    }
    return userData.status.charAt(0).toUpperCase() + userData.status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">User not found</p>
            <p className="text-sm">
              The user you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/admin/users')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              User Details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/app/admin/users/${user._id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-base font-semibold mt-1">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </p>
              <p className="text-base mt-1">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(user)}>
                  {getStatusLabel(user)}
                </Badge>
              </div>
            </div>
            {user.pendingApproval && (
              <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Pending Approval
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This user is waiting for admin approval
                </p>
              </div>
            )}
            {user.approvedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved At</p>
                <p className="text-base mt-1">
                  {new Date(user.approvedAt).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="text-sm font-mono mt-1 break-all">{user._id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tenant ID</p>
              <p className="text-sm font-mono mt-1 break-all">{user.tenant}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-base mt-1">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            {user.createdBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p className="text-sm font-mono mt-1 break-all">
                  {user.createdBy}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

