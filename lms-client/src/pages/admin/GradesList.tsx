import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Award, Search, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { gradesApi } from '../../lib/api/grades';
import { usersApi } from '../../lib/api/users';
import { coursesApi } from '../../lib/api/courses';
import { getErrorMessage } from '../../lib/utils';
import type { Grade } from '../../types';
import { GradeForm, useGradeForm, type GradeFormData } from './GradeForm';
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

export function GradesList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchStudent, setSearchStudent] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterProfessor, setFilterProfessor] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    grade: Grade | null;
  }>({ open: false, grade: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    grade: Grade | null;
  }>({ open: false, grade: null });

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const { data: professors = [] } = useQuery({
    queryKey: ['users', 'professors'],
    queryFn: () => usersApi.list({ role: 'professor', status: 'active' }),
  });

  const { data: grades = [], isLoading } = useQuery({
    queryKey: [
      'grades',
      {
        course: filterCourse || undefined,
        professor: filterProfessor || undefined,
      },
    ],
    queryFn: () =>
      gradesApi.list({
        course: filterCourse || undefined,
        professor: filterProfessor || undefined,
      }),
  });

  const { data: allGrades = [] } = useQuery({
    queryKey: ['grades', 'all'],
    queryFn: () => gradesApi.list({}),
  });

  const filteredGrades = searchStudent
    ? grades.filter(grade => {
        const student =
          typeof grade.student === 'string'
            ? students.find(s => s._id === grade.student)
            : grade.student;
        if (!student) return false;
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        const email = student.email.toLowerCase();
        const search = searchStudent.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      })
    : grades;

  const createMutation = useMutation({
    mutationFn: (data: GradeFormData) => {
      return gradesApi.create({
        student: data.student,
        course: data.course,
        value: data.value,
        comment: data.comment,
        attempt: data.attempt || 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast.success('Grade created successfully');
      setCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to create grade'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GradeFormData }) => {
      const updateData = {
        value: data.value,
        comment: data.comment,
      };
      return gradesApi.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast.success('Grade updated successfully');
      setEditDialog({ open: false, grade: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to update grade'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gradesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast.success('Grade deleted successfully');
      setDeleteDialog({ open: false, grade: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete grade'));
    },
  });

  const getStudentName = (grade: Grade) => {
    if (!grade?.student) return 'Unknown Student';
    if (typeof grade.student === 'string') {
      const student = students.find(s => s._id === grade.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    if (grade.student.firstName && grade.student.lastName) {
      return `${grade.student.firstName} ${grade.student.lastName}`;
    }
    return 'Unknown Student';
  };

  const getCourseName = (grade: Grade) => {
    if (!grade?.course) return 'Unknown Course';
    if (typeof grade.course === 'string') {
      const course = courses.find(c => c._id === grade.course);
      return course ? course.name : 'Unknown Course';
    }
    return grade.course.name || 'Unknown Course';
  };

  const getProfessorName = (grade: Grade) => {
    if (!grade?.professor) return 'Unknown Professor';
    if (typeof grade.professor === 'string') {
      const professor = professors.find(p => p._id === grade.professor);
      return professor
        ? `${professor.firstName} ${professor.lastName}`
        : 'Unknown Professor';
    }
    if (grade.professor.firstName && grade.professor.lastName) {
      return `${grade.professor.firstName} ${grade.professor.lastName}`;
    }
    return 'Unknown Professor';
  };

  const getAverageGrade = () => {
    if (allGrades.length === 0) return 0;
    const sum = allGrades.reduce((acc, grade) => acc + grade.value, 0);
    return sum / allGrades.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Grades</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage student grades and assessments
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Grade
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Grades
                </p>
                <p className="text-2xl font-bold">{allGrades.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Grade
                </p>
                <p className="text-2xl font-bold">
                  {getAverageGrade().toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <Award className="h-6 w-6 text-success" />
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
                      allGrades.map(g =>
                        typeof g.student === 'string'
                          ? g.student
                          : g.student._id
                      )
                    ).size
                  }
                </p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <Award className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Unique Courses
                </p>
                <p className="text-2xl font-bold">
                  {
                    new Set(
                      allGrades.map(g =>
                        typeof g.course === 'string' ? g.course : g.course._id
                      )
                    ).size
                  }
                </p>
              </div>
              <div className="rounded-full bg-default/10 p-3">
                <Award className="h-6 w-6 text-default" />
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
              value={filterProfessor || 'all'}
              onValueChange={value =>
                setFilterProfessor(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by professor" />
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
          <CardTitle>Grades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading grades...
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No grades found
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
                        Grade
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Professor
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Attempt
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.map(grade => (
                      <tr
                        key={grade._id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={e => {
                          if ((e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          navigate(`/app/admin/grades/${grade._id}`);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!(e.target as HTMLElement).closest('button')) {
                              navigate(`/app/admin/grades/${grade._id}`);
                            }
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${getStudentName(grade)}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {getStudentName(grade)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {getCourseName(grade)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="default"
                            className="text-lg font-bold"
                          >
                            {grade.value.toFixed(2)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {getProfessorName(grade)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {grade.attempt}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {new Date(grade.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditDialog({ open: true, grade })
                              }
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({ open: true, grade })
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
                {filteredGrades.map(grade => (
                  <Card
                    key={grade._id}
                    className="border-border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      navigate(`/app/admin/grades/${grade._id}`);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!(e.target as HTMLElement).closest('button')) {
                          navigate(`/app/admin/grades/${grade._id}`);
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${getStudentName(grade)}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {getStudentName(grade)}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getCourseName(grade)}
                          </p>
                        </div>
                        <Badge variant="default" className="text-lg font-bold">
                          {grade.value.toFixed(2)}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">
                          <span className="font-medium">Professor:</span>{' '}
                          {getProfessorName(grade)}
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-medium">Attempt:</span>{' '}
                          {grade.attempt}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Date: {new Date(grade.date).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditDialog({ open: true, grade })}
                          className="flex-1 min-w-[100px]"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, grade })}
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

      <CreateGradeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={async data => {
          await createMutation.mutateAsync(data);
        }}
        isSubmitting={createMutation.isPending}
        error={
          createMutation.error
            ? getErrorMessage(createMutation.error, 'Failed to create grade')
            : null
        }
        students={students}
        courses={courses}
      />

      {editDialog.grade && (
        <EditGradeDialog
          open={editDialog.open}
          grade={editDialog.grade}
          onClose={() => setEditDialog({ open: false, grade: null })}
          onSubmit={async data => {
            await updateMutation.mutateAsync({
              id: editDialog.grade!._id,
              data,
            });
          }}
          isSubmitting={updateMutation.isPending}
          error={
            updateMutation.error
              ? getErrorMessage(updateMutation.error, 'Failed to update grade')
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
            setDeleteDialog({ open: false, grade: null });
          }
        }}
        title="Delete Grade"
        description={
          deleteDialog.grade
            ? `Are you sure you want to delete the grade of ${
                deleteDialog.grade.value
              } for "${getStudentName(deleteDialog.grade)}" in "${getCourseName(
                deleteDialog.grade
              )}"? This action cannot be undone.`
            : 'Are you sure you want to delete this grade? This action cannot be undone.'
        }
        maxWidth="md"
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, grade: null })}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.grade) {
                  deleteMutation.mutate(deleteDialog.grade._id);
                }
              }}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CreateGradeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GradeFormData) => Promise<void>;
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

function CreateGradeDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  students,
  courses,
}: CreateGradeDialogProps) {
  const form = useGradeForm();

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
      title="Create Grade"
      description="Fill in the information below to create a new grade."
      onSubmit={handleSubmit}
      submitLabel="Create Grade"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <GradeForm
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

interface EditGradeDialogProps {
  open: boolean;
  grade: Grade;
  onClose: () => void;
  onSubmit: (data: GradeFormData) => Promise<void>;
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

function EditGradeDialog({
  open,
  onClose,
  onSubmit,
  grade,
  isSubmitting,
  error,
  students,
  courses,
}: EditGradeDialogProps) {
  const form = useGradeForm(grade);

  useEffect(() => {
    if (open && grade) {
      form.reset({
        student:
          typeof grade.student === 'string'
            ? grade.student
            : (grade.student as any)?._id || '',
        course:
          typeof grade.course === 'string'
            ? grade.course
            : (grade.course as any)?._id || '',
        value: grade.value || 0,
        comment: grade.comment || '',
        attempt: grade.attempt || 1,
      });
    }
  }, [open, grade, form]);

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
      title="Edit Grade"
      description="Update the grade value and comment. Student and course cannot be changed."
      onSubmit={handleSubmit}
      submitLabel="Update Grade"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <GradeForm
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
