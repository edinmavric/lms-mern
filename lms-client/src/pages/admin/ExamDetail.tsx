import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  FileText,
  Users,
  Award,
  CheckCircle,
  XCircle,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { examsApi } from '../../lib/api/exams';
import { examSubscriptionsApi } from '../../lib/api/examSubscriptions';
import { pointsApi } from '../../lib/api/points';
import { getErrorMessage } from '../../lib/utils';
import type { ExamSubscription, Point } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogFooter,
  FormField,
  Input,
  Textarea,
} from '../../components/ui';
import type { Exam } from '../../types';

function StudentSubscriptionItem({
  subscription,
  exam,
  courseId,
  onGradeClick,
  getStatusBadge,
}: {
  subscription: ExamSubscription;
  exam: Exam;
  courseId: string;
  onGradeClick: (subscription: ExamSubscription) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  const studentId =
    typeof subscription.student === 'string'
      ? subscription.student
      : subscription.student._id;

  const { data: studentPoints = [] } = useQuery({
    queryKey: ['points', 'student', studentId, 'course', courseId],
    queryFn: () =>
      pointsApi.list({
        student: studentId,
        course: courseId,
      }),
    enabled: !!studentId && !!courseId,
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

  const studentName =
    typeof subscription.student === 'string'
      ? 'Unknown Student'
      : `${subscription.student.firstName} ${subscription.student.lastName}`;

  const isGraded =
    subscription.status === 'passed' ||
    subscription.status === 'failed' ||
    subscription.status === 'graded';

  return (
    <div className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium">{studentName}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {getStatusBadge(subscription.status)}
            {isGraded && subscription.points !== undefined && (
              <span className="text-sm text-muted-foreground">
                {subscription.points}/{exam.maxPoints} points
              </span>
            )}
            {isGraded && subscription.grade && (
              <Badge
                variant={subscription.grade >= 6 ? 'success' : 'destructive'}
              >
                Grade: {subscription.grade}
              </Badge>
            )}
          </div>
          {studentPoints.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="h-3 w-3" />
                <span>
                  Course points: {studentPointsSummary.totalPoints} /{' '}
                  {studentPointsSummary.totalMaxPoints} (
                  {studentPointsPercentage.toFixed(1)}%)
                </span>
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
                  className="text-xs"
                >
                  {studentPoints.length} assignments
                </Badge>
              </div>
            </div>
          )}
          {subscription.comment && (
            <p className="text-sm text-muted-foreground mt-1">
              {subscription.comment}
            </p>
          )}
        </div>
        {subscription.status === 'subscribed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGradeClick(subscription)}
          >
            <Award className="h-4 w-4 mr-2" />
            Grade
          </Button>
        )}
      </div>
    </div>
  );
}

export function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [gradeDialog, setGradeDialog] = useState<{
    open: boolean;
    subscription: ExamSubscription | null;
  }>({ open: false, subscription: null });
  const [points, setPoints] = useState<number>(0);
  const [grade, setGrade] = useState<number>(6);
  const [comment, setComment] = useState<string>('');

  const {
    data: exam,
    isLoading: examLoading,
    error: examError,
  } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => examsApi.getById(id!),
    enabled: !!id,
  });

  const studentId =
    gradeDialog.subscription &&
    (typeof gradeDialog.subscription.student === 'string'
      ? gradeDialog.subscription.student
      : gradeDialog.subscription.student._id);

  const courseId =
    exam && (typeof exam.course === 'string' ? exam.course : exam.course._id);

  const { data: studentPoints = [] } = useQuery({
    queryKey: ['points', 'student', studentId, 'course', courseId],
    queryFn: () =>
      pointsApi.list({
        student: studentId!,
        course: courseId!,
      }),
    enabled: !!studentId && !!courseId && gradeDialog.open && !!exam,
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

  const { data: subscriptions = [], isLoading: subscriptionsLoading } =
    useQuery({
      queryKey: ['examSubscriptions', 'exam', id],
      queryFn: () => examSubscriptionsApi.list({ exam: id }),
      enabled: !!id,
    });

  const gradeMutation = useMutation({
    mutationFn: ({
      subscriptionId,
      points: subPoints,
      grade: subGrade,
      comment: subComment,
    }: {
      subscriptionId: string;
      points: number;
      grade?: number;
      comment?: string;
    }) => {
      return examSubscriptionsApi.grade(subscriptionId, {
        points: subPoints,
        grade: subGrade,
        comment: subComment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
      toast.success('Exam graded successfully');
      setGradeDialog({ open: false, subscription: null });
      setPoints(0);
      setGrade(6);
      setComment('');
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to grade exam'));
    },
  });

  const handleGradeClick = (subscription: ExamSubscription) => {
    setGradeDialog({ open: true, subscription });
    setPoints(subscription.points || 0);
    setGrade(subscription.grade || 6);
    setComment(subscription.comment || '');
  };

  const handleGradeSubmit = () => {
    if (!gradeDialog.subscription || !exam) return;

    const passed = points >= exam.passingPoints;
    const finalGrade = passed ? grade : 5;

    if (passed && (grade < 6 || grade > 10)) {
      toast.error('Passing grade must be between 6 and 10');
      return;
    }

    gradeMutation.mutate({
      subscriptionId: gradeDialog.subscription._id,
      points,
      grade: finalGrade,
      comment,
    });
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

  if (examLoading || subscriptionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (examError || !exam) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Exam not found
          </p>
        </div>
        <Button onClick={() => navigate('/app/admin/exams')}>
          Back to Exams
        </Button>
      </div>
    );
  }

  const examDate = new Date(exam.date);
  const deadline = new Date(exam.subscriptionDeadline);
  const isPast = examDate < new Date();
  const canSubscribe = new Date() < deadline;

  const courseName =
    typeof exam.course === 'string' ? 'Unknown Course' : exam.course.name;

  const professorName =
    typeof exam.professor === 'string'
      ? 'Unknown Professor'
      : `${exam.professor.firstName} ${exam.professor.lastName}`;

  const subscribedCount = subscriptions.filter(
    s => s.status === 'subscribed'
  ).length;
  const passedCount = subscriptions.filter(s => s.status === 'passed').length;
  const failedCount = subscriptions.filter(s => s.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/admin/exams')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {courseName} • {professorName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/app/admin/exams/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Exam
          </Button>
          <Badge variant={exam.isActive ? 'success' : 'secondary'}>
            {exam.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Badge variant={exam.type === 'preliminary' ? 'default' : 'outline'}>
            {exam.type === 'preliminary' ? 'Preliminary' : 'Finishing'}
          </Badge>
          {isPast && <Badge variant="outline">Past</Badge>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subscribed
                </p>
                <p className="text-2xl font-bold">{subscribedCount}</p>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Passed
                </p>
                <p className="text-2xl font-bold text-success">{passedCount}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Failed
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {failedCount}
                </p>
              </div>
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
              </div>
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
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
                <p className="text-base mt-1">{exam.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course
              </p>
              <p className="text-base mt-1">{courseName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Professor
              </p>
              <p className="text-base mt-1">{professorName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Exam Date
              </p>
              <p className="text-base mt-1">
                {format(examDate, 'MMMM dd, yyyy HH:mm')}
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
                Exam Type
              </p>
              <p className="text-base mt-1">
                <Badge
                  variant={exam.type === 'preliminary' ? 'default' : 'outline'}
                >
                  {exam.type === 'preliminary'
                    ? 'Preliminary Exam'
                    : 'Finishing Exam'}
                </Badge>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {exam.type === 'preliminary'
                  ? 'All enrolled students are automatically subscribed'
                  : 'Students must manually subscribe to this exam'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Points System
              </p>
              <p className="text-base mt-1">
                {exam.passingPoints}/{exam.maxPoints} points to pass
              </p>
            </div>
            {exam.type === 'finishing' && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subscription Deadline
                </p>
                <p className="text-base mt-1">
                  {format(deadline, 'MMMM dd, yyyy HH:mm')}
                </p>
                {!canSubscribe && (
                  <Badge variant="warning" className="mt-2">
                    Subscription Closed
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Subscribed Students ({subscriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No students subscribed yet
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {subscriptions.map(subscription => (
                  <StudentSubscriptionItem
                    key={subscription._id}
                    subscription={subscription}
                    exam={exam}
                    courseId={
                      typeof exam.course === 'string'
                        ? exam.course
                        : exam.course._id
                    }
                    onGradeClick={handleGradeClick}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={gradeDialog.open}
        onClose={() => setGradeDialog({ open: false, subscription: null })}
        maxWidth="lg"
      >
        <DialogContent>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Grade Exam</h2>
            {gradeDialog.subscription && (
              <p className="text-sm text-muted-foreground mt-1">
                Grade exam for{' '}
                {typeof gradeDialog.subscription.student === 'string'
                  ? 'student'
                  : `${gradeDialog.subscription.student.firstName} ${gradeDialog.subscription.student.lastName}`}
              </p>
            )}
          </div>
          <div className="space-y-4">
            {studentPoints.length > 0 && (
              <div className="p-4 bg-muted rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Student Course Performance
                  </h3>
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
                  >
                    {studentPointsPercentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Points</p>
                    <p className="font-semibold text-base">
                      {studentPointsSummary.totalPoints} /{' '}
                      {studentPointsSummary.totalMaxPoints}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assignments</p>
                    <p className="font-semibold text-base">
                      {studentPoints.length} completed
                    </p>
                  </div>
                </div>
                {studentPoints.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Recent assignments:
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {studentPoints.slice(0, 5).map((point: Point) => (
                        <div
                          key={point._id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="truncate flex-1">{point.title}</span>
                          <span className="ml-2 font-medium">
                            {point.points}/{point.maxPoints}
                          </span>
                        </div>
                      ))}
                      {studentPoints.length > 5 && (
                        <p className="text-xs text-muted-foreground italic">
                          +{studentPoints.length - 5} more assignments
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {studentPoints.length === 0 && (
              <div className="p-3 bg-muted rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  No course points recorded for this student yet.
                </p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <FormField label="Exam Points" required>
                <Input
                  type="number"
                  min="0"
                  max={exam?.maxPoints || 100}
                  value={points}
                  onChange={e => setPoints(parseInt(e.target.value) || 0)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Passing: {exam?.passingPoints || 0} points
                </p>
              </FormField>
            </div>

            {points >= (exam?.passingPoints || 0) && (
              <FormField label="Grade (6-10)" required>
                <Input
                  type="number"
                  min="6"
                  max="10"
                  value={grade}
                  onChange={e => setGrade(parseInt(e.target.value) || 6)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Passing grade must be between 6 and 10
                </p>
              </FormField>
            )}

            {points < (exam?.passingPoints || 0) && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Grade: 5 (Failed)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Student did not meet passing requirements
                </p>
              </div>
            )}

            <FormField label="Comment">
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Optional comment..."
                rows={3}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setGradeDialog({ open: false, subscription: null })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleGradeSubmit}
              disabled={gradeMutation.isPending}
            >
              {gradeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Grading...
                </>
              ) : (
                'Submit Grade'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
