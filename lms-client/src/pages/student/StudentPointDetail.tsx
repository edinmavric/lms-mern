import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Award, BookOpen, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { pointsApi } from '../../lib/api/points';
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

export function StudentPointDetail() {
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
            <p className="font-medium">Point assignment not found</p>
            <p className="text-sm">
              The point assignment you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/student/points')}>
          Back to My Points
        </Button>
      </div>
    );
  }

  const studentId =
    typeof point.student === 'string' ? point.student : point.student._id;
  if (studentId !== user?._id) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">
              You don't have access to this point assignment.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/student/points')}>
          Back to My Points
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof point.course === 'string') {
      return 'Unknown Course';
    }
    return point.course.name || 'Unknown Course';
  };

  const pointDate = new Date(point.date);
  const percentage = (point.points / point.maxPoints) * 100;
  const courseId =
    typeof point.course === 'string' ? point.course : point.course._id;

  const getPercentageBadgeVariant = (percent: number) => {
    if (percent >= 80) return 'success';
    if (percent >= 60) return 'default';
    if (percent >= 40) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/student/points')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{point.title}</h1>
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
                <p className="text-base mt-1 whitespace-pre-wrap">
                  {point.description}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Points
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold">
                  {point.points} / {point.maxPoints}
                </p>
                <Badge variant={getPercentageBadgeVariant(percentage)}>
                  {percentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">
                  {format(pointDate, 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
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
                Course
              </p>
              <div className="flex items-center gap-2 mt-1">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-base font-semibold">{getCourseName()}</p>
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
