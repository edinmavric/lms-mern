import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, AlertCircle } from 'lucide-react';

import type { Lesson } from '../../types';
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

const lessonMaterialSchema = z.object({
  type: z.enum(['pdf', 'video', 'presentation', 'link']),
  url: z.string().min(1, 'URL is required'),
  storageKey: z.string().optional(),
});

const lessonFormSchema = z.object({
  course: z.string().min(1, 'Course is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  materials: z.array(lessonMaterialSchema).optional(),
});

export type LessonFormData = z.infer<typeof lessonFormSchema>;

interface LessonFormProps {
  isSubmitting?: boolean;
  error?: string | null;
  courses?: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
  register: ReturnType<typeof useForm<LessonFormData>>['register'];
  control: ReturnType<typeof useForm<LessonFormData>>['control'];
  errors: ReturnType<typeof useForm<LessonFormData>>['formState']['errors'];
}

export function LessonForm({
  isSubmitting = false,
  error,
  courses = [],
  register,
  control,
  errors,
}: LessonFormProps) {
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

      <FormField label="Course" required error={errors.course?.message}>
        <Controller
          name="course"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
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

      <FormField label="Title" required error={errors.title?.message}>
        <Input
          {...register('title')}
          placeholder="Introduction to React"
          disabled={isSubmitting}
          error={errors.title?.message}
          icon={<BookOpen className="h-4 w-4" />}
        />
      </FormField>

      <FormField label="Content" error={errors.content?.message}>
        <Textarea
          {...register('content')}
          placeholder="Lesson content..."
          disabled={isSubmitting}
          error={errors.content?.message}
          rows={6}
        />
      </FormField>
    </div>
  );
}

export function useLessonForm(lesson?: Lesson) {
  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      course:
        typeof lesson?.course === 'string'
          ? lesson.course
          : (lesson?.course as any)?._id || '',
      title: lesson?.title || '',
      content: lesson?.content || '',
      materials: lesson?.materials || [],
    },
  });

  return form;
}

