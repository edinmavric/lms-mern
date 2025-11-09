import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Award,
  UserRound,
  BookOpen,
  Calendar,
} from 'lucide-react';

import { gradesApi } from '../../lib/api/grades';
import { coursesApi } from '../../lib/api/courses';
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

export function ProfessorGradeDetail() {
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

  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
    enabled: !!user?._id,
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
        <Button onClick={() => navigate('/app/professor/grades')}>
          Back to My Grades
        </Button>
      </div>
    );
  }

  const gradeCourseId =
    typeof grade.course === 'string' ? grade.course : grade.course._id;
  const isMyGrade = myCourses.some(course => course._id === gradeCourseId);

  const isMyProfessorGrade =
    typeof grade.professor === 'string'
      ? grade.professor === user?._id
      : grade.professor?._id === user?._id;

  if (!isMyGrade || !isMyProfessorGrade) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">
              This grade does not belong to any of your courses.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/grades')}>
          Back to My Grades
        </Button>
      </div>
    );
  }

  const getStudentName = () => {
    if (typeof grade.student === 'string') return 'Unknown Student';
    return `${grade.student.firstName} ${grade.student.lastName}`;
  };

  const getStudentEmail = () => {
    if (typeof grade.student === 'string') return '';
    return grade.student.email;
  };

  const getCourseName = () => {
    if (typeof grade.course === 'string') {
      const course = myCourses.find(c => c._id === grade.course);
      return course?.name || 'Unknown Course';
    }
    return grade.course.name || 'Unknown Course';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/professor/grades')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Grade: {grade.value}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Grade Details
            </p>
          </div>
        </div>
        {grade.attempt && grade.attempt > 1 && (
          <Badge variant="outline">Attempt {grade.attempt}</Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Student Name
              </p>
              <p className="text-base font-semibold mt-1">{getStudentName()}</p>
            </div>
            {getStudentEmail() && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-base mt-1">{getStudentEmail()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course Name
              </p>
              <p className="text-base font-semibold mt-1">{getCourseName()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Grade Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Grade Value
              </p>
              <p className="text-2xl font-bold mt-1">{grade.value}</p>
            </div>
            {grade.attempt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Attempt
                </p>
                <p className="text-2xl font-bold mt-1">{grade.attempt}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-base mt-1">
                {new Date(grade.date).toLocaleDateString()}
              </p>
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
        </CardContent>
      </Card>

      {grade.history && grade.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Grade History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grade.history.map((historyItem, index) => {
                const changedByName =
                  typeof historyItem.changedBy === 'string'
                    ? 'Unknown'
                    : `${historyItem.changedBy.firstName} ${historyItem.changedBy.lastName}`;
                return (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Changed from {historyItem.oldValue} to{' '}
                          {historyItem.newValue}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {changedByName} on{' '}
                          {new Date(historyItem.changedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
