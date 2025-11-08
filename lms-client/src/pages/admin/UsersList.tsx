import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Edit,
  Trash2,
  UserCheck,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

import { usersApi } from '../../lib/api/users';
import { getErrorMessage } from '../../lib/utils';
import type { User } from '../../types';
import { UserForm, useUserForm, type UserFormData } from './UserForm';
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
  Dialog,
  DialogContent,
  DialogFooter,
  Alert,
  FormDialog,
} from '../../components/ui';

export function UsersList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchEmail, setSearchEmail] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', { role: filterRole || undefined, status: filterStatus || undefined, email: searchEmail || undefined }],
    queryFn: () =>
      usersApi.list({
        role: (filterRole || undefined) as 'admin' | 'professor' | 'student' | undefined,
        status: (filterStatus || undefined) as 'active' | 'pending' | 'disabled' | undefined,
        email: searchEmail || undefined,
      }),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersApi.list({}),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => usersApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User approved successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to approve user'));
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      if (!data.password) {
        throw new Error('Password is required for new users');
      }
      return usersApi.create({
        email: data.email,
        password: data.password!,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: data.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to create user'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserFormData }) => {
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: data.status,
      };
      if (data.password && data.password.trim()) {
        updateData.password = data.password;
      }
      return usersApi.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setEditDialog({ open: false, user: null });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update user'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setDeleteDialog({ open: false, user: null });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to delete user'));
    },
  });

  const handleApprove = (user: User) => {
    approveMutation.mutate(user._id);
  };

  const handleDelete = () => {
    if (deleteDialog.user) {
      deleteMutation.mutate(deleteDialog.user._id);
    }
  };

  const pendingUsers = allUsers.filter((u) => u.pendingApproval || u.status === 'pending');
  const activeUsers = allUsers.filter((u) => u.status === 'active' && !u.pendingApproval);

  const getRoleBadgeVariant = (role: User['role']) => {
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

  const getStatusBadgeVariant = (user: User) => {
    if (user.pendingApproval || user.status === 'pending') {
      return 'warning';
    }
    if (user.status === 'active') {
      return 'success';
    }
    if (user.status === 'disabled') {
      return 'destructive';
    }
    return 'outline';
  };

  const getStatusLabel = (user: User) => {
    if (user.pendingApproval || user.status === 'pending') {
      return 'Pending';
    }
    return user.status.charAt(0).toUpperCase() + user.status.slice(1);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage users, approve registrations, and control access
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold">{pendingUsers.length}</p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <UserCheck className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Users
                </p>
                <p className="text-2xl font-bold">{activeUsers.length}</p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold">{allUsers.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Input
                placeholder="Search by email..."
                icon={<Search className="h-4 w-4" />}
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filterRole || 'all'}
              onValueChange={(value) => setFilterRole(value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus || 'all'}
              onValueChange={(value) => setFilterStatus(value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Created
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          navigate(`/app/admin/users/${user._id}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!(e.target as HTMLElement).closest('button')) {
                              navigate(`/app/admin/users/${user._id}`);
                            }
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${user.firstName} ${user.lastName}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusBadgeVariant(user)}>
                            {getStatusLabel(user)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {(user.pendingApproval || user.status === 'pending') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(user)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditDialog({ open: true, user })}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({ open: true, user })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3 p-4">
                {users.map((user) => (
                  <Card 
                    key={user._id} 
                    className="border-border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      navigate(`/app/admin/users/${user._id}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!(e.target as HTMLElement).closest('button')) {
                          navigate(`/app/admin/users/${user._id}`);
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${user.firstName} ${user.lastName}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit">
                            {user.role}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(user)} className="w-fit">
                            {getStatusLabel(user)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        {(user.pendingApproval || user.status === 'pending') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(user)}
                            disabled={approveMutation.isPending}
                            className="flex-1 min-w-[100px]"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditDialog({ open: true, user })}
                          className="flex-1 min-w-[100px]"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, user })}
                          className="flex-1 min-w-[100px]"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        isSubmitting={createMutation.isPending}
        error={createMutation.error ? getErrorMessage(createMutation.error, 'Failed to create user') : null}
      />

      {editDialog.user && (
        <EditUserDialog
          open={editDialog.open}
          user={editDialog.user}
          onClose={() => setEditDialog({ open: false, user: null })}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({ id: editDialog.user!._id, data });
          }}
          isSubmitting={updateMutation.isPending}
          error={updateMutation.error ? getErrorMessage(updateMutation.error, 'Failed to update user') : null}
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteDialog.user?.firstName} ${deleteDialog.user?.lastName}? This action cannot be undone.`}
      >
        <DialogContent>
          <Alert variant="destructive">
            <div className="space-y-1">
              <p className="font-medium">Warning</p>
              <p className="text-sm">
                Deleting this user will permanently remove their account and all
                associated data.
              </p>
            </div>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, user: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function CreateUserDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: CreateUserDialogProps) {
  const form = useUserForm();

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      try {
        await onSubmit(form.getValues());
        form.reset();
      } catch (err) {
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title="Create User"
      description="Fill in the information below to create a new user account."
      onSubmit={handleSubmit}
      submitLabel="Create User"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <UserForm
        isSubmitting={isSubmitting}
        error={error}
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
      />
    </FormDialog>
  );
}

interface EditUserDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function EditUserDialog({
  open,
  user,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: EditUserDialogProps) {
  const form = useUserForm(user);

  useEffect(() => {
    if (open && user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'student',
        status: user.status || 'active',
        password: '',
      });
    }
  }, [open, user, form]);

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      try {
        await onSubmit(form.getValues());
      } catch (err) {
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title="Edit User"
      description="Update the user's information. Email cannot be changed."
      onSubmit={handleSubmit}
      submitLabel="Update User"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <UserForm
        user={user}
        isSubmitting={isSubmitting}
        error={error}
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
      />
    </FormDialog>
  );
}

