import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  FileText,
  BookOpen,
  CheckCircle,
  XCircle,
  Award,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { examsApi } from '../../lib/api/exams';
import { examSubscriptionsApi } from '../../lib/api/examSubscriptions';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

export function StudentExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    data: exam,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => examsApi.getById(id!),
    enabled: !!id,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => enrollmentsApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const { data: mySubscriptions = [] } = useQuery({
    queryKey: ['examSubscriptions', 'my'],
    queryFn: () => examSubscriptionsApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const subscription = mySubscriptions.find(
    sub => (typeof sub.exam === 'string' ? sub.exam : sub.exam._id) === id
  );

  const subscribeMutation = useMutation({
    mutationFn: () => examSubscriptionsApi.subscribe(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
      toast.success('Successfully subscribed to exam');
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to subscribe to exam'));
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: () => {
      if (!subscription) throw new Error('No subscription found');
      return examSubscriptionsApi.unsubscribe(subscription._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
      toast.success('Successfully unsubscribed from exam');
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to unsubscribe from exam'));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Exam not found</p>
            <p className="text-sm">
              The exam you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/student/exams')}>
          Back to My Exams
        </Button>
      </div>
    );
  }

  const courseId =
    typeof exam.course === 'string' ? exam.course : exam.course._id;
  const enrollment = enrollments.find(
    e =>
      (typeof e.course === 'string' ? e.course : e.course._id) === courseId &&
      e.status !== 'cancelled'
  );

  if (!enrollment) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">
              You are not enrolled in this course. Please enroll to view exam
              details.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/student/exams')}>
          Back to My Exams
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof exam.course === 'string') {
      return 'Unknown Course';
    }
    return exam.course.name || 'Unknown Course';
  };

  const getProfessorName = () => {
    if (!exam.course || typeof exam.course === 'string') {
      return 'Unknown Professor';
    }
    if (!exam.course.professor) {
      return 'Unknown Professor';
    }
    if (typeof exam.course.professor === 'string') {
      return 'Unknown Professor';
    }
    return `${exam.course.professor.firstName} ${exam.course.professor.lastName}`;
  };

  const isPreliminary = exam.type === 'preliminary';
  const isSubscribed = !!subscription || isPreliminary;
  const isGraded =
    subscription?.status === 'passed' ||
    subscription?.status === 'failed' ||
    subscription?.status === 'graded';

  const canSubscribe =
    !isPreliminary && !isSubscribed && exam.subscriptionDeadline
      ? new Date() < new Date(exam.subscriptionDeadline)
      : false;

  const canUnsubscribe =
    !isPreliminary && isSubscribed && subscription && !isGraded;

  const examDate = new Date(exam.date);
  const now = new Date();
  const isUpcoming = examDate >= now;

  const getStatusBadge = () => {
    if (isGraded) {
      if (subscription?.status === 'passed') {
        return <Badge variant="success">Passed</Badge>;
      }
      if (subscription?.status === 'failed') {
        return <Badge variant="destructive">Failed</Badge>;
      }
      return <Badge variant="default">Graded</Badge>;
    }
    if (isSubscribed) {
      return (
        <Badge variant={isPreliminary ? 'default' : 'outline'}>
          {isPreliminary ? 'Auto-Subscribed' : 'Subscribed'}
        </Badge>
      );
    }
    return <Badge variant="outline">Not Subscribed</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/student/exams')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {getCourseName()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Badge variant={isUpcoming ? 'default' : 'outline'}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </Badge>
          <Button
            variant="outline"
            onClick={() => navigate(`/app/student/courses/${courseId}`)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Course
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exam Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-base font-semibold mt-1">{exam.title}</p>
            </div>
            {exam.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-base mt-1 whitespace-pre-wrap">
                  {exam.description}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <div className="mt-1">
                <Badge variant={isPreliminary ? 'default' : 'outline'}>
                  {isPreliminary ? 'Preliminary' : 'Finishing'}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">
                  {format(examDate, 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
            {exam.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <p className="text-base mt-1">{exam.location}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Points System
              </p>
              <p className="text-base mt-1">
                {exam.passingPoints}/{exam.maxPoints} points to pass
              </p>
            </div>
            {!isPreliminary && exam.subscriptionDeadline && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subscription Deadline
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">
                    {format(
                      new Date(exam.subscriptionDeadline),
                      'MMMM dd, yyyy HH:mm'
                    )}
                  </p>
                </div>
              </div>
            )}
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
          </CardContent>
        </Card>
      </div>

      {isGraded && subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Grading Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Points
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold">
                  {subscription.points !== undefined
                    ? `${subscription.points} / ${exam.maxPoints}`
                    : 'N/A'}
                </p>
                {subscription.points !== undefined &&
                  subscription.points >= exam.passingPoints && (
                    <CheckCircle className="h-6 w-6 text-success" />
                  )}
                {subscription.points !== undefined &&
                  subscription.points < exam.passingPoints && (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
              </div>
            </div>
            {subscription.grade !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Grade
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">{subscription.grade}</p>
                  <Badge
                    variant={
                      subscription.grade >= 6 ? 'success' : 'destructive'
                    }
                  >
                    {subscription.grade >= 6 ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              </div>
            )}
            {subscription.comment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Comment
                </p>
                <p className="text-base mt-1 whitespace-pre-wrap">
                  {subscription.comment}
                </p>
              </div>
            )}
            {subscription.gradedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Graded At
                </p>
                <p className="text-base mt-1">
                  {format(
                    new Date(subscription.gradedAt),
                    'MMMM dd, yyyy HH:mm'
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isPreliminary && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-base mt-1">
                  {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </p>
              </div>
              <div className="flex gap-2">
                {canSubscribe && (
                  <Button
                    onClick={() => subscribeMutation.mutate()}
                    disabled={subscribeMutation.isPending}
                  >
                    {subscribeMutation.isPending
                      ? 'Subscribing...'
                      : 'Subscribe to Exam'}
                  </Button>
                )}
                {canUnsubscribe && (
                  <Button
                    variant="outline"
                    onClick={() => unsubscribeMutation.mutate()}
                    disabled={unsubscribeMutation.isPending}
                  >
                    {unsubscribeMutation.isPending
                      ? 'Unsubscribing...'
                      : 'Unsubscribe'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
