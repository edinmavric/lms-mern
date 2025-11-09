import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock,
  Loader2,
  ClipboardList,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { examsApi } from '../../lib/api/exams';
import { coursesApi } from '../../lib/api/courses';
import { usersApi } from '../../lib/api/users';
import { getErrorMessage } from '../../lib/utils';
import type { Exam } from '../../types';
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
  FormField,
  Badge,
} from '../../components/ui';

interface ExamFormData {
  course: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxPoints: number;
  passingPoints: number;
  type: 'preliminary' | 'finishing';
  subscriptionDeadline: string;
  isActive: boolean;
}

function ExamForm({
  exam,
  courses,
  onSubmit,
  onCancel,
}: {
  exam?: Exam | null;
  courses: Array<{ _id: string; name: string }>;
  onSubmit: (data: ExamFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ExamFormData>({
    course: exam?.course
      ? typeof exam.course === 'string'
        ? exam.course
        : exam.course._id
      : courses[0]?._id || '',
    title: exam?.title || '',
    description: exam?.description || '',
    date: exam?.date
      ? format(new Date(exam.date), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: exam?.location || '',
    maxPoints: exam?.maxPoints || 100,
    passingPoints: exam?.passingPoints || 50,
    type: exam?.type || 'finishing',
    subscriptionDeadline: exam?.subscriptionDeadline
      ? format(new Date(exam.subscriptionDeadline), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    isActive: exam?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Course" required>
        <Select
          value={formData.course}
          onValueChange={value => setFormData({ ...formData, course: value })}
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
      </FormField>

      <FormField label="Title" required>
        <Input
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Final Exam"
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
          placeholder="Exam description..."
        />
      </FormField>

      <FormField label="Exam Date & Time" required>
        <Input
          type="datetime-local"
          value={formData.date}
          onChange={e => {
            const newDate = e.target.value;
            setFormData({
              ...formData,
              date: newDate,
              subscriptionDeadline:
                formData.type === 'preliminary'
                  ? newDate
                  : formData.subscriptionDeadline,
            });
          }}
          required
        />
      </FormField>

      <FormField label="Location">
        <Input
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
          placeholder="Room 101"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Max Points" required>
          <Input
            type="number"
            min="1"
            value={formData.maxPoints}
            onChange={e =>
              setFormData({
                ...formData,
                maxPoints: parseInt(e.target.value) || 0,
              })
            }
            required
          />
        </FormField>

        <FormField label="Passing Points" required>
          <Input
            type="number"
            min="0"
            max={formData.maxPoints}
            value={formData.passingPoints}
            onChange={e =>
              setFormData({
                ...formData,
                passingPoints: parseInt(e.target.value) || 0,
              })
            }
            required
          />
        </FormField>
      </div>

      <FormField label="Exam Type" required>
        <Select
          value={formData.type}
          onValueChange={value => {
            const newType = value as 'preliminary' | 'finishing';
            if (newType === 'preliminary') {
              setFormData({
                ...formData,
                type: newType,
                subscriptionDeadline: formData.date,
              });
            } else {
              setFormData({
                ...formData,
                type: newType,
              });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select exam type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preliminary">Preliminary Exam</SelectItem>
            <SelectItem value="finishing">Finishing Exam</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {formData.type === 'preliminary'
            ? 'Preliminary exams automatically subscribe all enrolled students'
            : 'Finishing exams require students to manually subscribe'}
        </p>
      </FormField>

      <FormField label="Subscription Deadline" required>
        <Input
          type="datetime-local"
          value={formData.subscriptionDeadline}
          onChange={e =>
            setFormData({ ...formData, subscriptionDeadline: e.target.value })
          }
          required
          disabled={formData.type === 'preliminary'}
        />
        {formData.type === 'preliminary' && (
          <p className="text-xs text-muted-foreground mt-1">
            Subscription deadline is not applicable for preliminary exams
          </p>
        )}
      </FormField>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={e =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="rounded border-border"
        />
        <label htmlFor="isActive" className="text-sm">
          Active
        </label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}

export function ExamsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('__all__');
  const [filterProfessor, setFilterProfessor] = useState<string>('__all__');
  const [filterActive, setFilterActive] = useState<string>('__all__');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    exam: Exam | null;
  }>({ open: false, exam: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    exam: Exam | null;
  }>({ open: false, exam: null });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const { data: professors = [] } = useQuery({
    queryKey: ['users', 'professors'],
    queryFn: () => usersApi.list({ role: 'professor', status: 'active' }),
  });

  const { data: exams = [], isLoading } = useQuery({
    queryKey: [
      'exams',
      'all',
      {
        course: filterCourse !== '__all__' ? filterCourse : undefined,
        professor: filterProfessor !== '__all__' ? filterProfessor : undefined,
        isActive:
          filterActive !== '__all__' ? filterActive === 'true' : undefined,
      },
    ],
    queryFn: () =>
      examsApi.list({
        course: filterCourse !== '__all__' ? filterCourse : undefined,
        professor: filterProfessor !== '__all__' ? filterProfessor : undefined,
        isActive:
          filterActive !== '__all__' ? filterActive === 'true' : undefined,
      }),
  });

  const filteredExams = searchTitle
    ? exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
    : exams;

  const createMutation = useMutation({
    mutationFn: (data: ExamFormData) => {
      return examsApi.create({
        course: data.course,
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
        location: data.location,
        maxPoints: data.maxPoints,
        passingPoints: data.passingPoints,
        type: data.type,
        subscriptionDeadline: new Date(data.subscriptionDeadline).toISOString(),
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam created successfully');
      setCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to create exam'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExamFormData }) => {
      return examsApi.update(id, {
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
        location: data.location,
        maxPoints: data.maxPoints,
        passingPoints: data.passingPoints,
        type: data.type,
        subscriptionDeadline: new Date(data.subscriptionDeadline).toISOString(),
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam updated successfully');
      setEditDialog({ open: false, exam: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to update exam'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted successfully');
      setDeleteDialog({ open: false, exam: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete exam'));
    },
  });

  const getCourseName = (exam: Exam) => {
    if (typeof exam.course === 'string') {
      const course = courses.find(c => c._id === exam.course);
      return course?.name || 'Unknown Course';
    }
    return exam.course.name;
  };

  const getProfessorName = (exam: Exam) => {
    if (typeof exam.professor === 'string') {
      const professor = professors.find(p => p._id === exam.professor);
      return professor
        ? `${professor.firstName} ${professor.lastName}`
        : 'Unknown Professor';
    }
    return `${exam.professor.firstName} ${exam.professor.lastName}`;
  };

  const activeExams = exams.filter(e => e.isActive).length;
  const upcomingExams = exams.filter(
    e => new Date(e.date) > new Date() && e.isActive
  ).length;

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
          <h1 className="text-2xl md:text-3xl font-bold">Exam Management</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage exams across all courses
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Exam
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Exams
                </p>
                <p className="text-2xl font-bold">{exams.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Exams
                </p>
                <p className="text-2xl font-bold">{activeExams}</p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <FileText className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Exams
                </p>
                <p className="text-2xl font-bold">{upcomingExams}</p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search exams..."
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
        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredExams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchTitle ||
              filterCourse !== '__all__' ||
              filterProfessor !== '__all__' ||
              filterActive !== '__all__'
                ? 'No exams found'
                : 'No exams created yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTitle ||
              filterCourse !== '__all__' ||
              filterProfessor !== '__all__' ||
              filterActive !== '__all__'
                ? 'Try adjusting your search criteria'
                : 'Create your first exam to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map(exam => {
            const courseName = getCourseName(exam);
            const professorName = getProfessorName(exam);
            const examDate = new Date(exam.date);
            const deadline = new Date(exam.subscriptionDeadline);
            const isPast = examDate < new Date();
            const canSubscribe = new Date() < deadline;

            return (
              <Card
                key={exam._id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/app/admin/exams/${exam._id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2 flex-1">
                      {exam.title}
                    </CardTitle>
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={e => {
                          e.stopPropagation();
                          setEditDialog({ open: true, exam });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={e => {
                          e.stopPropagation();
                          setDeleteDialog({ open: true, exam });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium">{courseName}</p>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{professorName}</span>
                    </div>
                  </div>

                  {exam.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {exam.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(examDate, 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    {exam.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Location: {exam.location}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Deadline: {format(deadline, 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        Points: {exam.passingPoints}/{exam.maxPoints} to pass
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={exam.isActive ? 'success' : 'secondary'}>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge
                      variant={
                        exam.type === 'preliminary' ? 'default' : 'outline'
                      }
                    >
                      {exam.type === 'preliminary'
                        ? 'Preliminary'
                        : 'Finishing'}
                    </Badge>
                    {isPast && <Badge variant="outline">Past</Badge>}
                    {!isPast && !canSubscribe && exam.type === 'finishing' && (
                      <Badge variant="warning">Subscription Closed</Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/app/admin/exams/${exam._id}`);
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="Create Exam"
        description="Create a new exam for a course"
      >
        <DialogContent>
          <ExamForm
            courses={courses}
            onSubmit={data => createMutation.mutate(data)}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, exam: null })}
        title="Edit Exam"
        description="Update exam details"
      >
        <DialogContent>
          <ExamForm
            exam={editDialog.exam}
            courses={courses}
            onSubmit={data =>
              editDialog.exam &&
              updateMutation.mutate({ id: editDialog.exam._id, data })
            }
            onCancel={() => setEditDialog({ open: false, exam: null })}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, exam: null })}
        title="Delete Exam"
        description={
          deleteDialog.exam
            ? `Are you sure you want to delete "${deleteDialog.exam.title}"? This action cannot be undone.`
            : ''
        }
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, exam: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.exam) {
                  deleteMutation.mutate(deleteDialog.exam._id);
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
