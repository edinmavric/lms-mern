import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { coursesApi } from '../../lib/api/courses';
import { usersApi } from '../../lib/api/users';
import { departmentsApi } from '../../lib/api/departments';
import { getErrorMessage } from '../../lib/utils';
import { CourseForm, useCourseForm, type CourseFormData } from './CourseForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
} from '../../components/ui';

export function CourseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getById(id!),
    enabled: !!id,
  });

  const { data: professors = [] } = useQuery({
    queryKey: ['users', 'professors'],
    queryFn: () => usersApi.list({ role: 'professor', status: 'active' }),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: () => departmentsApi.list({}),
  });

  const form = useCourseForm(course);

  useEffect(() => {
    if (course) {
      form.reset({
        name: course.name || '',
        description: course.description || '',
        professor:
          typeof course.professor === 'string'
            ? course.professor
            : course.professor?._id || '',
        department:
          typeof course.department === 'string'
            ? course.department
            : course.department?._id || undefined,
        price: course.price !== undefined ? course.price : '',
        enrollmentPassword: course.enrollmentPassword || '',
        schedule: course.schedule || {
          days: [],
          startTime: '',
          endTime: '',
        },
      });
    }
  }, [course, form]);

  const updateMutation = useMutation({
    mutationFn: (data: CourseFormData) => {
      const updateData: any = {
        name: data.name,
        description: data.description,
        professor: data.professor,
        price:
          data.price && data.price !== '' && typeof data.price === 'number'
            ? data.price
            : undefined,
        schedule:
          data.schedule &&
          (data.schedule.days ||
            data.schedule.startTime ||
            data.schedule.endTime)
            ? {
                days: data.schedule.days || [],
                startTime: data.schedule.startTime || '',
                endTime: data.schedule.endTime || '',
              }
            : undefined,
      };
      return coursesApi.update(id!, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      toast.success('Course updated successfully');
      navigate(`/app/admin/courses/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(error, 'Failed to update course');
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: CourseFormData) => {
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

  if (!course) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Course not found</p>
            <p className="text-sm">
              The course you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/courses')}>
          Back to Courses
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
          onClick={() => navigate(`/app/admin/courses/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update course information and settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Update the course's information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <CourseForm
              course={course}
              isSubmitting={updateMutation.isPending}
              error={error}
              professors={professors}
              departments={departments}
              register={form.register}
              control={form.control}
              errors={form.formState.errors}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/admin/courses/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                loading={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Course'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
