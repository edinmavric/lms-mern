import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Search,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { attendanceApi } from '../../lib/api/attendance';
import { usersApi } from '../../lib/api/users';
import { lessonsApi } from '../../lib/api/lessons';
import { coursesApi } from '../../lib/api/courses';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../lib/utils';
import type { Attendance } from '../../types';
import {
  AttendanceForm,
  useAttendanceForm,
  type AttendanceFormData,
} from '../admin/AttendanceForm';
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogFooter,
  Badge,
} from '../../components/ui';

export function ProfessorAttendancesList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchStudent, setSearchStudent] = useState('');
  const [filterLesson, setFilterLesson] = useState<string>('__all__');
  const [filterStatus, setFilterStatus] = useState<string>('__all__');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    attendance: Attendance | null;
  }>({ open: false, attendance: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    attendance: Attendance | null;
  }>({ open: false, attendance: null });

  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: () => lessonsApi.list({}),
  });

  const myLessons = allLessons.filter(lesson => {
    const courseId =
      typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
    return myCourses.some(course => course._id === courseId);
  });

  const { data: allAttendances = [], isLoading } = useQuery({
    queryKey: [
      'attendances',
      'professor',
      user?._id,
      {
        lesson: filterLesson !== '__all__' ? filterLesson : undefined,
        status: filterStatus !== '__all__' ? filterStatus : undefined,
      },
    ],
    queryFn: () =>
      attendanceApi.list({
        lesson: filterLesson !== '__all__' ? filterLesson : undefined,
        status:
          filterStatus !== '__all__'
            ? (filterStatus as 'present' | 'absent' | 'late' | 'excused')
            : undefined,
      }),
  });

  const attendances = allAttendances.filter(attendance => {
    const lessonId =
      typeof attendance.lesson === 'string'
        ? attendance.lesson
        : attendance.lesson._id;
    return myLessons.some(lesson => lesson._id === lessonId);
  });

  const filteredAttendances = searchStudent
    ? attendances.filter(attendance => {
        const student =
          typeof attendance.student === 'string' ? null : attendance.student;
        const studentName = student
          ? `${student.firstName} ${student.lastName}`
          : '';
        return studentName.toLowerCase().includes(searchStudent.toLowerCase());
      })
    : attendances;

  const presentCount = attendances.filter(a => a.status === 'present').length;
  const absentCount = attendances.filter(a => a.status === 'absent').length;
  const lateCount = attendances.filter(a => a.status === 'late').length;

  const createForm = useAttendanceForm();
  const editForm = useAttendanceForm();

  const createMutation = useMutation({
    mutationFn: (data: AttendanceFormData) => attendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast.success('Attendance recorded successfully');
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to record attendance'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AttendanceFormData }) =>
      attendanceApi.update(id, { status: data.status, date: data.date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast.success('Attendance updated successfully');
      setEditDialog({ open: false, attendance: null });
      editForm.reset();
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

  useEffect(() => {
    if (editDialog.attendance) {
      editForm.reset({
        student:
          typeof editDialog.attendance.student === 'string'
            ? editDialog.attendance.student
            : editDialog.attendance.student._id,
        lesson:
          typeof editDialog.attendance.lesson === 'string'
            ? editDialog.attendance.lesson
            : editDialog.attendance.lesson._id,
        date: editDialog.attendance.date
          ? new Date(editDialog.attendance.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: editDialog.attendance.status || 'present',
      });
    }
  }, [editDialog.attendance, editForm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="success">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge variant="warning">Late</Badge>;
      case 'excused':
        return <Badge variant="default">Excused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStudentName = (attendance: Attendance) => {
    if (typeof attendance.student === 'string') {
      const student = students.find(s => s._id === attendance.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    return `${attendance.student.firstName} ${attendance.student.lastName}`;
  };

  const getLessonName = (attendance: Attendance) => {
    if (typeof attendance.lesson === 'string') {
      const lesson = myLessons.find(l => l._id === attendance.lesson);
      return lesson?.title || 'Unknown Lesson';
    }
    return attendance.lesson.title || 'Unknown Lesson';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage attendance for your courses
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Attendance
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{attendances.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <ClipboardCheck className="h-5 w-5 text-primary" />
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
                  {presentCount}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <ClipboardCheck className="h-5 w-5 text-success" />
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
                  {absentCount}
                </p>
              </div>
              <div className="rounded-full bg-destructive/10 p-3">
                <ClipboardCheck className="h-5 w-5 text-destructive" />
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
                <p className="text-2xl font-bold text-warning">{lateCount}</p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <ClipboardCheck className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by student name..."
            value={searchStudent}
            onChange={e => setSearchStudent(e.target.value)}
          />
        </div>
        <Select value={filterLesson} onValueChange={setFilterLesson}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by lesson" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Lessons</SelectItem>
            {myLessons.map(lesson => (
              <SelectItem key={lesson._id} value={lesson._id}>
                {lesson.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="excused">Excused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAttendances.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchStudent ||
              filterLesson !== '__all__' ||
              filterStatus !== '__all__'
                ? 'No attendance records found'
                : 'No attendance records yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchStudent ||
              filterLesson !== '__all__' ||
              filterStatus !== '__all__'
                ? 'Try adjusting your search criteria'
                : 'Start recording attendance for your lessons'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAttendances.map(attendance => (
            <Card
              key={attendance._id}
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() =>
                navigate(`/app/professor/attendances/${attendance._id}`)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base">
                        {getStudentName(attendance)}
                      </h3>
                      {getStatusBadge(attendance.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(attendance.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{getLessonName(attendance)}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={e => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialog({ open: true, attendance })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDeleteDialog({ open: true, attendance })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          createForm.reset();
        }}
        title="Record Attendance"
        description="Fill in the information below to record attendance for a lesson."
        maxWidth="lg"
      >
        <DialogContent>
          <form
            onSubmit={createForm.handleSubmit(data => {
              createMutation.mutate(data);
            })}
            className="space-y-4"
          >
            <AttendanceForm
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
              lessons={myLessons}
              register={createForm.register}
              control={createForm.control}
              errors={createForm.formState.errors}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  createForm.reset();
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? 'Recording...'
                  : 'Record Attendance'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, attendance: null })}
        title="Edit Attendance"
        description="Update the attendance status and date. Student and lesson cannot be changed after creation."
        maxWidth="lg"
      >
        <DialogContent>
          <form
            onSubmit={editForm.handleSubmit(data => {
              if (editDialog.attendance) {
                updateMutation.mutate({
                  id: editDialog.attendance._id,
                  data,
                });
              }
            })}
            className="space-y-4"
          >
            <AttendanceForm
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
              lessons={myLessons}
              register={editForm.register}
              control={editForm.control}
              errors={editForm.formState.errors}
              allowEditStudentLesson={false}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialog({ open: false, attendance: null })}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Attendance'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, attendance: null })}
        title="Delete Attendance"
        description="Are you sure you want to delete this attendance record? This action cannot be undone."
      >
        <DialogContent>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, attendance: null })}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deleteDialog.attendance) {
                  deleteMutation.mutate(deleteDialog.attendance._id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
