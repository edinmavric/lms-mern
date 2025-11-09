import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Activity,
  Filter,
  Calendar,
  User,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

import { activityLogsApi } from '../../lib/api/activityLogs';
import type { ActivityLog } from '../../types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Alert,
} from '../../components/ui';

const ACTION_OPTIONS = [
  { value: 'user.created', label: 'User Created' },
  { value: 'user.updated', label: 'User Updated' },
  { value: 'user.deleted', label: 'User Deleted' },
  { value: 'user.login', label: 'User Login' },
  { value: 'course.created', label: 'Course Created' },
  { value: 'course.updated', label: 'Course Updated' },
  { value: 'course.deleted', label: 'Course Deleted' },
  { value: 'lesson.created', label: 'Lesson Created' },
  { value: 'lesson.updated', label: 'Lesson Updated' },
  { value: 'exam.created', label: 'Exam Created' },
  { value: 'exam.graded', label: 'Exam Graded' },
  { value: 'grade.created', label: 'Grade Created' },
  { value: 'grade.updated', label: 'Grade Updated' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'User', label: 'User' },
  { value: 'Course', label: 'Course' },
  { value: 'Lesson', label: 'Lesson' },
  { value: 'Grade', label: 'Grade' },
  { value: 'Exam', label: 'Exam' },
  { value: 'ExamSubscription', label: 'Exam Subscription' },
  { value: 'Attendance', label: 'Attendance' },
  { value: 'Enrollment', label: 'Enrollment' },
  { value: 'Department', label: 'Department' },
  { value: 'BankAccount', label: 'Bank Account' },
  { value: 'LessonMaterial', label: 'Lesson Material' },
  { value: 'Point', label: 'Point' },
  { value: 'Tenant', label: 'Tenant' },
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

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

export function ActivityLogsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [filterAction, setFilterAction] = useState<string>('__clear__');
  const [filterEntityType, setFilterEntityType] = useState<string>('__clear__');
  const [filterSeverity, setFilterSeverity] = useState<string>('__clear__');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const getActionParam = () => {
    return filterAction === '__clear__' ? undefined : filterAction;
  };

  const getEntityTypeParam = () => {
    return filterEntityType === '__clear__' ? undefined : filterEntityType;
  };

  const getSeverityParam = () => {
    return filterSeverity === '__clear__' ? undefined : (filterSeverity as any);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'activityLogs',
      {
        page,
        limit,
        action: getActionParam(),
        entityType: getEntityTypeParam(),
        severity: getSeverityParam(),
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      },
    ],
    queryFn: () =>
      activityLogsApi.list({
        page,
        limit,
        action: getActionParam(),
        entityType: getEntityTypeParam(),
        severity: getSeverityParam(),
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      }),
  });

  const handleResetFilters = () => {
    setFilterAction('__clear__');
    setFilterEntityType('__clear__');
    setFilterSeverity('__clear__');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Monitor system activity and user actions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__clear__">All Actions</SelectItem>
                  {ACTION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Entity Type
              </label>
              <Select
                value={filterEntityType}
                onValueChange={setFilterEntityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Entity Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__clear__">All Entity Types</SelectItem>
                  {ENTITY_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__clear__">All Severities</SelectItem>
                  {SEVERITY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Start Date
              </label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
                icon={<Calendar className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
                icon={<Calendar className="h-4 w-4" />}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading activity logs...
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-4">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <p className="font-medium">Error loading activity logs</p>
                <p className="text-sm">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            </Alert>
          ) : !data || data.logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        User
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Action
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Entity
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Severity
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.logs.map((log: ActivityLog) => {
                      const user =
                        typeof log.user === 'object'
                          ? log.user
                          : { firstName: '', lastName: '', email: '' };
                      return (
                        <tr
                          key={log._id}
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() =>
                            navigate(`/app/admin/activity-logs/${log._id}`)
                          }
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(
                                  new Date(log.createdAt),
                                  'MMM dd, yyyy HH:mm'
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {typeof log.user === 'object' ? (
                              <div className="text-sm">
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {user.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Unknown
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <span className="text-sm font-medium">
                                {formatAction(log.action)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="font-medium">
                                {log.entityType}
                              </div>
                              <div className="text-muted-foreground text-xs font-mono">
                                {log.entityId.substring(0, 8)}...
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={getSeverityBadgeVariant(log.severity)}
                            >
                              {log.severity}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground font-mono">
                              {log.ipAddress || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3 p-4">
                {data.logs.map((log: ActivityLog) => {
                  const user =
                    typeof log.user === 'object'
                      ? log.user
                      : { firstName: '', lastName: '', email: '' };
                  return (
                    <Card
                      key={log._id}
                      className="border-border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        navigate(`/app/admin/activity-logs/${log._id}`)
                      }
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span className="font-semibold text-base">
                              {formatAction(log.action)}
                            </span>
                          </div>
                          <Badge
                            variant={getSeverityBadgeVariant(log.severity)}
                          >
                            {log.severity}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              User:{' '}
                            </span>
                            {typeof log.user === 'object' ? (
                              <span className="font-medium">
                                {user.firstName} {user.lastName}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Unknown
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Entity:{' '}
                            </span>
                            <span className="font-medium">
                              {log.entityType}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Time:{' '}
                            </span>
                            <span>
                              {format(
                                new Date(log.createdAt),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </span>
                          </div>
                          {log.ipAddress && (
                            <div>
                              <span className="text-muted-foreground">
                                IP:{' '}
                              </span>
                              <span className="font-mono text-xs">
                                {log.ipAddress}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {data.pagination && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing{' '}
                    {(data.pagination.page - 1) * data.pagination.limit + 1} to{' '}
                    {Math.min(
                      data.pagination.page * data.pagination.limit,
                      data.pagination.total
                    )}{' '}
                    of {data.pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={data.pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {data.pagination.page} of{' '}
                      {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage(p =>
                          Math.min(data.pagination.totalPages, p + 1)
                        )
                      }
                      disabled={
                        data.pagination.page === data.pagination.totalPages
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
