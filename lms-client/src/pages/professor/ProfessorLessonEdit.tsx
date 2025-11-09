import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { lessonsApi } from '../../lib/api/lessons';
import { coursesApi } from '../../lib/api/courses';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../lib/utils';
import {
  LessonForm,
  useLessonForm,
  type LessonFormData,
} from '../admin/LessonForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
} from '../../components/ui';

export function ProfessorLessonEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonsApi.getById(id!),
    enabled: !!id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
    enabled: !!user?._id,
  });

  const form = useLessonForm(lesson);

  useEffect(() => {
    if (lesson) {
      const lessonCourseId =
        typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
      const hasAccess = courses.some(c => c._id === lessonCourseId);

      if (!hasAccess) {
        setError('You do not have permission to edit this lesson');
        return;
      }

      form.reset({
        course: lessonCourseId,
        title: lesson.title || '',
        content: lesson.content || '',
        date: lesson.date
          ? new Date(lesson.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        startTime: lesson.startTime || '09:00',
        endTime: lesson.endTime || '11:00',
      });
    }
  }, [lesson, form, courses]);

  const updateMutation = useMutation({
    mutationFn: (data: LessonFormData) => {
      const updateData: any = {
        title: data.title,
        content: data.content,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
      };
      return lessonsApi.update(id!, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', id] });
      toast.success('Lesson updated successfully');
      navigate(`/app/professor/lessons/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(error, 'Failed to update lesson');
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: LessonFormData) => {
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

  if (!lesson) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Lesson not found</p>
            <p className="text-sm">
              The lesson you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/lessons')}>
          Back to Lessons
        </Button>
      </div>
    );
  }

  if (error && error.includes('permission')) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/lessons')}>
          Back to Lessons
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
          onClick={() => navigate(`/app/professor/lessons/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Lesson</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update lesson information and content
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>Update the lesson's information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <LessonForm
              isSubmitting={updateMutation.isPending}
              error={error}
              courses={courses}
              register={form.register}
              control={form.control}
              errors={form.formState.errors}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/professor/lessons/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                loading={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Lesson'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
