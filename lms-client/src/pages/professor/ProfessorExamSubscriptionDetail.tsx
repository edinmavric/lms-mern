import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Award,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

import { examSubscriptionsApi } from '../../lib/api/examSubscriptions';
import { examsApi } from '../../lib/api/exams';
import { usersApi } from '../../lib/api/users';
import { coursesApi } from '../../lib/api/courses';
import { pointsApi } from '../../lib/api/points';
import { useAuthStore } from '../../store/authStore';
import type { Point } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
} from '../../components/ui';

export function ProfessorExamSubscriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examSubscription', id],
    queryFn: () => examSubscriptionsApi.getById(id!),
    enabled: !!id,
  });

  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
  });

  const { data: allExams = [] } = useQuery({
    queryKey: ['exams', 'all'],
    queryFn: () => examsApi.list({}),
  });

  const myExams = allExams.filter(exam => {
    const courseId =
      typeof exam.course === 'string' ? exam.course : exam.course._id;
    return myCourses.some(course => course._id === courseId);
  });

  const examId =
    subscription &&
    (typeof subscription.exam === 'string'
      ? subscription.exam
      : subscription.exam._id);

  const studentId =
    subscription &&
    (typeof subscription.student === 'string'
      ? subscription.student
      : subscription.student._id);

  const courseId = subscription
    ? (() => {
        if (typeof subscription.exam === 'string') {
          const exam = myExams.find(e => e._id === subscription.exam);
          if (!exam) return undefined;
          return typeof exam.course === 'string'
            ? exam.course
            : exam.course._id;
        } else {
          return typeof subscription.exam.course === 'string'
            ? subscription.exam.course
            : subscription.exam.course._id;
        }
      })()
    : undefined;

  const { data: studentPoints = [] } = useQuery({
    queryKey: ['points', 'student', studentId, 'course', courseId],
    queryFn: () =>
      pointsApi.list({
        student: studentId!,
        course: courseId!,
      }),
    enabled: !!studentId && !!courseId && !!subscription,
  });

  const studentPointsSummary = studentPoints.reduce(
    (acc, point: Point) => {
      acc.totalPoints += point.points;
      acc.totalMaxPoints += point.maxPoints;
      return acc;
    },
    { totalPoints: 0, totalMaxPoints: 0 }
  );

  const studentPointsPercentage =
    studentPointsSummary.totalMaxPoints > 0
      ? (studentPointsSummary.totalPoints /
          studentPointsSummary.totalMaxPoints) *
        100
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Exam subscription not found</p>
            <p className="text-sm">
              The exam subscription you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/exam-subscriptions')}>
          Back to Exam Subscriptions
        </Button>
      </div>
    );
  }

  // Verify that this subscription belongs to professor's exam
  const belongsToProfessor = myExams.some(exam => exam._id === examId);

  if (!belongsToProfessor) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">
              You don't have access to this exam subscription.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/exam-subscriptions')}>
          Back to Exam Subscriptions
        </Button>
      </div>
    );
  }

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const getExamTitle = () => {
    if (typeof subscription.exam === 'string') {
      const exam = myExams.find(e => e._id === subscription.exam);
      return exam?.title || 'Unknown Exam';
    }
    return subscription.exam.title;
  };

  const getStudentName = () => {
    if (typeof subscription.student === 'string') {
      const student = students.find(s => s._id === subscription.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    return `${subscription.student.firstName} ${subscription.student.lastName}`;
  };

  const getStudentEmail = () => {
    if (typeof subscription.student === 'string') {
      const student = students.find(s => s._id === subscription.student);
      return student?.email || '';
    }
    return subscription.student.email;
  };

  const getGradedByName = () => {
    if (!subscription.gradedBy) return 'N/A';
    if (typeof subscription.gradedBy === 'string') {
      return 'Unknown User';
    }
    return `${subscription.gradedBy.firstName} ${subscription.gradedBy.lastName}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'subscribed':
        return <Badge variant="outline">Subscribed</Badge>;
      case 'passed':
        return <Badge variant="success">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'graded':
        return <Badge variant="default">Graded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exam =
    typeof subscription.exam === 'string'
      ? myExams.find(e => e._id === subscription.exam)
      : subscription.exam;

  const isGraded =
    subscription.status === 'passed' ||
    subscription.status === 'failed' ||
    subscription.status === 'graded';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/professor/exam-subscriptions')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Exam Subscription
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {getExamTitle()} • {getStudentName()}
            </p>
          </div>
        </div>
        {exam && (
          <Button
            variant="outline"
            onClick={() => navigate(`/app/professor/exams/${examId}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Exam
          </Button>
        )}
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
              <p className="text-sm font-medium text-muted-foreground">
                Exam Title
              </p>
              <p className="text-base font-semibold mt-1">{getExamTitle()}</p>
            </div>
            {exam && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Exam Date
                  </p>
                  <p className="text-base mt-1">
                    {format(new Date(exam.date), 'MMMM dd, yyyy HH:mm')}
                  </p>
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
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
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
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <div className="mt-1">{getStatusBadge(subscription.status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Subscribed At
              </p>
              <p className="text-base mt-1">
                {format(
                  new Date(subscription.createdAt),
                  'MMMM dd, yyyy HH:mm'
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isGraded && exam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Grading Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Points
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-base font-semibold">
                  {subscription.points !== undefined
                    ? `${subscription.points} / ${exam.maxPoints}`
                    : 'N/A'}
                </p>
                {subscription.points !== undefined &&
                  subscription.points >= exam.passingPoints && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                {subscription.points !== undefined &&
                  subscription.points < exam.passingPoints && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
              </div>
            </div>
            {subscription.grade !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Grade
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base font-semibold">
                    {subscription.grade}
                  </p>
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
            {subscription.gradedBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Graded By
                </p>
                <p className="text-base mt-1">{getGradedByName()}</p>
              </div>
            )}
            {subscription.comment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Comment
                </p>
                <p className="text-base mt-1">{subscription.comment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {studentPoints.length > 0 && courseId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Student Course Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Points
                </p>
                <p className="text-2xl font-bold mt-1">
                  {studentPointsSummary.totalPoints} /{' '}
                  {studentPointsSummary.totalMaxPoints}
                </p>
              </div>
              <Badge
                variant={
                  studentPointsPercentage >= 80
                    ? 'success'
                    : studentPointsPercentage >= 60
                    ? 'default'
                    : studentPointsPercentage >= 40
                    ? 'warning'
                    : 'destructive'
                }
                className="text-lg"
              >
                {studentPointsPercentage.toFixed(1)}%
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Assignments Completed
              </p>
              <p className="text-base mt-1">
                {studentPoints.length} assignments
              </p>
            </div>
            {studentPoints.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Recent Assignments:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {studentPoints.slice(0, 10).map((point: Point) => (
                    <div
                      key={point._id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <span className="text-sm truncate flex-1">
                        {point.title}
                      </span>
                      <span className="text-sm font-medium ml-2">
                        {point.points}/{point.maxPoints}
                      </span>
                    </div>
                  ))}
                  {studentPoints.length > 10 && (
                    <p className="text-xs text-muted-foreground italic">
                      +{studentPoints.length - 10} more assignments
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Subscribed At
            </p>
            <p className="text-base mt-1">
              {format(new Date(subscription.createdAt), 'MMMM dd, yyyy HH:mm')}
            </p>
          </div>
          {subscription.gradedAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Graded At
              </p>
              <p className="text-base mt-1">
                {format(new Date(subscription.gradedAt), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
          )}
          {subscription.updatedAt !== subscription.createdAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-base mt-1">
                {format(
                  new Date(subscription.updatedAt),
                  'MMMM dd, yyyy HH:mm'
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
