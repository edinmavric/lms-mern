import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { lessonsApi } from '../../lib/api/lessons';
import { coursesApi } from '../../lib/api/courses';
import { getErrorMessage } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import type { Lesson } from '../../types';
import {
  LessonForm,
  useLessonForm,
  type LessonFormData,
} from '../admin/LessonForm';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
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
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewSelect,
  CalendarWeekView,
  type EventType,
  type CalendarView,
} from '../../components/ui';

export function ProfessorLessonsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTitle, setSearchTitle] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>(
    searchParams.get('course') || ''
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    lesson: Lesson | null;
  }>({ open: false, lesson: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    lesson: Lesson | null;
  }>({ open: false, lesson: null });
  const [calendarView, setCalendarView] = useState<CalendarView>('month');

  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
  });

  const { data: allLessons = [], isLoading } = useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: () => lessonsApi.list({}),
  });

  const myLessons = allLessons.filter(lesson => {
    const lessonCourseId =
      typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
    const belongsToMyCourse = myCourses.some(
      course => course._id === lessonCourseId
    );

    if (filterCourse && filterCourse !== '__all__') {
      return belongsToMyCourse && lessonCourseId === filterCourse;
    }

    return belongsToMyCourse;
  });

  const calendarEvents: EventType[] = useMemo(() => {
    const lessonsToDisplay = searchTitle
      ? myLessons.filter(lesson =>
          lesson.title.toLowerCase().includes(searchTitle.toLowerCase())
        )
      : myLessons;

    return lessonsToDisplay.map(lesson => {
      const lessonDate = new Date(lesson.date);
      const [startHours, startMinutes] = lesson.startTime
        .split(':')
        .map(Number);
      const [endHours, endMinutes] = lesson.endTime.split(':').map(Number);

      const startDateTime = new Date(lessonDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(lessonDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const courseName =
        typeof lesson.course === 'string'
          ? myCourses.find(c => c._id === lesson.course)?.name ||
            'Unknown Course'
          : lesson.course.name;

      const colors: EventType['color'][] = [
        'blue',
        'green',
        'pink',
        'purple',
        'indigo',
      ];
      const colorIndex = courseName.length % colors.length;

      return {
        id: lesson._id,
        start: startDateTime,
        end: endDateTime,
        name: lesson.title,
        color: colors[colorIndex],
        description: lesson.content,
      };
    });
  }, [myLessons, myCourses]);

  useEffect(() => {
    if (filterCourse && filterCourse !== searchParams.get('course')) {
      setSearchParams({ course: filterCourse });
    }
  }, [filterCourse, searchParams, setSearchParams]);

  const createMutation = useMutation({
    mutationFn: (data: LessonFormData) => {
      return lessonsApi.create({
        course: data.course,
        title: data.title,
        content: data.content,
        materials: data.materials,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
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
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
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
    mutationFn: (id: string) => {
      return lessonsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Lesson deleted successfully');
      setDeleteDialog({ open: false, lesson: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete lesson'));
    },
  });

  const createForm = useLessonForm();
  const editForm = useLessonForm(editDialog.lesson || undefined);

  // Handle calendar event click - navigate to lesson detail
  const handleEventClick = (event: EventType) => {
    navigate(`/app/professor/lessons/${event.id}`);
  };

  const handleEmptyDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const startTime = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}`;

    const endHours = hours + 2;
    const endTime = `${String(
      endHours > 23 ? endHours - 24 : endHours
    ).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    createForm.setValue('date', dateStr);
    createForm.setValue('startTime', startTime);
    createForm.setValue('endTime', endTime);

    // If only one course, pre-select it
    if (myCourses.length === 1) {
      createForm.setValue('course', myCourses[0]._id);
    } else if (filterCourse && filterCourse !== '__all__') {
      createForm.setValue('course', filterCourse);
    }

    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (data: LessonFormData) => {
    await createMutation.mutateAsync(data);
    createForm.reset();
  };

  const handleEditSubmit = async (data: LessonFormData) => {
    if (editDialog.lesson) {
      await updateMutation.mutateAsync({ id: editDialog.lesson._id, data });
      editForm.reset();
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.lesson) {
      await deleteMutation.mutateAsync(deleteDialog.lesson._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Lessons</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage lessons for your courses
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={myCourses.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Lesson
        </Button>
      </div>

      {myCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No courses assigned
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              You need to be assigned to a course before you can create lessons
            </p>
          </CardContent>
        </Card>
      )}

      {myCourses.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by lesson title..."
                  value={searchTitle}
                  onChange={e => setSearchTitle(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filterCourse || '__all__'}
                onValueChange={value =>
                  setFilterCourse(value === '__all__' ? '' : value)
                }
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Courses</SelectItem>
                  {myCourses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar Component */}
            <Card className="w-full">
              <Calendar
                defaultDate={new Date()}
                events={calendarEvents}
                view={calendarView}
                onEventClick={handleEventClick}
                onEmptyDateClick={handleEmptyDateClick}
                onChangeView={setCalendarView}
                enableHotkeys={true}
                header={
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarPrevTrigger>
                          <ChevronLeft className="h-4 w-4" />
                        </CalendarPrevTrigger>
                        <CalendarCurrentDate />
                        <CalendarNextTrigger>
                          <ChevronRight className="h-4 w-4" />
                        </CalendarNextTrigger>
                        <CalendarTodayTrigger>Today</CalendarTodayTrigger>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarViewSelect />
                      </div>
                    </div>
                  </CardHeader>
                }
              >
                <CardContent>
                  <div className="h-[600px] w-full">
                    <CalendarDayView />
                    <CalendarWeekView />
                    <CalendarMonthView />
                  </div>
                </CardContent>
              </Calendar>
            </Card>
          </div>
        </>
      )}

      <FormDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          createForm.reset();
        }}
        title="Create Lesson"
        description="Create a new lesson for your course"
        onSubmit={createForm.handleSubmit(handleCreateSubmit)}
        isSubmitting={createMutation.isPending}
      >
        <LessonForm
          courses={myCourses}
          register={createForm.register}
          control={createForm.control}
          errors={createForm.formState.errors}
          isSubmitting={createMutation.isPending}
        />
      </FormDialog>

      <FormDialog
        open={editDialog.open}
        onClose={() => {
          setEditDialog({ open: false, lesson: null });
          editForm.reset();
        }}
        title="Edit Lesson"
        description="Update lesson details"
        onSubmit={editForm.handleSubmit(handleEditSubmit)}
        isSubmitting={updateMutation.isPending}
      >
        <LessonForm
          courses={myCourses}
          register={editForm.register}
          control={editForm.control}
          errors={editForm.formState.errors}
          isSubmitting={updateMutation.isPending}
        />
      </FormDialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, lesson: null })}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone."
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
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
