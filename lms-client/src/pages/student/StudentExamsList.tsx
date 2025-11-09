import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Calendar,
  Clock,
  Loader2,
  BookOpen,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { examsApi } from '../../lib/api/exams';
import { examSubscriptionsApi } from '../../lib/api/examSubscriptions';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { getErrorMessage } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import type { Exam, ExamSubscription } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
} from '../../components/ui';

export function StudentExamsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTitle, setSearchTitle] = useState('');

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => enrollmentsApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const { data: allExams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['exams', 'all'],
    queryFn: () => examsApi.list({ isActive: true }),
  });

  const { data: mySubscriptions = [], isLoading: subscriptionsLoading } =
    useQuery({
      queryKey: ['examSubscriptions', 'my'],
      queryFn: () => examSubscriptionsApi.list({ student: user?._id }),
      enabled: !!user?._id,
    });

  const enrolledCourseIds = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return [];
    return enrollments
      .filter(e => e && e.status !== 'cancelled')
      .map(e => {
        if (!e.course) return null;
        return typeof e.course === 'string' ? e.course : e.course._id;
      })
      .filter((id): id is string => id !== null);
  }, [enrollments]);

  const availableExams = useMemo(() => {
    if (!allExams || !Array.isArray(allExams)) return [];
    return allExams.filter(exam => {
      const examCourseId =
        typeof exam.course === 'string' ? exam.course : exam.course._id;
      return enrolledCourseIds.includes(examCourseId);
    });
  }, [allExams, enrolledCourseIds]);

  const { upcomingExams, pastExams, subscribedExams } = useMemo(() => {
    const now = new Date();
    const upcoming: Exam[] = [];
    const past: Exam[] = [];
    const subscribed: Exam[] = [];

    availableExams.forEach(exam => {
      const examDate = new Date(exam.date);
      const isSubscribed = mySubscriptions.some(
        sub =>
          (typeof sub.exam === 'string' ? sub.exam : sub.exam._id) === exam._id
      );

      const isAutoSubscribed = exam.type === 'preliminary';

      if (isSubscribed || isAutoSubscribed) {
        subscribed.push(exam);
      } else if (examDate >= now) {
        upcoming.push(exam);
      } else {
        past.push(exam);
      }
    });

    upcoming.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    past.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    subscribed.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return {
      upcomingExams: upcoming,
      pastExams: past,
      subscribedExams: subscribed,
    };
  }, [availableExams, mySubscriptions]);

  const filteredUpcoming = searchTitle
    ? upcomingExams.filter(exam =>
        exam.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
    : upcomingExams;

  const filteredPast = searchTitle
    ? pastExams.filter(exam =>
        exam.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
    : pastExams;

  const filteredSubscribed = searchTitle
    ? subscribedExams.filter(exam =>
        exam.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
    : subscribedExams;

  const subscribeMutation = useMutation({
    mutationFn: (examId: string) => examSubscriptionsApi.subscribe(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Successfully subscribed to exam');
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to subscribe to exam'));
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (subscriptionId: string) =>
      examSubscriptionsApi.unsubscribe(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Successfully unsubscribed from exam');
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to unsubscribe from exam'));
    },
  });

  const getCourseName = (exam: Exam) => {
    if (typeof exam.course === 'string') return 'Unknown Course';
    return exam.course.name;
  };

  const getSubscription = (exam: Exam): ExamSubscription | null => {
    return (
      mySubscriptions.find(
        sub =>
          (typeof sub.exam === 'string' ? sub.exam : sub.exam._id) === exam._id
      ) || null
    );
  };

  const canSubscribe = (exam: Exam) => {
    if (exam.type === 'preliminary') {
      return false;
    }
    const deadline = new Date(exam.subscriptionDeadline);
    return new Date() < deadline;
  };

  const isLoading = examsLoading || subscriptionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Exams</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View and subscribe to exams for your courses
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search exams..."
            icon={<Search className="h-4 w-4" />}
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
          />
        </div>
      </div>

      {filteredSubscribed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Subscribed Exams ({filteredSubscribed.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSubscribed.map(exam => {
                const subscription = getSubscription(exam);
                const examDate = new Date(exam.date);
                const isGraded =
                  subscription?.status === 'passed' ||
                  subscription?.status === 'failed';
                const isPreliminary = exam.type === 'preliminary';

                return (
                  <div
                    key={exam._id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base">
                            {exam.title}
                          </h3>
                          <Badge
                            variant={isPreliminary ? 'default' : 'outline'}
                          >
                            {isPreliminary ? 'Preliminary' : 'Finishing'}
                          </Badge>
                          {isGraded && subscription?.status === 'passed' && (
                            <Badge variant="success">Passed</Badge>
                          )}
                          {isGraded && subscription?.status === 'failed' && (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                          {!isGraded && (
                            <Badge variant="outline">
                              {isPreliminary ? 'Auto-Subscribed' : 'Subscribed'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{getCourseName(exam)}</span>
                        </div>
                        {exam.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {exam.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(examDate, 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          {exam.location && (
                            <span>Location: {exam.location}</span>
                          )}
                          <div className="flex items-center gap-1">
                            <span>
                              {exam.passingPoints}/{exam.maxPoints} to pass
                            </span>
                          </div>
                        </div>
                        {isGraded && subscription && (
                          <div className="mt-2">
                            {subscription.points !== undefined && (
                              <p className="text-sm">
                                Points: {subscription.points}/{exam.maxPoints}
                              </p>
                            )}
                            {subscription.grade && (
                              <p className="text-sm font-semibold">
                                Grade: {subscription.grade}
                              </p>
                            )}
                            {subscription.comment && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {subscription.comment}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {!isGraded &&
                        !isPreliminary &&
                        subscription &&
                        canSubscribe(exam) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (subscription) {
                                unsubscribeMutation.mutate(subscription._id);
                              }
                            }}
                          >
                            Unsubscribe
                          </Button>
                        )}
                      {isPreliminary && (
                        <Badge variant="outline" className="text-xs">
                          Auto-subscribed
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredUpcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Available Exams ({filteredUpcoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUpcoming.map(exam => {
                const examDate = new Date(exam.date);
                const deadline = new Date(exam.subscriptionDeadline);
                const canSub = canSubscribe(exam);
                const isPreliminary = exam.type === 'preliminary';

                return (
                  <div
                    key={exam._id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base">
                            {exam.title}
                          </h3>
                          <Badge
                            variant={isPreliminary ? 'default' : 'outline'}
                          >
                            {isPreliminary ? 'Preliminary' : 'Finishing'}
                          </Badge>
                          {!canSub && !isPreliminary && (
                            <Badge variant="warning">Subscription Closed</Badge>
                          )}
                          {isPreliminary && (
                            <Badge variant="outline">Auto-subscribed</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{getCourseName(exam)}</span>
                        </div>
                        {exam.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {exam.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(examDate, 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          {exam.location && (
                            <span>Location: {exam.location}</span>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Deadline: {format(deadline, 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>
                              {exam.passingPoints}/{exam.maxPoints} to pass
                            </span>
                          </div>
                        </div>
                      </div>
                      {canSub && !isPreliminary && (
                        <Button
                          size="sm"
                          onClick={() => subscribeMutation.mutate(exam._id)}
                          disabled={subscribeMutation.isPending}
                        >
                          Subscribe
                        </Button>
                      )}
                      {isPreliminary && (
                        <Badge variant="outline" className="text-xs">
                          Auto-subscribed
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Past Exams ({filteredPast.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPast.map(exam => {
                const examDate = new Date(exam.date);
                const subscription = getSubscription(exam);
                const isGraded =
                  subscription?.status === 'passed' ||
                  subscription?.status === 'failed';
                const isPreliminary = exam.type === 'preliminary';

                return (
                  <div
                    key={exam._id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base">
                            {exam.title}
                          </h3>
                          <Badge
                            variant={isPreliminary ? 'default' : 'outline'}
                          >
                            {isPreliminary ? 'Preliminary' : 'Finishing'}
                          </Badge>
                          {isGraded && subscription?.status === 'passed' && (
                            <Badge variant="success">Passed</Badge>
                          )}
                          {isGraded && subscription?.status === 'failed' && (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                          {!subscription && !isPreliminary && (
                            <Badge variant="secondary">Not Taken</Badge>
                          )}
                          {isPreliminary && !isGraded && (
                            <Badge variant="outline">Auto-subscribed</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{getCourseName(exam)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(examDate, 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                        </div>
                        {isGraded && subscription && (
                          <div className="mt-2">
                            {subscription.points !== undefined && (
                              <p className="text-sm">
                                Points: {subscription.points}/{exam.maxPoints}
                              </p>
                            )}
                            {subscription.grade && (
                              <p className="text-sm font-semibold">
                                Grade: {subscription.grade}
                              </p>
                            )}
                            {subscription.comment && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {subscription.comment}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredSubscribed.length === 0 &&
        filteredUpcoming.length === 0 &&
        filteredPast.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Exams Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTitle
                  ? 'No exams match your search criteria.'
                  : "You don't have any exams available. Enroll in a course to see exams."}
              </p>
              {!searchTitle && (
                <Button onClick={() => navigate('/app/student/courses')}>
                  Browse Courses
                </Button>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
