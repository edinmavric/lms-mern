import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

import { examSubscriptionsApi } from '../../lib/api/examSubscriptions';
import { examsApi } from '../../lib/api/exams';
import { usersApi } from '../../lib/api/users';
import type { ExamSubscription } from '../../types';
import {
  Card,
  CardContent,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
} from '../../components/ui';

export function ExamSubscriptionsList() {
  const navigate = useNavigate();
  const [searchStudent, setSearchStudent] = useState('');
  const [filterExam, setFilterExam] = useState<string>('__all__');
  const [filterStatus, setFilterStatus] = useState<string>('__all__');

  const { data: exams = [] } = useQuery({
    queryKey: ['exams', 'all'],
    queryFn: () => examsApi.list({}),
  });

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: [
      'examSubscriptions',
      'all',
      {
        exam: filterExam !== '__all__' ? filterExam : undefined,
        status: filterStatus !== '__all__' ? filterStatus : undefined,
      },
    ],
    queryFn: () =>
      examSubscriptionsApi.list({
        exam: filterExam !== '__all__' ? filterExam : undefined,
        status:
          filterStatus !== '__all__'
            ? (filterStatus as 'subscribed' | 'graded' | 'passed' | 'failed')
            : undefined,
      }),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const filteredSubscriptions = searchStudent
    ? subscriptions.filter(subscription => {
        const studentName =
          typeof subscription.student === 'string'
            ? ''
            : `${subscription.student.firstName} ${subscription.student.lastName}`;
        return studentName.toLowerCase().includes(searchStudent.toLowerCase());
      })
    : subscriptions;

  const getStudentName = (subscription: ExamSubscription) => {
    if (typeof subscription.student === 'string') {
      const student = students.find(s => s._id === subscription.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    return `${subscription.student.firstName} ${subscription.student.lastName}`;
  };

  const getExamTitle = (subscription: ExamSubscription) => {
    if (typeof subscription.exam === 'string') {
      const exam = exams.find(e => e._id === subscription.exam);
      return exam?.title || 'Unknown Exam';
    }
    return subscription.exam.title;
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

  const subscribedCount = subscriptions.filter(
    s => s.status === 'subscribed'
  ).length;
  const passedCount = subscriptions.filter(s => s.status === 'passed').length;
  const failedCount = subscriptions.filter(s => s.status === 'failed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Exam Subscriptions</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View all exam subscriptions across all exams
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Subscriptions
                </p>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subscribed
                </p>
                <p className="text-2xl font-bold">{subscribedCount}</p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <Clock className="h-5 w-5 text-warning" />
              </div>
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
              <div className="rounded-full bg-success/10 p-3">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
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
              <div className="rounded-full bg-destructive/10 p-3">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by student name..."
            value={searchStudent}
            onChange={e => setSearchStudent(e.target.value)}
          />
        </div>
        <Select value={filterExam} onValueChange={setFilterExam}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Exams</SelectItem>
            {exams.map(exam => (
              <SelectItem key={exam._id} value={exam._id}>
                {exam.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSubscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchStudent ||
              filterExam !== '__all__' ||
              filterStatus !== '__all__'
                ? 'No subscriptions found'
                : 'No exam subscriptions yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchStudent ||
              filterExam !== '__all__' ||
              filterStatus !== '__all__'
                ? 'Try adjusting your search criteria'
                : 'Students will appear here when they subscribe to exams'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubscriptions.map(subscription => {
            const studentName = getStudentName(subscription);
            const examTitle = getExamTitle(subscription);
            const exam =
              typeof subscription.exam === 'string'
                ? exams.find(e => e._id === subscription.exam)
                : subscription.exam;

            return (
              <Card
                key={subscription._id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  navigate(`/app/admin/exam-subscriptions/${subscription._id}`);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base">{examTitle}</h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{studentName}</span>
                        </div>
                        {subscription.points !== undefined && exam && (
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            <span>
                              {subscription.points} / {exam.maxPoints} points
                            </span>
                          </div>
                        )}
                        {subscription.grade && (
                          <div className="flex items-center gap-1">
                            <span>Grade: {subscription.grade}</span>
                          </div>
                        )}
                        {subscription.gradedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Graded:{' '}
                              {format(
                                new Date(subscription.gradedAt),
                                'MMM dd, yyyy'
                              )}
                            </span>
                          </div>
                        )}
                        {subscription.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Subscribed:{' '}
                              {format(
                                new Date(subscription.createdAt),
                                'MMM dd, yyyy'
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      {subscription.comment && (
                        <p className="text-sm text-muted-foreground">
                          {subscription.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
