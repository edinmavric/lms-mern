import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Activity,
  User,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Monitor,
} from 'lucide-react';
import { format } from 'date-fns';

import { activityLogsApi } from '../../lib/api/activityLogs';
import type { ActivityLog } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

function getSeverityBadgeVariant(
  severity: ActivityLog['severity']
): 'default' | 'destructive' | 'warning' | 'success' {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    case 'low':
    default:
      return 'default';
  }
}

function getActionIcon(action: string) {
  if (action.includes('created')) return <CheckCircle className="h-4 w-4" />;
  if (action.includes('updated')) return <Info className="h-4 w-4" />;
  if (action.includes('deleted')) return <XCircle className="h-4 w-4" />;
  if (action.includes('login')) return <User className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
}

function formatAction(action: string): string {
  return action
    .split('.')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ActivityLogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['activityLogs', 'detail', id],
    queryFn: async () => {
      const result = await activityLogsApi.list({ limit: 1000 });
      const log = result.logs.find((log: ActivityLog) => log._id === id);
      if (!log) {
        throw new Error('Activity log not found');
      }
      return log;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Activity log not found</p>
            <p className="text-sm">
              The activity log you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/activity-logs')}>
          Back to Activity Logs
        </Button>
      </div>
    );
  }

  const log = data as ActivityLog;
  const user =
    typeof log.user === 'object'
      ? log.user
      : { firstName: 'Unknown', lastName: 'User', email: '' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/app/admin/activity-logs')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Activity Log Details
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {formatAction(log.action)} - {log.entityType}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getActionIcon(log.action)}
              Action Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Action
              </p>
              <p className="text-base font-semibold mt-1">
                {formatAction(log.action)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Entity Type
              </p>
              <p className="text-base mt-1">{log.entityType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Entity ID
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
                {log.entityId}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Severity
              </p>
              <div className="mt-1">
                <Badge variant={getSeverityBadgeVariant(log.severity)}>
                  {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User</p>
              <p className="text-base font-semibold mt-1">
                {user.firstName} {user.lastName}
              </p>
              {user.email && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user.email}
                </p>
              )}
            </div>
            {log.ipAddress && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  IP Address
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base font-mono">{log.ipAddress}</p>
                </div>
              </div>
            )}
            {log.userAgent && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  User Agent
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground break-all">
                    {log.userAgent}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Created At
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-base">
                {format(new Date(log.createdAt), 'MMMM dd, yyyy HH:mm:ss')}
              </p>
            </div>
          </div>
          {log.updatedAt !== log.createdAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Updated At
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">
                  {format(new Date(log.updatedAt), 'MMMM dd, yyyy HH:mm:ss')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {log.changes && Object.keys(log.changes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(log.changes).map(([key, change]) => (
                <div
                  key={key}
                  className="p-3 rounded-lg border border-border bg-muted/50"
                >
                  <p className="text-sm font-medium mb-2">{key}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Old</p>
                      <p className="text-sm break-all">
                        {typeof change.old === 'object'
                          ? JSON.stringify(change.old, null, 2)
                          : String(change.old || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">New</p>
                      <p className="text-sm break-all">
                        {typeof change.new === 'object'
                          ? JSON.stringify(change.new, null, 2)
                          : String(change.new || 'N/A')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
