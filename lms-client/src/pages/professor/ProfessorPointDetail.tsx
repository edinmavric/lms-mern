import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Award, BookOpen, User, Edit } from 'lucide-react';
import { format } from 'date-fns';

import { pointsApi } from '../../lib/api/points';
import { coursesApi } from '../../lib/api/courses';
import { usersApi } from '../../lib/api/users';
import { useAuthStore } from '../../store/authStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
} from '../../components/ui';

export function ProfessorPointDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    data: point,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['point', id],
    queryFn: () => pointsApi.getById(id!),
    enabled: !!id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !point) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Point not found</p>
            <p className="text-sm">
              The point assignment you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/points')}>
          Back to Points
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof point.course === 'string') {
      const course = courses.find(c => c._id === point.course);
      return course?.name || 'Unknown Course';
    }
    return point.course.name;
  };

  const getStudentName = () => {
    if (typeof point.student === 'string') {
      const student = students.find(s => s._id === point.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    return `${point.student.firstName} ${point.student.lastName}`;
  };

  const pointDate = new Date(point.date);
  const percentage = (point.points / point.maxPoints) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/professor/points')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{point.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {getCourseName()} • {getStudentName()}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/app/professor/points/${id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Point
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Point Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-base font-semibold mt-1">{point.title}</p>
            </div>
            {point.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-base mt-1">{point.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Points
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-base font-semibold">
                  {point.points} / {point.maxPoints}
                </p>
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
                  {percentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-base mt-1">
                {format(pointDate, 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course & Student Information
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
                Student
              </p>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">{getStudentName()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base mt-1">
                {format(new Date(point.createdAt), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
            {point.updatedAt !== point.createdAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Updated At
                </p>
                <p className="text-base mt-1">
                  {format(new Date(point.updatedAt), 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
