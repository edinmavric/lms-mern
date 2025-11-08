import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';

import { departmentsApi } from '../../lib/api/departments';
import { getErrorMessage } from '../../lib/utils';
import {
  DepartmentForm,
  useDepartmentForm,
  type DepartmentFormData,
} from './DepartmentForm';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Alert,
} from '../../components/ui';

export function DepartmentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    data: department,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentsApi.getById(id!),
    enabled: !!id,
  });

  const form = useDepartmentForm(department);

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name || '',
        description: department.description || '',
      });
    }
  }, [department, form]);

  const updateMutation = useMutation({
    mutationFn: (data: DepartmentFormData) => {
      const updateData = {
        name: data.name,
        description: data.description,
      };
      return departmentsApi.update(id!, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', id] });
      toast.success('Department updated successfully');
      navigate(`/app/admin/departments/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to update department'
      );
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: DepartmentFormData) => {
    setError(null);
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (fetchError || !department) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Department not found</p>
            <p className="text-sm">
              The department you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/departments')}>
          Back to Departments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/app/admin/departments/${id}`)}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Department</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update the details for {department.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Department Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <DepartmentForm
              department={department}
              register={form.register}
              errors={form.formState.errors}
              isSubmitting={updateMutation.isPending}
              error={error}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/admin/departments/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                Update Department
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
