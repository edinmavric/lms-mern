import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, AlertCircle, Calendar, Clock } from 'lucide-react';

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

const lessonFormSchema = z
  .object({
    course: z.string().min(1, 'Course is required'),
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    materials: z.array(lessonMaterialSchema).optional(),
    date: z.string().min(1, 'Date is required'),
    startTime: z
      .string()
      .min(1, 'Start time is required')
      .regex(
        /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format (use HH:mm)'
      ),
    endTime: z
      .string()
      .min(1, 'End time is required')
      .regex(
        /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format (use HH:mm)'
      ),
  })
  .refine(
    data => {
      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      return endTotalMinutes > startTotalMinutes;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

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

      <FormField label="Date" required error={errors.date?.message}>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Input
              type="date"
              disabled={isSubmitting}
              error={errors.date?.message}
              icon={<Calendar className="h-4 w-4" />}
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
            />
          )}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Start Time"
          required
          error={errors.startTime?.message}
        >
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <Input
                type="time"
                disabled={isSubmitting}
                error={errors.startTime?.message}
                icon={<Clock className="h-4 w-4" />}
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                placeholder="09:00"
              />
            )}
          />
        </FormField>

        <FormField label="End Time" required error={errors.endTime?.message}>
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <Input
                type="time"
                disabled={isSubmitting}
                error={errors.endTime?.message}
                icon={<Clock className="h-4 w-4" />}
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                placeholder="11:00"
              />
            )}
          />
        </FormField>
      </div>

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
  const today = new Date().toISOString().split('T')[0];
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
      date: lesson?.date
        ? new Date(lesson.date).toISOString().split('T')[0]
        : today,
      startTime: lesson?.startTime || '09:00',
      endTime: lesson?.endTime || '11:00',
    },
  });

  return form;
}
