import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookOpen,
  DollarSign,
  AlertCircle,
  Lock,
} from 'lucide-react';

import type { Course } from '../../types';
import {
  Input,
  FormField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Alert,
  Textarea,
} from '../../components/ui';

const courseFormSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  description: z.string().optional(),
  professor: z.string().min(1, 'Professor is required'),
  department: z.string().optional(),
  price: z
    .union([
      z.number().min(0, 'Price must be non-negative'),
      z.string(),
      z.literal(''),
    ])
    .optional(),
  enrollmentPassword: z.string().optional(),
  schedule: z
    .object({
      days: z.array(z.string()).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    })
    .optional(),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  course?: Course;
  isSubmitting?: boolean;
  error?: string | null;
  professors?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  departments?: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
  register: ReturnType<typeof useForm<CourseFormData>>['register'];
  control: ReturnType<typeof useForm<CourseFormData>>['control'];
  errors: ReturnType<typeof useForm<CourseFormData>>['formState']['errors'];
}

export function CourseForm({
  isSubmitting = false,
  error,
  professors = [],
  departments = [],
  register,
  control,
  errors,
}: CourseFormProps) {
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

      <FormField label="Course Name" required error={errors.name?.message}>
        <Input
          {...register('name')}
          placeholder="Introduction to Computer Science"
          disabled={isSubmitting}
          error={errors.name?.message}
          icon={<BookOpen className="h-4 w-4" />}
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea
          {...register('description')}
          placeholder="Course description..."
          disabled={isSubmitting}
          error={errors.description?.message}
          rows={4}
        />
      </FormField>

      <FormField label="Professor" required error={errors.professor?.message}>
        <Controller
          name="professor"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <SelectTrigger error={!!errors.professor}>
                <SelectValue placeholder="Select professor" />
              </SelectTrigger>
              <SelectContent>
                {professors.map(prof => (
                  <SelectItem key={prof._id} value={prof._id}>
                    {prof.firstName} {prof.lastName} ({prof.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField label="Department" error={errors.department?.message}>
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || '__none__'}
              onValueChange={value =>
                field.onChange(value === '__none__' ? undefined : value)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger error={!!errors.department}>
                <SelectValue placeholder="Select department (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No Department</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField label="Price" error={errors.price?.message}>
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              disabled={isSubmitting}
              error={errors.price?.message}
              icon={<DollarSign className="h-4 w-4" />}
              value={
                field.value === '' || field.value === undefined
                  ? ''
                  : typeof field.value === 'number'
                  ? field.value
                  : ''
              }
              onChange={e => {
                const value = e.target.value;
                if (value === '') {
                  field.onChange('');
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    field.onChange(numValue);
                  }
                }
              }}
            />
          )}
        />
      </FormField>

      <FormField
        label="Enrollment Password"
        error={errors.enrollmentPassword?.message}
        helperText="Optional password required for students to enroll in this course"
      >
        <Input
          {...register('enrollmentPassword')}
          type="password"
          placeholder="Leave empty for open enrollment"
          disabled={isSubmitting}
          error={errors.enrollmentPassword?.message}
          icon={<Lock className="h-4 w-4" />}
        />
      </FormField>
    </div>
  );
}

export function useCourseForm(course?: Course) {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: course?.name || '',
      description: course?.description || '',
      professor:
        typeof course?.professor === 'string'
          ? course.professor
          : course?.professor?._id || '',
      department:
        typeof course?.department === 'string'
          ? course.department
          : course?.department?._id || undefined,
      price: course?.price !== undefined ? course.price : '',
      enrollmentPassword: course?.enrollmentPassword || '',
      schedule: course?.schedule || {
        days: [],
        startTime: '',
        endTime: '',
      },
    },
  });

  return form;
}
