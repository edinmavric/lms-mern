import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';

import type { Attendance } from '../../types';
import {
  Input,
  FormField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Alert,
} from '../../components/ui';

const attendanceFormSchema = z.object({
  student: z.string().min(1, 'Student is required'),
  lesson: z.string().min(1, 'Lesson is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['present', 'absent', 'late', 'excused']),
});

export type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

interface AttendanceFormProps {
  isSubmitting?: boolean;
  error?: string | null;
  students?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  lessons?: Array<{
    _id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    course?:
      | string
      | {
          _id: string;
          name: string;
        };
  }>;
  register: ReturnType<typeof useForm<AttendanceFormData>>['register'];
  control: ReturnType<typeof useForm<AttendanceFormData>>['control'];
  errors: ReturnType<typeof useForm<AttendanceFormData>>['formState']['errors'];
  allowEditStudentLesson?: boolean;
}

export function AttendanceForm({
  isSubmitting = false,
  error,
  students = [],
  lessons = [],
  control,
  errors,
  allowEditStudentLesson = true,
}: AttendanceFormProps) {
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
              disabled={isSubmitting || !allowEditStudentLesson}
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

      <FormField label="Lesson" required error={errors.lesson?.message}>
        <Controller
          name="lesson"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting || !allowEditStudentLesson}
            >
              <SelectTrigger error={!!errors.lesson}>
                <SelectValue placeholder="Select lesson" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map(lesson => {
                  const courseName =
                    typeof lesson.course === 'object'
                      ? lesson.course?.name
                      : 'Unknown Course';
                  const lessonDate = new Date(lesson.date).toLocaleDateString();
                  return (
                    <SelectItem key={lesson._id} value={lesson._id}>
                      {lesson.title} - {courseName} ({lessonDate}{' '}
                      {lesson.startTime}-{lesson.endTime})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
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

      <FormField label="Status" required error={errors.status?.message}>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <SelectTrigger error={!!errors.status}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Present
                  </div>
                </SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="excused">Excused</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
    </div>
  );
}

export function useAttendanceForm(attendance?: Attendance) {
  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      student:
        typeof attendance?.student === 'string'
          ? attendance.student
          : (attendance?.student as any)?._id || '',
      lesson:
        typeof attendance?.lesson === 'string'
          ? attendance.lesson
          : (attendance?.lesson as any)?._id || '',
      date: attendance?.date
        ? new Date(attendance.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      status: attendance?.status || 'present',
    },
  });

  return form;
}
