import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Edit,
  Trash2,
  Plus,
  Users,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

import { coursesApi } from '../../lib/api/courses';
import { usersApi } from '../../lib/api/users';
import { getErrorMessage } from '../../lib/utils';
import type { Course } from '../../types';
import { CourseForm, useCourseForm, type CourseFormData } from './CourseForm';
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
  Badge,
  Dialog,
  DialogContent,
  DialogFooter,
  Alert,
  FormDialog,
} from '../../components/ui';

export function CoursesList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');
  const [filterProfessor, setFilterProfessor] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    course: Course | null;
  }>({ open: false, course: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    course: Course | null;
  }>({ open: false, course: null });

  const { data: professors = [] } = useQuery({
    queryKey: ['users', 'professors'],
    queryFn: () => usersApi.list({ role: 'professor', status: 'active' }),
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: [
      'courses',
      {
        professor: filterProfessor || undefined,
        name: searchName || undefined,
      },
    ],
    queryFn: () =>
      coursesApi.list({
        professor: filterProfessor || undefined,
        name: searchName || undefined,
      }),
  });

  // Query for all courses (for stats - not filtered)
  const { data: allCourses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const createMutation = useMutation({
    mutationFn: (data: CourseFormData) => {
      return coursesApi.create({
        name: data.name,
        description: data.description,
        professor: data.professor,
        price:
          data.price && data.price !== '' && typeof data.price === 'number'
            ? data.price
            : undefined,
        schedule:
          data.schedule &&
          (data.schedule.days ||
            data.schedule.startTime ||
            data.schedule.endTime)
            ? {
                days: data.schedule.days || [],
                startTime: data.schedule.startTime || '',
                endTime: data.schedule.endTime || '',
              }
            : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
      setCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to create course'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseFormData }) => {
      const updateData: any = {
        name: data.name,
        description: data.description,
        professor: data.professor,
        price:
          data.price && data.price !== '' && typeof data.price === 'number'
            ? data.price
            : undefined,
        schedule:
          data.schedule &&
          (data.schedule.days ||
            data.schedule.startTime ||
            data.schedule.endTime)
            ? {
                days: data.schedule.days || [],
                startTime: data.schedule.startTime || '',
                endTime: data.schedule.endTime || '',
              }
            : undefined,
      };
      return coursesApi.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully');
      setEditDialog({ open: false, course: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to update course'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
      setDeleteDialog({ open: false, course: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete course'));
    },
  });

  const handleDelete = () => {
    if (deleteDialog.course) {
      deleteMutation.mutate(deleteDialog.course._id);
    }
  };

  const coursesWithStudents = allCourses.filter(
    c => Array.isArray(c.students) && c.students.length > 0
  );
  const totalStudents = allCourses.reduce((sum, c) => {
    const students = Array.isArray(c.students) ? c.students.length : 0;
    return sum + students;
  }, 0);

  const getProfessorName = (professor: Course['professor']) => {
    if (typeof professor === 'string') return 'Unknown';
    return `${professor.firstName} ${professor.lastName}`;
  };

  const getStudentCount = (course: Course) => {
    if (Array.isArray(course.students)) {
      return course.students.length;
    }
    return 0;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage courses, professors, and student enrollments
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </p>
                <p className="text-2xl font-bold">{allCourses.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Courses with Students
                </p>
                <p className="text-2xl font-bold">
                  {coursesWithStudents.length}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <Users className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Enrollments
                </p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div className="rounded-full bg-secondary/10 p-3">
                <GraduationCap className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <Input
                placeholder="Search by course name..."
                icon={<Search className="h-4 w-4" />}
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
              />
            </div>

            <Select
              value={filterProfessor || 'all'}
              onValueChange={value =>
                setFilterProfessor(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Professors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Professors</SelectItem>
                {professors.map(prof => (
                  <SelectItem key={prof._id} value={prof._id}>
                    {prof.firstName} {prof.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Courses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No courses found
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Course Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Professor
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Students
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Price
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
                    {courses.map(course => (
                      <tr
                        key={course._id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={e => {
                          if ((e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          navigate(`/app/admin/courses/${course._id}`);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!(e.target as HTMLElement).closest('button')) {
                              navigate(`/app/admin/courses/${course._id}`);
                            }
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${course.name}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{course.name}</div>
                          {course.description && (
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {course.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {getProfessorName(course.professor)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="default">
                            {getStudentCount(course)} students
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {course.price
                            ? `$${course.price.toFixed(2)}`
                            : 'Free'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditDialog({ open: true, course })
                              }
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({ open: true, course })
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
                {courses.map(course => (
                  <Card
                    key={course._id}
                    className="border-border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      navigate(`/app/admin/courses/${course._id}`);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!(e.target as HTMLElement).closest('button')) {
                          navigate(`/app/admin/courses/${course._id}`);
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${course.name}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {course.name}
                          </h3>
                          {course.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {course.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="default">
                          {getStudentCount(course)} students
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">
                          <span className="font-medium">Professor:</span>{' '}
                          {getProfessorName(course.professor)}
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-medium">Price:</span>{' '}
                          {course.price
                            ? `$${course.price.toFixed(2)}`
                            : 'Free'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created:{' '}
                          {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditDialog({ open: true, course })}
                          className="flex-1 min-w-[100px]"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({ open: true, course })
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

      <CreateCourseDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={async data => {
          await createMutation.mutateAsync(data);
        }}
        isSubmitting={createMutation.isPending}
        error={
          createMutation.error
            ? getErrorMessage(createMutation.error, 'Failed to create course')
            : null
        }
        professors={professors}
      />

      {editDialog.course && (
        <EditCourseDialog
          open={editDialog.open}
          course={editDialog.course}
          onClose={() => setEditDialog({ open: false, course: null })}
          onSubmit={async data => {
            await updateMutation.mutateAsync({
              id: editDialog.course!._id,
              data,
            });
          }}
          isSubmitting={updateMutation.isPending}
          error={
            updateMutation.error
              ? getErrorMessage(updateMutation.error, 'Failed to update course')
              : null
          }
          professors={professors}
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, course: null })}
        title="Delete Course"
        description={`Are you sure you want to delete ${deleteDialog.course?.name}? This action cannot be undone.`}
      >
        <DialogContent>
          <Alert variant="destructive">
            <div className="space-y-1">
              <p className="font-medium">Warning</p>
              <p className="text-sm">
                Deleting this course will permanently remove it and all
                associated data.
              </p>
            </div>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, course: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  professors: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

function CreateCourseDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  professors,
}: CreateCourseDialogProps) {
  const form = useCourseForm();

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
      title="Create Course"
      description="Fill in the information below to create a new course."
      onSubmit={handleSubmit}
      submitLabel="Create Course"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <CourseForm
        isSubmitting={isSubmitting}
        error={error}
        professors={professors}
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
      />
    </FormDialog>
  );
}

interface EditCourseDialogProps {
  open: boolean;
  course: Course;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  professors: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

function EditCourseDialog({
  open,
  course,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  professors,
}: EditCourseDialogProps) {
  const form = useCourseForm(course);

  useEffect(() => {
    if (open && course) {
      form.reset({
        name: course.name || '',
        description: course.description || '',
        professor:
          typeof course.professor === 'string'
            ? course.professor
            : course.professor?._id || '',
        price: course.price || '',
        schedule: course.schedule || {
          days: [],
          startTime: '',
          endTime: '',
        },
      });
    }
  }, [open, course, form]);

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
      title="Edit Course"
      description="Update the course information."
      onSubmit={handleSubmit}
      submitLabel="Update Course"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <CourseForm
        course={course}
        isSubmitting={isSubmitting}
        error={error}
        professors={professors}
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
      />
    </FormDialog>
  );
}
