import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Search, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { enrollmentsApi } from '../../lib/api/enrollments';
import { usersApi } from '../../lib/api/users';
import { coursesApi } from '../../lib/api/courses';
import { getErrorMessage } from '../../lib/utils';
import type { Enrollment } from '../../types';
import {
  EnrollmentForm,
  useEnrollmentForm,
  type EnrollmentFormData,
} from './EnrollmentForm';
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
  Badge,
} from '../../components/ui';

export function EnrollmentsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchStudent, setSearchStudent] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    enrollment: Enrollment | null;
  }>({ open: false, enrollment: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    enrollment: Enrollment | null;
  }>({ open: false, enrollment: null });

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: [
      'enrollments',
      {
        course: filterCourse || undefined,
        status: filterStatus || undefined,
      },
    ],
    queryFn: () =>
      enrollmentsApi.list({
        course: filterCourse || undefined,
        status: (filterStatus as any) || undefined,
      }),
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['enrollments', 'all'],
    queryFn: () => enrollmentsApi.list({}),
  });

  const filteredEnrollments = searchStudent
    ? enrollments.filter(enrollment => {
        const student =
          typeof enrollment.student === 'string'
            ? students.find(s => s._id === enrollment.student)
            : enrollment.student;
        if (!student) return false;
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        const email = student.email.toLowerCase();
        const search = searchStudent.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      })
    : enrollments;

  const createMutation = useMutation({
    mutationFn: (data: EnrollmentFormData) => {
      return enrollmentsApi.create({
        student: data.student,
        course: data.course,
        status: data.status || 'active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Enrollment created successfully');
      setCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to create enrollment'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EnrollmentFormData }) => {
      const updateData = {
        status: data.status || 'active',
      };
      return enrollmentsApi.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Enrollment updated successfully');
      setEditDialog({ open: false, enrollment: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to update enrollment'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => enrollmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Enrollment deleted successfully');
      setDeleteDialog({ open: false, enrollment: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete enrollment'));
    },
  });

  const getStudentName = (enrollment: Enrollment) => {
    if (!enrollment?.student) return 'Unknown Student';
    if (typeof enrollment.student === 'string') {
      const student = students.find(s => s._id === enrollment.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    if (enrollment.student.firstName && enrollment.student.lastName) {
      return `${enrollment.student.firstName} ${enrollment.student.lastName}`;
    }
    return 'Unknown Student';
  };

  const getCourseName = (enrollment: Enrollment) => {
    if (!enrollment?.course) return 'Unknown Course';
    if (typeof enrollment.course === 'string') {
      const course = courses.find(c => c._id === enrollment.course);
      return course ? course.name : 'Unknown Course';
    }
    return enrollment.course.name || 'Unknown Course';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'paused':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const getTotalPaid = (enrollment: Enrollment) => {
    if (!enrollment.payments || !Array.isArray(enrollment.payments)) {
      return 0;
    }
    return enrollment.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getCoursePrice = (enrollment: Enrollment) => {
    if (typeof enrollment.course === 'string') {
      const course = courses.find(c => c._id === enrollment.course);
      return course?.price || 0;
    }
    return enrollment.course.price || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Enrollments</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage student enrollments in courses
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Enrollment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Enrollments
                </p>
                <p className="text-2xl font-bold">{allEnrollments.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">
                  {allEnrollments.filter(e => e.status === 'active').length}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <GraduationCap className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold">
                  {allEnrollments.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <div className="rounded-full bg-default/10 p-3">
                <GraduationCap className="h-6 w-6 text-default" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Unique Students
                </p>
                <p className="text-2xl font-bold">
                  {
                    new Set(
                      allEnrollments.map(e =>
                        typeof e.student === 'string'
                          ? e.student
                          : e.student._id
                      )
                    ).size
                  }
                </p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <GraduationCap className="h-6 w-6 text-warning" />
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
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder="Search by student name or email..."
                icon={<Search className="h-4 w-4" />}
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
              />
            </div>

            <Select
              value={filterCourse || 'all'}
              onValueChange={value =>
                setFilterCourse(value === 'all' ? '' : value)
              }
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

            <Select
              value={filterStatus || 'all'}
              onValueChange={value =>
                setFilterStatus(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading enrollments...
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No enrollments found
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Student
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Course
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Payment
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
                    {filteredEnrollments.map(enrollment => {
                      const totalPaid = getTotalPaid(enrollment);
                      const coursePrice = getCoursePrice(enrollment);
                      return (
                        <tr
                          key={enrollment._id}
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={e => {
                            if ((e.target as HTMLElement).closest('button')) {
                              return;
                            }
                            navigate(
                              `/app/admin/enrollments/${enrollment._id}`
                            );
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (
                                !(e.target as HTMLElement).closest('button')
                              ) {
                                navigate(
                                  `/app/admin/enrollments/${enrollment._id}`
                                );
                              }
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View details for ${getStudentName(
                            enrollment
                          )}`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium">
                              {getStudentName(enrollment)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {getCourseName(enrollment)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={getStatusBadgeVariant(enrollment.status)}
                            >
                              {enrollment.status.charAt(0).toUpperCase() +
                                enrollment.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {coursePrice > 0
                              ? `$${totalPaid.toFixed(
                                  2
                                )} / $${coursePrice.toFixed(2)}`
                              : 'Free'}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-sm">
                            {new Date(
                              enrollment.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setEditDialog({ open: true, enrollment })
                                }
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setDeleteDialog({ open: true, enrollment })
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3 p-4">
                {filteredEnrollments.map(enrollment => {
                  const totalPaid = getTotalPaid(enrollment);
                  const coursePrice = getCoursePrice(enrollment);
                  return (
                    <Card
                      key={enrollment._id}
                      className="border-border cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={e => {
                        if ((e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        navigate(`/app/admin/enrollments/${enrollment._id}`);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (!(e.target as HTMLElement).closest('button')) {
                            navigate(
                              `/app/admin/enrollments/${enrollment._id}`
                            );
                          }
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${getStudentName(
                        enrollment
                      )}`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">
                              {getStudentName(enrollment)}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {getCourseName(enrollment)}
                            </p>
                          </div>
                          <Badge
                            variant={getStatusBadgeVariant(enrollment.status)}
                          >
                            {enrollment.status.charAt(0).toUpperCase() +
                              enrollment.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm">
                          <div className="text-muted-foreground">
                            <span className="font-medium">Payment:</span>{' '}
                            {coursePrice > 0
                              ? `$${totalPaid.toFixed(
                                  2
                                )} / $${coursePrice.toFixed(2)}`
                              : 'Free'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created:{' '}
                            {new Date(
                              enrollment.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditDialog({ open: true, enrollment })
                            }
                            className="flex-1 min-w-[100px]"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({ open: true, enrollment })
                            }
                            className="flex-1 min-w-[100px]"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateEnrollmentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={async data => {
          await createMutation.mutateAsync(data);
        }}
        isSubmitting={createMutation.isPending}
        error={
          createMutation.error
            ? getErrorMessage(
                createMutation.error,
                'Failed to create enrollment'
              )
            : null
        }
        students={students}
        courses={courses}
      />

      {editDialog.enrollment && (
        <EditEnrollmentDialog
          open={editDialog.open}
          enrollment={editDialog.enrollment}
          onClose={() => setEditDialog({ open: false, enrollment: null })}
          onSubmit={async data => {
            await updateMutation.mutateAsync({
              id: editDialog.enrollment!._id,
              data,
            });
          }}
          isSubmitting={updateMutation.isPending}
          error={
            updateMutation.error
              ? getErrorMessage(
                  updateMutation.error,
                  'Failed to update enrollment'
                )
              : null
          }
          students={students}
          courses={courses}
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteDialog({ open: false, enrollment: null });
          }
        }}
        title="Delete Enrollment"
        description={
          deleteDialog.enrollment
            ? `Are you sure you want to delete the enrollment for "${getStudentName(
                deleteDialog.enrollment
              )}" in "${getCourseName(
                deleteDialog.enrollment
              )}"? This action cannot be undone.`
            : 'Are you sure you want to delete this enrollment? This action cannot be undone.'
        }
        maxWidth="md"
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, enrollment: null })}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.enrollment) {
                  deleteMutation.mutate(deleteDialog.enrollment._id);
                }
              }}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CreateEnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EnrollmentFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  students: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  courses: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
}

function CreateEnrollmentDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  students,
  courses,
}: CreateEnrollmentDialogProps) {
  const form = useEnrollmentForm();

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
      title="Create Enrollment"
      description="Fill in the information below to enroll a student in a course."
      onSubmit={handleSubmit}
      submitLabel="Create Enrollment"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <EnrollmentForm
        students={students}
        courses={courses}
        control={form.control}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        error={error}
      />
    </FormDialog>
  );
}

interface EditEnrollmentDialogProps {
  open: boolean;
  enrollment: Enrollment;
  onClose: () => void;
  onSubmit: (data: EnrollmentFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  students: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  courses: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
}

function EditEnrollmentDialog({
  open,
  onClose,
  onSubmit,
  enrollment,
  isSubmitting,
  error,
  students,
  courses,
}: EditEnrollmentDialogProps) {
  const form = useEnrollmentForm(enrollment);

  useEffect(() => {
    if (open && enrollment) {
      form.reset({
        student:
          typeof enrollment.student === 'string'
            ? enrollment.student
            : (enrollment.student as any)?._id || '',
        course:
          typeof enrollment.course === 'string'
            ? enrollment.course
            : (enrollment.course as any)?._id || '',
        status: enrollment.status || 'active',
      });
    }
  }, [open, enrollment, form]);

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
      title="Edit Enrollment"
      description="Update the enrollment status. Student and course cannot be changed."
      onSubmit={handleSubmit}
      submitLabel="Update Enrollment"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <EnrollmentForm
        students={students}
        courses={courses}
        control={form.control}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        error={error}
        allowEditStudentCourse={false}
      />
    </FormDialog>
  );
}
