import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { lessonsApi } from '../../lib/api/lessons';
import { coursesApi } from '../../lib/api/courses';
import { getErrorMessage } from '../../lib/utils';
import type { Lesson } from '../../types';
import { LessonForm, useLessonForm, type LessonFormData } from './LessonForm';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogFooter,
  FormDialog,
} from '../../components/ui';

export function LessonsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    lesson: Lesson | null;
  }>({ open: false, lesson: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    lesson: Lesson | null;
  }>({ open: false, lesson: null });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: [
      'lessons',
      {
        course: filterCourse || undefined,
        title: searchTitle || undefined,
      },
    ],
    queryFn: () =>
      lessonsApi.list({
        course: filterCourse || undefined,
      }),
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: () => lessonsApi.list({}),
  });

  const filteredLessons = searchTitle
    ? lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
    : lessons;

  const createMutation = useMutation({
    mutationFn: (data: LessonFormData) => {
      return lessonsApi.create({
        course: data.course,
        title: data.title,
        content: data.content,
        materials: data.materials,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Lesson created successfully');
      setCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to create lesson'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LessonFormData }) => {
      const updateData = {
        title: data.title,
        content: data.content,
        materials: data.materials,
      };
      return lessonsApi.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Lesson updated successfully');
      setEditDialog({ open: false, lesson: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to update lesson'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => lessonsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Lesson deleted successfully');
      setDeleteDialog({ open: false, lesson: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete lesson'));
    },
  });

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    if (typeof course === 'object' && course) {
      return course.name;
    }
    const lesson = allLessons.find(l =>
      typeof l.course === 'object' ? l.course._id === courseId : l.course === courseId
    );
    if (lesson && typeof lesson.course === 'object') {
      return lesson.course.name || 'Unknown Course';
    }
    return 'Unknown Course';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Lessons</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage lessons and course content
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Lesson
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Lessons
                </p>
                <p className="text-2xl font-bold">{allLessons.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Courses with Lessons
                </p>
                <p className="text-2xl font-bold">
                  {new Set(allLessons.map(l => 
                    typeof l.course === 'string' ? l.course : l.course._id
                  )).size}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lessons with Materials
                </p>
                <p className="text-2xl font-bold">
                  {allLessons.filter(l => 
                    Array.isArray(l.materials) && l.materials.length > 0
                  ).length}
                </p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <BookOpen className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Input
                placeholder="Search by title..."
                icon={<Search className="h-4 w-4" />}
                value={searchTitle}
                onChange={e => setSearchTitle(e.target.value)}
              />
            </div>

            <Select
              value={filterCourse || 'all'}
              onValueChange={value => setFilterCourse(value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading lessons...
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No lessons found
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Course
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Materials
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Created
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLessons.map(lesson => (
                      <tr
                        key={lesson._id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={e => {
                          if ((e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          navigate(`/app/admin/lessons/${lesson._id}`);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!(e.target as HTMLElement).closest('button')) {
                              navigate(`/app/admin/lessons/${lesson._id}`);
                            }
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${lesson.title}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{lesson.title}</div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {typeof lesson.course === 'string'
                            ? getCourseName(lesson.course)
                            : lesson.course.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {Array.isArray(lesson.materials)
                            ? lesson.materials.length
                            : 0}{' '}
                          {Array.isArray(lesson.materials) &&
                          lesson.materials.length === 1
                            ? 'material'
                            : 'materials'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {new Date(lesson.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditDialog({ open: true, lesson })}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({ open: true, lesson })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3 p-4">
                {filteredLessons.map(lesson => (
                  <Card
                    key={lesson._id}
                    className="border-border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      navigate(`/app/admin/lessons/${lesson._id}`);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!(e.target as HTMLElement).closest('button')) {
                          navigate(`/app/admin/lessons/${lesson._id}`);
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${lesson.title}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {typeof lesson.course === 'string'
                              ? getCourseName(lesson.course)
                              : lesson.course.name || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">
                          <span className="font-medium">Materials:</span>{' '}
                          {Array.isArray(lesson.materials)
                            ? lesson.materials.length
                            : 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created:{' '}
                          {new Date(lesson.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditDialog({ open: true, lesson })}
                          className="flex-1 min-w-[100px]"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({ open: true, lesson })
                          }
                          className="flex-1 min-w-[100px]"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateLessonDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={async data => {
          await createMutation.mutateAsync(data);
        }}
        isSubmitting={createMutation.isPending}
        error={
          createMutation.error
            ? getErrorMessage(createMutation.error, 'Failed to create lesson')
            : null
        }
        courses={courses}
      />

      {editDialog.lesson && (
        <EditLessonDialog
          open={editDialog.open}
          lesson={editDialog.lesson}
          onClose={() => setEditDialog({ open: false, lesson: null })}
          onSubmit={async data => {
            await updateMutation.mutateAsync({
              id: editDialog.lesson!._id,
              data,
            });
          }}
          isSubmitting={updateMutation.isPending}
          error={
            updateMutation.error
              ? getErrorMessage(updateMutation.error, 'Failed to update lesson')
              : null
          }
          courses={courses}
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteDialog({ open: false, lesson: null });
          }
        }}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${deleteDialog.lesson?.title}"? This action cannot be undone.`}
        maxWidth="md"
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, lesson: null })}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.lesson) {
                  deleteMutation.mutate(deleteDialog.lesson._id);
                }
              }}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CreateLessonDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  courses: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
}

function CreateLessonDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  courses,
}: CreateLessonDialogProps) {
  const form = useLessonForm();

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      try {
        await onSubmit(form.getValues());
        form.reset();
      } catch (err) {}
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title="Create Lesson"
      description="Fill in the information below to create a new lesson."
      onSubmit={handleSubmit}
      submitLabel="Create Lesson"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <LessonForm
        courses={courses}
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        error={error}
      />
    </FormDialog>
  );
}

interface EditLessonDialogProps {
  open: boolean;
  lesson: Lesson;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  courses: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
}

function EditLessonDialog({
  open,
  onClose,
  onSubmit,
  lesson,
  isSubmitting,
  error,
  courses,
}: EditLessonDialogProps) {
  const form = useLessonForm(lesson);

  useEffect(() => {
    if (open && lesson) {
      form.reset({
        course:
          typeof lesson.course === 'string'
            ? lesson.course
            : (lesson.course as any)?._id || '',
        title: lesson.title || '',
        content: lesson.content || '',
        materials: lesson.materials || [],
      });
    }
  }, [open, lesson, form]);

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      try {
        await onSubmit(form.getValues());
      } catch (err) {}
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title="Edit Lesson"
      description="Update the lesson's information."
      onSubmit={handleSubmit}
      submitLabel="Update Lesson"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <LessonForm
        courses={courses}
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        error={error}
      />
    </FormDialog>
  );
}

