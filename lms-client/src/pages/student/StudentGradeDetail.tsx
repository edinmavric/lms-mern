import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Award,
  BookOpen,
  User,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

import { gradesApi } from '../../lib/api/grades';
import { useAuthStore } from '../../store/authStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

export function StudentGradeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    data: grade,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['grade', id],
    queryFn: () => gradesApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !grade) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Grade not found</p>
            <p className="text-sm">
              The grade you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/student/grades')}>
          Back to My Grades
        </Button>
      </div>
    );
  }

  const studentId =
    typeof grade.student === 'string' ? grade.student : grade.student._id;
  if (studentId !== user?._id) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">You don't have access to this grade.</p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/student/grades')}>
          Back to My Grades
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof grade.course === 'string') {
      return 'Unknown Course';
    }
    return grade.course.name || 'Unknown Course';
  };

  const getProfessorName = () => {
    if (typeof grade.professor === 'string') {
      return 'Unknown Professor';
    }
    return `${grade.professor.firstName} ${grade.professor.lastName}`;
  };

  const getGradeBadgeVariant = (gradeValue: number) => {
    if (gradeValue >= 90) return 'success';
    if (gradeValue >= 80) return 'default';
    if (gradeValue >= 70) return 'warning';
    return 'destructive';
  };

  const courseId =
    typeof grade.course === 'string' ? grade.course : grade.course._id;
  const gradeDate = new Date(grade.date);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/student/grades')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Grade Details</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {getCourseName()}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/app/student/courses/${courseId}`)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          View Course
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Grade Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Grade</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-bold">{grade.value}</p>
                <Badge variant={getGradeBadgeVariant(grade.value)}>
                  {grade.value >= 6 ? 'Passed' : 'Failed'}
                </Badge>
              </div>
            </div>
            {grade.comment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Comment
                </p>
                <p className="text-base mt-1 whitespace-pre-wrap">
                  {grade.comment}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">
                  {format(gradeDate, 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course & Professor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course
              </p>
              <div className="flex items-center gap-2 mt-1">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-base font-semibold">{getCourseName()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Professor
              </p>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">{getProfessorName()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base mt-1">
                {format(new Date(grade.createdAt), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
            {grade.updatedAt !== grade.createdAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Updated At
                </p>
                <p className="text-base mt-1">
                  {format(new Date(grade.updatedAt), 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
