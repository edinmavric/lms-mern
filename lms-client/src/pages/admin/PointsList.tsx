import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Search,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Loader2,
  BookOpen,
  User,
  Target,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { pointsApi } from '../../lib/api/points';
import { coursesApi } from '../../lib/api/courses';
import { usersApi } from '../../lib/api/users';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { getErrorMessage } from '../../lib/utils';
import type { Point, User as UserType } from '../../types';
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
  FormField,
  Badge,
} from '../../components/ui';

interface PointFormData {
  student: string;
  course: string;
  points: number;
  maxPoints: number;
  title: string;
  description?: string;
  date: string;
}

function PointForm({
  point,
  courses,
  students,
  enrollments,
  onSubmit,
  onCancel,
}: {
  point?: Point | null;
  courses: Array<{ _id: string; name: string }>;
  students: Array<UserType>;
  enrollments: Array<{
    course: string | { _id: string };
    student: string | UserType;
  }>;
  onSubmit: (data: PointFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<PointFormData>({
    student: point?.student
      ? typeof point.student === 'string'
        ? point.student
        : point.student._id
      : students[0]?._id || '',
    course: point?.course
      ? typeof point.course === 'string'
        ? point.course
        : point.course._id
      : courses[0]?._id || '',
    points: point?.points || 0,
    maxPoints: point?.maxPoints || 100,
    title: point?.title || '',
    description: point?.description || '',
    date: point?.date
      ? format(new Date(point.date), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.points > formData.maxPoints) {
      toast.error(
        `Points cannot exceed maximum points (${formData.maxPoints})`
      );
      return;
    }

    if (formData.points < 0) {
      toast.error('Points cannot be negative');
      return;
    }

    onSubmit(formData);
  };

  const filteredStudents = useMemo(() => {
    if (!formData.course) return students;

    return students.filter(student => {
      return enrollments.some(enrollment => {
        const enrollmentCourseId =
          typeof enrollment.course === 'string'
            ? enrollment.course
            : enrollment.course._id;
        const enrollmentStudentId =
          typeof enrollment.student === 'string'
            ? enrollment.student
            : enrollment.student._id;
        return (
          enrollmentCourseId === formData.course &&
          enrollmentStudentId === student._id
        );
      });
    });
  }, [formData.course, students, enrollments]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Course" required>
        <Select
          value={formData.course}
          onValueChange={value => setFormData({ ...formData, course: value })}
          disabled={!!point}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course._id} value={course._id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {point && (
          <p className="text-xs text-muted-foreground mt-1">
            Course cannot be changed after creation
          </p>
        )}
      </FormField>

      <FormField label="Student" required>
        <Select
          value={formData.student}
          onValueChange={value => setFormData({ ...formData, student: value })}
          disabled={filteredStudents.length === 0 || !!point}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                filteredStudents.length === 0
                  ? 'No students enrolled in this course'
                  : 'Select a student'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {filteredStudents.length === 0 ? (
              <SelectItem value="" disabled>
                No students enrolled in this course
              </SelectItem>
            ) : (
              filteredStudents.map(student => (
                <SelectItem key={student._id} value={student._id}>
                  {student.firstName} {student.lastName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {filteredStudents.length === 0 && formData.course && !point && (
          <p className="text-xs text-muted-foreground mt-1">
            Select a course with enrolled students first
          </p>
        )}
        {point && (
          <p className="text-xs text-muted-foreground mt-1">
            Student cannot be changed after creation
          </p>
        )}
      </FormField>

      <FormField label="Title" required>
        <Input
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Assignment 1, Quiz 2, etc."
          required
        />
      </FormField>

      <FormField label="Description">
        <textarea
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Point description..."
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Points" required>
          <Input
            type="number"
            min="0"
            max={formData.maxPoints}
            value={formData.points}
            onChange={e => {
              const points = parseInt(e.target.value) || 0;
              setFormData({
                ...formData,
                points: Math.max(0, Math.min(points, formData.maxPoints)),
              });
            }}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Max: {formData.maxPoints} points
          </p>
        </FormField>

        <FormField label="Max Points" required>
          <Input
            type="number"
            min="1"
            value={formData.maxPoints}
            onChange={e => {
              const maxPoints = Math.max(1, parseInt(e.target.value) || 100);
              setFormData({
                ...formData,
                maxPoints,
                points: Math.min(formData.points, maxPoints),
              });
            }}
            required
          />
        </FormField>
      </div>

      <FormField label="Date" required>
        <Input
          type="datetime-local"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}

export function PointsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('__all__');
  const [filterStudent, setFilterStudent] = useState<string>('__all__');
  const [filterProfessor, setFilterProfessor] = useState<string>('__all__');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    point: Point | null;
  }>({ open: false, point: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    point: Point | null;
  }>({ open: false, point: null });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const { data: professors = [] } = useQuery({
    queryKey: ['users', 'professors'],
    queryFn: () => usersApi.list({ role: 'professor', status: 'active' }),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'all'],
    queryFn: () => enrollmentsApi.list({}),
  });

  const { data: points = [], isLoading } = useQuery({
    queryKey: [
      'points',
      'all',
      {
        course: filterCourse !== '__all__' ? filterCourse : undefined,
        student: filterStudent !== '__all__' ? filterStudent : undefined,
        professor: filterProfessor !== '__all__' ? filterProfessor : undefined,
      },
    ],
    queryFn: () =>
      pointsApi.list({
        course: filterCourse !== '__all__' ? filterCourse : undefined,
        student: filterStudent !== '__all__' ? filterStudent : undefined,
        professor: filterProfessor !== '__all__' ? filterProfessor : undefined,
      }),
  });

  const filteredPoints = searchTitle
    ? points.filter(point =>
        point.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
    : points;

  const enrolledStudents = useMemo(() => {
    const studentMap = new Map<string, UserType>();

    enrollments.forEach(e => {
      if (
        typeof e.student === 'object' &&
        e.student &&
        !studentMap.has(e.student._id)
      ) {
        studentMap.set(e.student._id, e.student);
      }
    });

    return Array.from(studentMap.values());
  }, [enrollments]);

  const createMutation = useMutation({
    mutationFn: (data: PointFormData) => {
      return pointsApi.create({
        student: data.student,
        course: data.course,
        points: data.points,
        maxPoints: data.maxPoints,
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] });
      toast.success('Points assigned successfully');
      setCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to assign points'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PointFormData }) => {
      return pointsApi.update(id, {
        points: data.points,
        maxPoints: data.maxPoints,
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] });
      toast.success('Points updated successfully');
      setEditDialog({ open: false, point: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to update points'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pointsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] });
      toast.success('Points deleted successfully');
      setDeleteDialog({ open: false, point: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete points'));
    },
  });

  const getCourseName = (point: Point) => {
    if (typeof point.course === 'string') {
      const course = courses.find(c => c._id === point.course);
      return course?.name || 'Unknown Course';
    }
    return point.course.name;
  };

  const getStudentName = (point: Point) => {
    if (typeof point.student === 'string') {
      const student = students.find(s => s._id === point.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    return `${point.student.firstName} ${point.student.lastName}`;
  };

  const getProfessorName = (point: Point) => {
    if (typeof point.professor === 'string') {
      const professor = professors.find(p => p._id === point.professor);
      return professor
        ? `${professor.firstName} ${professor.lastName}`
        : 'Unknown Professor';
    }
    return `${point.professor.firstName} ${point.professor.lastName}`;
  };

  const totalPoints = points.reduce((sum, p) => sum + p.points, 0);
  const totalMaxPoints = points.reduce((sum, p) => sum + p.maxPoints, 0);
  const averagePercentage =
    totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;

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
          <h1 className="text-2xl md:text-3xl font-bold">Points Management</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage curriculum points across all courses and students
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Points
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Points
                </p>
                <p className="text-2xl font-bold">{points.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Score
                </p>
                <p className="text-2xl font-bold">
                  {averagePercentage.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Points
                </p>
                <p className="text-2xl font-bold">
                  {totalPoints} / {totalMaxPoints}
                </p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <Award className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search points..."
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
          />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Courses</SelectItem>
            {courses.map(course => (
              <SelectItem key={course._id} value={course._id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStudent} onValueChange={setFilterStudent}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Students</SelectItem>
            {students.map(student => (
              <SelectItem key={student._id} value={student._id}>
                {student.firstName} {student.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterProfessor} onValueChange={setFilterProfessor}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by professor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Professors</SelectItem>
            {professors.map(professor => (
              <SelectItem key={professor._id} value={professor._id}>
                {professor.firstName} {professor.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredPoints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchTitle ||
              filterCourse !== '__all__' ||
              filterStudent !== '__all__' ||
              filterProfessor !== '__all__'
                ? 'No points found'
                : 'No points assigned yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTitle ||
              filterCourse !== '__all__' ||
              filterStudent !== '__all__' ||
              filterProfessor !== '__all__'
                ? 'Try adjusting your search criteria'
                : 'Assign points to students to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPoints.map(point => {
            const courseName = getCourseName(point);
            const studentName = getStudentName(point);
            const professorName = getProfessorName(point);
            const pointDate = new Date(point.date);
            const percentage = (point.points / point.maxPoints) * 100;

            return (
              <Card
                key={point._id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/app/admin/points/${point._id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base">
                          {point.title}
                        </h3>
                        <Badge
                          variant={
                            percentage >= 80
                              ? 'success'
                              : percentage >= 60
                              ? 'default'
                              : percentage >= 40
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {point.points}/{point.maxPoints}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{courseName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{studentName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">By: {professorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(pointDate, 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      {point.description && (
                        <p className="text-sm text-muted-foreground">
                          {point.description}
                        </p>
                      )}
                    </div>
                    <div
                      className="flex gap-2 ml-4"
                      onClick={e => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditDialog({ open: true, point })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteDialog({ open: true, point })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="Assign Points"
        description="Assign curriculum points to a student"
        maxWidth="lg"
      >
        <DialogContent>
          <PointForm
            courses={courses}
            students={enrolledStudents}
            enrollments={enrollments}
            onSubmit={data => createMutation.mutate(data)}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, point: null })}
        title="Edit Points"
        description="Update point assignment"
        maxWidth="lg"
      >
        <DialogContent>
          <PointForm
            point={editDialog.point}
            courses={courses}
            students={enrolledStudents}
            enrollments={enrollments}
            onSubmit={data =>
              editDialog.point &&
              updateMutation.mutate({ id: editDialog.point._id, data })
            }
            onCancel={() => setEditDialog({ open: false, point: null })}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, point: null })}
        title="Delete Points"
        description={
          deleteDialog.point
            ? `Are you sure you want to delete "${deleteDialog.point.title}"? This action cannot be undone.`
            : ''
        }
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, point: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.point) {
                  deleteMutation.mutate(deleteDialog.point._id);
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
