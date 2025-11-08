import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Hash } from 'lucide-react';

import type { Grade } from '../../types';
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

const gradeFormSchema = z.object({
  student: z.string().min(1, 'Student is required'),
  course: z.string().min(1, 'Course is required'),
  value: z.number().min(0, 'Grade value must be non-negative'),
  comment: z.string().optional(),
  attempt: z.number().min(1, 'Attempt must be at least 1').optional(),
});

export type GradeFormData = z.infer<typeof gradeFormSchema>;

interface GradeFormProps {
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
  register: ReturnType<typeof useForm<GradeFormData>>['register'];
  control: ReturnType<typeof useForm<GradeFormData>>['control'];
  errors: ReturnType<typeof useForm<GradeFormData>>['formState']['errors'];
  allowEditStudentCourse?: boolean;
  minGrade?: number;
  maxGrade?: number;
}

export function GradeForm({
  isSubmitting = false,
  error,
  students = [],
  courses = [],
  register,
  control,
  errors,
  allowEditStudentCourse = true,
  minGrade,
  maxGrade,
}: GradeFormProps) {
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

      <FormField label="Grade Value" required error={errors.value?.message}>
        {minGrade !== undefined && maxGrade !== undefined && (
          <p className="text-xs text-muted-foreground mb-2">
            Grade must be between {minGrade} and {maxGrade}
          </p>
        )}
        <Controller
          name="value"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              step="0.01"
              min={minGrade !== undefined ? minGrade : 0}
              max={maxGrade !== undefined ? maxGrade : undefined}
              placeholder="0.00"
              disabled={isSubmitting}
              error={errors.value?.message}
              icon={<Hash className="h-4 w-4" />}
              value={
                field.value === undefined || field.value === null
                  ? ''
                  : String(field.value)
              }
              onChange={e => {
                const value = e.target.value;
                if (value === '') {
                  field.onChange(0);
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

      <FormField label="Attempt" error={errors.attempt?.message}>
        <Controller
          name="attempt"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              min="1"
              step="1"
              placeholder="1"
              disabled={isSubmitting}
              error={errors.attempt?.message}
              value={
                field.value === undefined || field.value === null
                  ? ''
                  : String(field.value)
              }
              onChange={e => {
                const value = e.target.value;
                if (value === '') {
                  field.onChange(1);
                } else {
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue)) {
                    field.onChange(numValue);
                  }
                }
              }}
            />
          )}
        />
      </FormField>

      <FormField label="Comment" error={errors.comment?.message}>
        <Textarea
          {...register('comment')}
          placeholder="Optional comment about the grade..."
          disabled={isSubmitting}
          error={errors.comment?.message}
          rows={3}
        />
      </FormField>
    </div>
  );
}

export function useGradeForm(grade?: Grade) {
  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      student:
        typeof grade?.student === 'string'
          ? grade.student
          : (grade?.student as any)?._id || '',
      course:
        typeof grade?.course === 'string'
          ? grade.course
          : (grade?.course as any)?._id || '',
      value: grade?.value !== undefined ? grade.value : 0,
      comment: grade?.comment || '',
      attempt: grade?.attempt || 1,
    },
  });

  return form;
}
