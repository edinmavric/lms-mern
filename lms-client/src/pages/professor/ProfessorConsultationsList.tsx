import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Loader2, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { consultationsApi } from '../../lib/api/consultations';
import { coursesApi } from '../../lib/api/courses';
import type { Consultation, CreateConsultationData, Course } from '../../types';
import { getErrorMessage } from '../../lib/utils';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  FormField,
  Input,
  MultiSelect,
} from '../../components/ui';
import { useForm } from 'react-hook-form';

export function ProfessorConsultationsList() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const form = useForm<CreateConsultationData>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      roomNumber: '',
      maxStudents: undefined,
      courses: [],
      notes: '',
    },
  });

  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
    enabled: !!user?._id,
  });

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations', { professorId: user?._id }],
    queryFn: () => consultationsApi.list({ professorId: user?._id }),
    enabled: !!user?._id,
  });

  const createMutation = useMutation({
    mutationFn: consultationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      setOpen(false);
      form.reset();
    },
    onError: error => {
      const msg = getErrorMessage(error, 'Failed to create consultation');
      console.error(msg);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Consultations</h1>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Consultation
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Loading consultations...
        </div>
      ) : consultations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No consultations yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {consultations.map((c: Consultation) => {
            const courses = (c.courses || []).map(course =>
              typeof course === 'string' ? course : course.name
            );
            return (
              <Card key={c._id} className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{c.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(c.date).toLocaleDateString()} {c.startTime} -{' '}
                      {c.endTime}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Room:{' '}
                    <span className="font-medium text-foreground">
                      {c.roomNumber}
                    </span>
                  </div>
                  <div className="text-sm">
                    Courses: {courses.length ? courses.join(', ') : '—'}
                  </div>
                  <div className="text-sm flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {c.registeredStudents?.length || 0}{' '}
                    {c.maxStudents ? ` / ${c.maxStudents}` : ''}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
        }}
        title="Create Consultation"
        description="Set up office hours for your students"
      >
        <DialogContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(values =>
              createMutation.mutate(values)
            )}
          >
            <FormField
              label="Title"
              error={form.formState.errors.title?.message}
            >
              <Input
                {...form.register('title', { required: 'Title is required' })}
              />
            </FormField>
            <FormField label="Description">
              <Input {...form.register('description')} />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Date"
                error={form.formState.errors.date?.message}
              >
                <Input
                  type="date"
                  {...form.register('date', { required: 'Date is required' })}
                />
              </FormField>
              <FormField
                label="Start Time"
                error={form.formState.errors.startTime?.message}
              >
                <Input
                  placeholder="HH:MM"
                  {...form.register('startTime', {
                    required: 'Start time is required',
                  })}
                />
              </FormField>
              <FormField
                label="End Time"
                error={form.formState.errors.endTime?.message}
              >
                <Input
                  placeholder="HH:MM"
                  {...form.register('endTime', {
                    required: 'End time is required',
                  })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Room Number"
                error={form.formState.errors.roomNumber?.message}
              >
                <Input
                  {...form.register('roomNumber', {
                    required: 'Room number is required',
                  })}
                />
              </FormField>
              <FormField label="Max Students">
                <Input
                  type="number"
                  {...form.register('maxStudents', { valueAsNumber: true })}
                />
              </FormField>
            </div>
            <FormField label="Courses">
              <MultiSelect
                value={(form.watch('courses') as string[]) || []}
                onChange={(vals: string[]) => form.setValue('courses', vals)}
                options={(myCourses as Course[]).map(c => ({
                  value: c._id,
                  label: c.name,
                }))}
                placeholder="Select courses"
                searchPlaceholder="Search courses..."
              />
            </FormField>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />{' '}
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
