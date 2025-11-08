import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';

import type { Enrollment } from '../../types';
import {
  FormField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Alert,
} from '../../components/ui';

const enrollmentFormSchema = z.object({
  student: z.string().min(1, 'Student is required'),
  course: z.string().min(1, 'Course is required'),
  status: z.enum(['active', 'completed', 'cancelled', 'paused']).optional(),
});

export type EnrollmentFormData = z.infer<typeof enrollmentFormSchema>;

interface EnrollmentFormProps {
  isSubmitting?: boolean;
  error?: string | null;
  students?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  courses?: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
  control: ReturnType<typeof useForm<EnrollmentFormData>>['control'];
  errors: ReturnType<typeof useForm<EnrollmentFormData>>['formState']['errors'];
  allowEditStudentCourse?: boolean;
}

export function EnrollmentForm({
  isSubmitting = false,
  error,
  students = [],
  courses = [],
  control,
  errors,
  allowEditStudentCourse = true,
}: EnrollmentFormProps) {
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="space-y-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
      )}

      <FormField label="Student" required error={errors.student?.message}>
        <Controller
          name="student"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting || !allowEditStudentCourse}
            >
              <SelectTrigger error={!!errors.student}>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField label="Course" required error={errors.course?.message}>
        <Controller
          name="course"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting || !allowEditStudentCourse}
            >
              <SelectTrigger error={!!errors.course}>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField label="Status" error={errors.status?.message}>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || 'active'}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <SelectTrigger error={!!errors.status}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
    </div>
  );
}

export function useEnrollmentForm(enrollment?: Enrollment) {
  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: {
      student:
        typeof enrollment?.student === 'string'
          ? enrollment.student
          : (enrollment?.student as any)?._id || '',
      course:
        typeof enrollment?.course === 'string'
          ? enrollment.course
          : (enrollment?.course as any)?._id || '',
      status: enrollment?.status || 'active',
    },
  });

  return form;
}
