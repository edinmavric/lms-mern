import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Loader2, Users } from 'lucide-react';
import { consultationsApi } from '../../lib/api/consultations';
import { coursesApi } from '../../lib/api/courses';
import { usersApi } from '../../lib/api/users';
import type {
  Consultation,
  CreateConsultationData,
  Course,
  User as IUser,
} from '../../types';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  MultiSelect,
  Badge,
} from '../../components/ui';
import { useForm } from 'react-hook-form';

export function AdminConsultationsList() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>('');

  const form = useForm<CreateConsultationData & { professor?: string }>({
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

  const { data: professors = [] } = useQuery({
    queryKey: ['users', 'professors'],
    queryFn: () => usersApi.list({ role: 'professor' }),
    staleTime: 120_000,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
    staleTime: 120_000,
  });

  const filteredCourses = useMemo(() => {
    if (!selectedProfessorId) return courses as Course[];
    return (courses as Course[]).filter(c => {
      const pid =
        typeof c.professor === 'string' ? c.professor : c.professor?._id;
      return pid === selectedProfessorId;
    });
  }, [courses, selectedProfessorId]);

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations', 'all'],
    queryFn: () => consultationsApi.list({}),
  });

  const createMutation = useMutation({
    mutationFn: async (
      payload: CreateConsultationData & { professor?: string }
    ) => {
      const data: any = { ...payload };
      if (selectedProfessorId) {
        data.professor = selectedProfessorId;
      }
      return consultationsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      setOpen(false);
      form.reset();
      setSelectedProfessorId('');
    },
    onError: error => {
      const msg = getErrorMessage(error, 'Failed to create consultation');
      console.error(msg);
    },
  });

  useEffect(() => {
    // When professor changes, limit selected courses to that professor
    const current = (form.getValues('courses') as string[]) || [];
    if (!selectedProfessorId) return;
    const allowed = new Set(filteredCourses.map(c => c._id));
    const next = current.filter(id => allowed.has(id));
    if (next.length !== current.length) {
      form.setValue('courses', next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfessorId, filteredCourses.length]);

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
          {(consultations as Consultation[]).map(c => {
            const professor =
              typeof c.professor === 'string' ? null : (c.professor as IUser);
            const coursesNames = (c.courses || []).map(course =>
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
                  <div className="text-sm">
                    Professor:{' '}
                    <span className="font-medium">
                      {professor
                        ? `${professor.firstName} ${professor.lastName}`
                        : '—'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Room:{' '}
                    <span className="font-medium text-foreground">
                      {c.roomNumber}
                    </span>
                  </div>
                  <div className="text-sm">
                    Courses:{' '}
                    {coursesNames.length ? coursesNames.join(', ') : '—'}
                  </div>
                  <div className="text-sm flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {c.registeredStudents?.length || 0}{' '}
                    {c.maxStudents ? ` / ${c.maxStudents}` : ''}
                    {c.isFull && (
                      <Badge variant="warning" className="ml-2">
                        Full
                      </Badge>
                    )}
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
          setSelectedProfessorId('');
        }}
        title="Create Consultation"
        description="Set up office hours for a teacher"
      >
        <DialogContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(values =>
              createMutation.mutate(values)
            )}
          >
            <FormField label="Professor">
              <Select
                value={selectedProfessorId}
                onValueChange={v => setSelectedProfessorId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select professor" />
                </SelectTrigger>
                <SelectContent>
                  {(professors as IUser[]).map(p => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              label="Title"
              required
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
                required
                error={form.formState.errors.date?.message}
              >
                <Input
                  type="date"
                  {...form.register('date', { required: 'Date is required' })}
                />
              </FormField>
              <FormField
                label="Start Time"
                required
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
                required
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
                required
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
                options={(filteredCourses as Course[]).map(c => ({
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
                  setSelectedProfessorId('');
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
