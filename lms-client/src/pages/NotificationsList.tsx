import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Loader2, Check } from 'lucide-react';
import { notificationsApi } from '../lib/api/notifications';
import type { Notification } from '../types';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '../components/ui';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import {
  FormField,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  MultiSelect,
} from '../components/ui';
import { useQuery as useRQ } from '@tanstack/react-query';
import { usersApi } from '../lib/api/users';
import type { CreateNotificationData } from '../types';

export function NotificationsList() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'my', { page: 1, limit: 20 }],
    queryFn: () => notificationsApi.my({ page: 1, limit: 20 }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const createForm = useForm<CreateNotificationData>({
    defaultValues: {
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      targetAudience: user?.role === 'professor' ? 'students' : 'all',
      isPublished: true,
      isPinned: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: notificationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
      createForm.reset({
        title: '',
        content: '',
        type: 'general',
        priority: 'medium',
        targetAudience: user?.role === 'professor' ? 'students' : 'all',
        isPublished: true,
        isPinned: false,
      });
    },
  });

  const targetAudience = createForm.watch('targetAudience') ?? 'all';
  const { data: studentOptions = [] } = useRQ({
    queryKey: ['users', 'students', targetAudience],
    queryFn: async () => {
      const users = await usersApi.list({ role: 'student' });
      return users.map(u => ({
        value: u._id,
        label: `${u.firstName} ${u.lastName} (${u.email})`,
      }));
    },
    enabled: targetAudience === 'specific',
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending}
        >
          {markAllMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Mark all as read
        </Button>
      </div>

      {(user?.role === 'admin' || user?.role === 'professor') && (
        <Card>
          <CardHeader>
            <CardTitle>
              {user?.role === 'admin'
                ? 'Create Notification'
                : 'Create Notification to Students'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={createForm.handleSubmit(values =>
                createMutation.mutate(values)
              )}
            >
              <div className="md:col-span-2">
                <FormField
                  label="Title"
                  required
                  error={createForm.formState.errors.title?.message}
                >
                  <Input
                    placeholder="e.g., System Maintenance Tonight"
                    {...createForm.register('title', {
                      required: 'Title is required',
                    })}
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Content"
                  required
                  error={createForm.formState.errors.content?.message}
                >
                  <Textarea
                    rows={4}
                    placeholder="Write the announcement..."
                    {...createForm.register('content', {
                      required: 'Content is required',
                    })}
                  />
                </FormField>
              </div>
              <FormField label="Type">
                <Select
                  value={createForm.watch('type') ?? 'general'}
                  onValueChange={v =>
                    createForm.setValue(
                      'type',
                      v as CreateNotificationData['type']
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Priority">
                <Select
                  value={createForm.watch('priority') ?? 'medium'}
                  onValueChange={v =>
                    createForm.setValue(
                      'priority',
                      v as CreateNotificationData['priority']
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Target Audience">
                <Select
                  value={createForm.watch('targetAudience') ?? 'all'}
                  onValueChange={v =>
                    createForm.setValue(
                      'targetAudience',
                      v as CreateNotificationData['targetAudience']
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.role === 'admin' && (
                      <SelectItem value="all">All</SelectItem>
                    )}
                    <SelectItem value="students">Students</SelectItem>
                    {user?.role === 'admin' && (
                      <SelectItem value="professors">Professors</SelectItem>
                    )}
                    <SelectItem value="specific">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              {targetAudience === 'specific' && (
                <div className="md:col-span-2">
                  <FormField label="Select Users">
                    <MultiSelect
                      value={createForm.watch('targetUsers') ?? []}
                      onChange={vals =>
                        createForm.setValue('targetUsers', vals)
                      }
                      options={studentOptions}
                      placeholder="Choose users"
                      searchPlaceholder="Search users..."
                    />
                  </FormField>
                </div>
              )}
              <FormField label="Publish now">
                <Select
                  value={String(createForm.watch('isPublished') ?? true)}
                  onValueChange={v =>
                    createForm.setValue('isPublished', v === 'true')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No (draft)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Pin to top">
                <Select
                  value={String(createForm.watch('isPinned') ?? false)}
                  onValueChange={v =>
                    createForm.setValue('isPinned', v === 'true')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  loading={createMutation.isPending}
                >
                  Create notification
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No notifications yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: Notification) => {
            const isRead =
              Array.isArray(n.readBy) &&
              n.readBy.some(r => {
                const readerId =
                  typeof r.user === 'string' ? r.user : r.user?._id;
                return !!readerId && readerId === user?._id;
              });
            return (
              <Card key={n._id} className="border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{n.title}</CardTitle>
                      <div className="text-sm text-muted-foreground mt-1">
                        {n.type} • {n.priority}
                      </div>
                    </div>
                    {!isRead && <Badge variant="warning">Unread</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">{n.content}</div>
                  <div className="flex items-center justify-end gap-2">
                    {!isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markReadMutation.mutate(n._id)}
                        disabled={markReadMutation.isPending}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
