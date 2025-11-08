import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { enrollmentsApi } from '../../lib/api/enrollments';
import { usersApi } from '../../lib/api/users';
import { coursesApi } from '../../lib/api/courses';
import { getErrorMessage } from '../../lib/utils';
import {
  EnrollmentForm,
  useEnrollmentForm,
  type EnrollmentFormData,
} from './EnrollmentForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
} from '../../components/ui';

export function EnrollmentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: enrollment, isLoading } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => enrollmentsApi.getById(id!),
    enabled: !!id,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const form = useEnrollmentForm(enrollment);

  useEffect(() => {
    if (enrollment) {
      form.reset({
        student:
          typeof enrollment.student === 'string'
            ? enrollment.student
            : (enrollment.student as any)?._id || '',
        course:
          typeof enrollment.course === 'string'
            ? enrollment.course
            : (enrollment.course as any)?._id || '',
        status: enrollment.status || 'active',
      });
    }
  }, [enrollment, form]);

  const updateMutation = useMutation({
    mutationFn: (data: EnrollmentFormData) => {
      const updateData = {
        status: data.status || 'active',
      };
      return enrollmentsApi.update(id!, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', id] });
      toast.success('Enrollment updated successfully');
      navigate(`/app/admin/enrollments/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to update enrollment'
      );
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: EnrollmentFormData) => {
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

  if (!enrollment) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Enrollment not found</p>
            <p className="text-sm">
              The enrollment you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/enrollments')}>
          Back to Enrollments
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
          onClick={() => navigate(`/app/admin/enrollments/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Enrollment</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update enrollment information and status
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Details</CardTitle>
          <CardDescription>
            Update the enrollment status. Student and course cannot be changed
            after creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <EnrollmentForm
              isSubmitting={updateMutation.isPending}
              error={error}
              students={students}
              courses={courses}
              control={form.control}
              errors={form.formState.errors}
              allowEditStudentCourse={false}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/admin/enrollments/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                loading={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Enrollment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
