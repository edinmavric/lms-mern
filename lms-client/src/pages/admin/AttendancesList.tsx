import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Search, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { attendanceApi } from '../../lib/api/attendance';
import { usersApi } from '../../lib/api/users';
import { coursesApi } from '../../lib/api/courses';
import { getErrorMessage } from '../../lib/utils';
import type { Attendance } from '../../types';
import {
  AttendanceForm,
  useAttendanceForm,
  type AttendanceFormData,
} from './AttendanceForm';
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

export function AttendancesList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchStudent, setSearchStudent] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    attendance: Attendance | null;
  }>({ open: false, attendance: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    attendance: Attendance | null;
  }>({ open: false, attendance: null });

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const { data: attendances = [], isLoading } = useQuery({
    queryKey: [
      'attendances',
      {
        course: filterCourse || undefined,
        status: filterStatus || undefined,
      },
    ],
    queryFn: () =>
      attendanceApi.list({
        course: filterCourse || undefined,
        status: (filterStatus as any) || undefined,
      }),
  });

  const { data: allAttendances = [] } = useQuery({
    queryKey: ['attendances', 'all'],
    queryFn: () => attendanceApi.list({}),
  });

  const filteredAttendances = searchStudent
    ? attendances.filter(attendance => {
        const student =
          typeof attendance.student === 'string'
            ? students.find(s => s._id === attendance.student)
            : attendance.student;
        if (!student) return false;
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        const email = student.email.toLowerCase();
        const search = searchStudent.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      })
    : attendances;

  const createMutation = useMutation({
    mutationFn: (data: AttendanceFormData) => {
      return attendanceApi.create({
        student: data.student,
        course: data.course || undefined,
        date: data.date,
        status: data.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast.success('Attendance recorded successfully');
      setCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to record attendance'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AttendanceFormData }) => {
      const updateData = {
        status: data.status,
        date: data.date,
      };
      return attendanceApi.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast.success('Attendance updated successfully');
      setEditDialog({ open: false, attendance: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to update attendance'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => attendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast.success('Attendance deleted successfully');
      setDeleteDialog({ open: false, attendance: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete attendance'));
    },
  });

  const getStudentName = (attendance: Attendance) => {
    if (!attendance?.student) return 'Unknown Student';
    if (typeof attendance.student === 'string') {
      const student = students.find(s => s._id === attendance.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    if (attendance.student.firstName && attendance.student.lastName) {
      return `${attendance.student.firstName} ${attendance.student.lastName}`;
    }
    return 'Unknown Student';
  };

  const getCourseName = (attendance: Attendance) => {
    if (!attendance?.course) return 'No course';
    if (typeof attendance.course === 'string') {
      const course = courses.find(c => c._id === attendance.course);
      return course ? course.name : 'Unknown Course';
    }
    return attendance.course.name || 'Unknown Course';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'destructive';
      case 'late':
        return 'warning';
      case 'excused':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'excused':
        return 'Excused';
      default:
        return status;
    }
  };

  const getStats = () => {
    const total = allAttendances.length;
    const present = allAttendances.filter(a => a.status === 'present').length;
    const absent = allAttendances.filter(a => a.status === 'absent').length;
    const late = allAttendances.filter(a => a.status === 'late').length;
    const excused = allAttendances.filter(a => a.status === 'excused').length;
    const uniqueStudents = new Set(
      allAttendances.map(a =>
        typeof a.student === 'string' ? a.student : a.student._id
      )
    ).size;
    return { total, present, absent, late, excused, uniqueStudents };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage student attendance records
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Attendance
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Records
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Present
                </p>
                <p className="text-2xl font-bold text-success">
                  {stats.present}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Absent
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {stats.absent}
                </p>
              </div>
              <div className="rounded-full bg-destructive/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Late
                </p>
                <p className="text-2xl font-bold text-warning">{stats.late}</p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Excused
                </p>
                <p className="text-2xl font-bold">{stats.excused}</p>
              </div>
              <div className="rounded-full bg-default/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-default" />
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
                <p className="text-2xl font-bold">{stats.uniqueStudents}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-primary" />
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
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="excused">Excused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading attendance records...
            </div>
          ) : filteredAttendances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found
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
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendances.map(attendance => (
                      <tr
                        key={attendance._id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={e => {
                          if ((e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          navigate(`/app/admin/attendances/${attendance._id}`);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!(e.target as HTMLElement).closest('button')) {
                              navigate(
                                `/app/admin/attendances/${attendance._id}`
                              );
                            }
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${getStudentName(
                          attendance
                        )}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {getStudentName(attendance)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {getCourseName(attendance)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(attendance.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={getStatusBadgeVariant(attendance.status)}
                          >
                            {getStatusLabel(attendance.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditDialog({ open: true, attendance })
                              }
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({ open: true, attendance })
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
                {filteredAttendances.map(attendance => (
                  <Card
                    key={attendance._id}
                    className="border-border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      navigate(`/app/admin/attendances/${attendance._id}`);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!(e.target as HTMLElement).closest('button')) {
                          navigate(`/app/admin/attendances/${attendance._id}`);
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${getStudentName(
                      attendance
                    )}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {getStudentName(attendance)}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getCourseName(attendance)}
                          </p>
                        </div>
                        <Badge
                          variant={getStatusBadgeVariant(attendance.status)}
                        >
                          {getStatusLabel(attendance.status)}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(attendance.date).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditDialog({ open: true, attendance })
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
                            setDeleteDialog({ open: true, attendance })
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

      <CreateAttendanceDialog
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
                'Failed to record attendance'
              )
            : null
        }
        students={students}
        courses={courses}
      />

      {editDialog.attendance && (
        <EditAttendanceDialog
          open={editDialog.open}
          attendance={editDialog.attendance}
          onClose={() => setEditDialog({ open: false, attendance: null })}
          onSubmit={async data => {
            await updateMutation.mutateAsync({
              id: editDialog.attendance!._id,
              data,
            });
          }}
          isSubmitting={updateMutation.isPending}
          error={
            updateMutation.error
              ? getErrorMessage(
                  updateMutation.error,
                  'Failed to update attendance'
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
            setDeleteDialog({ open: false, attendance: null });
          }
        }}
        title="Delete Attendance"
        description={
          deleteDialog.attendance
            ? `Are you sure you want to delete the attendance record for "${getStudentName(
                deleteDialog.attendance
              )}" on ${new Date(
                deleteDialog.attendance.date
              ).toLocaleDateString()}? This action cannot be undone.`
            : 'Are you sure you want to delete this attendance record? This action cannot be undone.'
        }
        maxWidth="md"
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, attendance: null })}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.attendance) {
                  deleteMutation.mutate(deleteDialog.attendance._id);
                }
              }}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CreateAttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AttendanceFormData) => Promise<void>;
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

function CreateAttendanceDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  students,
  courses,
}: CreateAttendanceDialogProps) {
  const form = useAttendanceForm();

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
      title="Record Attendance"
      description="Fill in the information below to record attendance."
      onSubmit={handleSubmit}
      submitLabel="Record Attendance"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <AttendanceForm
        students={students}
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

interface EditAttendanceDialogProps {
  open: boolean;
  attendance: Attendance;
  onClose: () => void;
  onSubmit: (data: AttendanceFormData) => Promise<void>;
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

function EditAttendanceDialog({
  open,
  onClose,
  onSubmit,
  attendance,
  isSubmitting,
  error,
  students,
  courses,
}: EditAttendanceDialogProps) {
  const form = useAttendanceForm(attendance);

  useEffect(() => {
    if (open && attendance) {
      form.reset({
        student:
          typeof attendance.student === 'string'
            ? attendance.student
            : (attendance.student as any)?._id || '',
        course:
          typeof attendance.course === 'string'
            ? attendance.course
            : attendance.course
              ? (attendance.course as any)?._id
              : undefined,
        date: attendance.date
          ? new Date(attendance.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: attendance.status || 'present',
      });
    }
  }, [open, attendance, form]);

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
      title="Edit Attendance"
      description="Update the attendance status and date. Student and course cannot be changed after creation."
      onSubmit={handleSubmit}
      submitLabel="Update Attendance"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <AttendanceForm
        students={students}
        courses={courses}
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        error={error}
        allowEditStudentCourse={false}
      />
    </FormDialog>
  );
}
