import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import { usersApi } from '../../lib/api/users';
import { getErrorMessage } from '../../lib/utils';
import { UserForm, useUserForm, type UserFormData } from './UserForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '../../components/ui';

export function UserCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const form = useUserForm();

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
      navigate('/app/admin/users');
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error, 'Failed to create user');
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: UserFormData) => {
    setError(null);
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/app/admin/users')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create User</h1>
          <p className="text-muted-foreground mt-1">
            Add a new user to your organization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <UserForm
              isSubmitting={createMutation.isPending}
              error={error}
              register={form.register}
              control={form.control}
              errors={form.formState.errors}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/app/admin/users')}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                loading={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
