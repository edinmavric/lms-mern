import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Award, Search, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { gradesApi } from '../../lib/api/grades';
import { usersApi } from '../../lib/api/users';
import { coursesApi } from '../../lib/api/courses';
import { getErrorMessage } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import type { Grade } from '../../types';
import {
  GradeForm,
  useGradeForm,
  type GradeFormData,
} from '../admin/GradeForm';
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

export function ProfessorGradesList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchStudent, setSearchStudent] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    grade: Grade | null;
  }>({ open: false, grade: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    grade: Grade | null;
  }>({ open: false, grade: null });

  // Get only courses where the professor is assigned
  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
  });

  // Get all students
  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const { data: grades = [], isLoading } = useQuery({
    queryKey: [
      'grades',
      {
        professor: user?._id,
        course:
          filterCourse && filterCourse !== '__all__' ? filterCourse : undefined,
      },
    ],
    queryFn: () =>
      gradesApi.list({
        professor: user?._id,
        course:
          filterCourse && filterCourse !== '__all__' ? filterCourse : undefined,
      }),
    enabled: !!user?._id,
  });

  const myGrades = grades.filter(grade => {
    const gradeCourseId =
      typeof grade.course === 'string' ? grade.course : grade.course._id;
    const belongsToMyCourse = myCourses.some(
      course => course._id === gradeCourseId
    );

    if (filterCourse && filterCourse !== '__all__') {
      return belongsToMyCourse && gradeCourseId === filterCourse;
    }

    return belongsToMyCourse;
  });

  const filteredGrades = searchStudent
    ? myGrades.filter(grade => {
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
    : myGrades;

  const createMutation = useMutation({
    mutationFn: (data: GradeFormData) => {
      return gradesApi.create({
        student: data.student,
        course: data.course,
        value: data.value,
        comment: data.comment,
        attempt: data.attempt,
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
    mutationFn: (id: string) => {
      return gradesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast.success('Grade deleted successfully');
      setDeleteDialog({ open: false, grade: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete grade'));
    },
  });

  const createForm = useGradeForm();
  const editForm = useGradeForm(editDialog.grade || undefined);

  const handleCreateSubmit = async (data: GradeFormData) => {
    await createMutation.mutateAsync(data);
    createForm.reset();
  };

  const handleEditSubmit = async (data: GradeFormData) => {
    if (editDialog.grade) {
      await updateMutation.mutateAsync({ id: editDialog.grade._id, data });
      editForm.reset();
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.grade) {
      await deleteMutation.mutateAsync(deleteDialog.grade._id);
    }
  };

  const getStudentName = (grade: Grade) => {
    if (typeof grade.student === 'string') {
      const student = students.find(s => s._id === grade.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    return `${grade.student.firstName} ${grade.student.lastName}`;
  };

  const getCourseName = (grade: Grade) => {
    if (typeof grade.course === 'string') {
      const course = myCourses.find(c => c._id === grade.course);
      return course?.name || 'Unknown Course';
    }
    return grade.course.name || 'Unknown Course';
  };

  // Get students enrolled in the selected course (or all students if no course selected)
  const getAvailableStudents = () => {
    if (filterCourse) {
      const course = myCourses.find(c => c._id === filterCourse);
      if (course && Array.isArray(course.students)) {
        const enrolledStudentIds = course.students.map(s =>
          typeof s === 'string' ? s : s._id
        );
        return students.filter(s => enrolledStudentIds.includes(s._id));
      }
    }
    return students;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Grades</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage grades for your courses
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={myCourses.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Grade
        </Button>
      </div>

      {myCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No courses assigned
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              You need to be assigned to a course before you can create grades
            </p>
          </CardContent>
        </Card>
      )}

      {myCourses.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or email..."
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
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

          {filteredGrades.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {searchStudent || filterCourse
                    ? 'No grades found'
                    : 'No grades yet'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchStudent || filterCourse
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first grade to get started'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGrades.map(grade => (
                <Card
                  key={grade._id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/app/professor/grades/${grade._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        Grade: {grade.value}
                      </CardTitle>
                      {grade.attempt && grade.attempt > 1 && (
                        <Badge variant="outline">Attempt {grade.attempt}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Student
                        </p>
                        <p className="text-base font-semibold">
                          {getStudentName(grade)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Course
                        </p>
                        <p className="text-base">{getCourseName(grade)}</p>
                      </div>
                      {grade.comment && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Comment
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {grade.comment}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Date
                        </p>
                        <p className="text-sm">
                          {new Date(grade.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          setEditDialog({ open: true, grade });
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          setDeleteDialog({ open: true, grade });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <FormDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          createForm.reset();
        }}
        title="Create Grade"
        description="Create a new grade for a student in your course"
        onSubmit={createForm.handleSubmit(handleCreateSubmit)}
        isSubmitting={createMutation.isPending}
      >
        <GradeForm
          students={getAvailableStudents()}
          courses={myCourses}
          register={createForm.register}
          control={createForm.control}
          errors={createForm.formState.errors}
          isSubmitting={createMutation.isPending}
          allowEditStudentCourse={true}
        />
      </FormDialog>

      <FormDialog
        open={editDialog.open}
        onClose={() => {
          setEditDialog({ open: false, grade: null });
          editForm.reset();
        }}
        title="Edit Grade"
        description="Update grade details"
        onSubmit={editForm.handleSubmit(handleEditSubmit)}
        isSubmitting={updateMutation.isPending}
      >
        <GradeForm
          students={getAvailableStudents()}
          courses={myCourses}
          register={editForm.register}
          control={editForm.control}
          errors={editForm.formState.errors}
          isSubmitting={updateMutation.isPending}
          allowEditStudentCourse={false}
        />
      </FormDialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, grade: null })}
        title="Delete Grade"
        description="Are you sure you want to delete this grade? This action cannot be undone."
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
