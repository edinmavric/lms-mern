import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { attendanceApi } from '../../lib/api/attendance';
import { usersApi } from '../../lib/api/users';
import { coursesApi } from '../../lib/api/courses';
import { getErrorMessage } from '../../lib/utils';
import {
  AttendanceForm,
  useAttendanceForm,
  type AttendanceFormData,
} from './AttendanceForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
} from '../../components/ui';

export function AttendanceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => attendanceApi.getById(id!),
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

  const form = useAttendanceForm(attendance);

  useEffect(() => {
    if (attendance) {
      form.reset({
        student:
          typeof attendance.student === 'string'
            ? attendance.student
            : (attendance.student as any)?._id || '',
        course:
          typeof attendance.course === 'string'
            ? attendance.course
            : attendance.course
              ? (attendance.course as any)?._id
              : undefined,
        date: attendance.date
          ? new Date(attendance.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: attendance.status || 'present',
      });
    }
  }, [attendance, form]);

  const updateMutation = useMutation({
    mutationFn: (data: AttendanceFormData) => {
      const updateData = {
        status: data.status,
        date: data.date,
      };
      return attendanceApi.update(id!, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', id] });
      toast.success('Attendance updated successfully');
      navigate(`/app/admin/attendances/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to update attendance'
      );
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: AttendanceFormData) => {
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

  if (!attendance) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Attendance record not found</p>
            <p className="text-sm">
              The attendance record you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/attendances')}>
          Back to Attendance
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
          onClick={() => navigate(`/app/admin/attendances/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Attendance</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update attendance information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
          <CardDescription>
            Update the attendance status and date. Student and course cannot be
            changed after creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <AttendanceForm
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
                onClick={() => navigate(`/app/admin/attendances/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                loading={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Attendance'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
