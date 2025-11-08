import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { gradesApi } from '../../lib/api/grades';
import { usersApi } from '../../lib/api/users';
import { coursesApi } from '../../lib/api/courses';
import { getErrorMessage } from '../../lib/utils';
import { GradeForm, useGradeForm, type GradeFormData } from './GradeForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
} from '../../components/ui';

export function GradeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: grade, isLoading } = useQuery({
    queryKey: ['grade', id],
    queryFn: () => gradesApi.getById(id!),
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

  const form = useGradeForm(grade);

  useEffect(() => {
    if (grade) {
      form.reset({
        student:
          typeof grade.student === 'string'
            ? grade.student
            : (grade.student as any)?._id || '',
        course:
          typeof grade.course === 'string'
            ? grade.course
            : (grade.course as any)?._id || '',
        value: grade.value || 0,
        comment: grade.comment || '',
        attempt: grade.attempt || 1,
      });
    }
  }, [grade, form]);

  const updateMutation = useMutation({
    mutationFn: (data: GradeFormData) => {
      const updateData = {
        value: data.value,
        comment: data.comment,
      };
      return gradesApi.update(id!, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['grade', id] });
      toast.success('Grade updated successfully');
      navigate(`/app/admin/grades/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(error, 'Failed to update grade');
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: GradeFormData) => {
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

  if (!grade) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Grade not found</p>
            <p className="text-sm">
              The grade you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/grades')}>
          Back to Grades
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
          onClick={() => navigate(`/app/admin/grades/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Grade</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update grade information and value
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Details</CardTitle>
          <CardDescription>
            Update the grade value and comment. Student and course cannot be
            changed after creation. Changing the grade value will create a
            history entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <GradeForm
              isSubmitting={updateMutation.isPending}
              error={error}
              students={students}
              courses={courses}
              register={form.register}
              control={form.control}
              errors={form.formState.errors}
              allowEditStudentCourse={false}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/admin/grades/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                loading={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Grade'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
