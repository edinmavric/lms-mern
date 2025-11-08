import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, BookOpen, Calendar, CreditCard } from 'lucide-react';

import { enrollmentsApi } from '../../lib/api/enrollments';
import { useAuthStore } from '../../store/authStore';
import type { Enrollment } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
  Alert,
} from '../../components/ui';

export function StudentEnrollmentsList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => enrollmentsApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'paused':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const getCourseName = (enrollment: Enrollment) => {
    if (typeof enrollment.course === 'string') return 'Unknown Course';
    return enrollment.course.name;
  };

  const getCoursePrice = (enrollment: Enrollment) => {
    if (typeof enrollment.course === 'string') return 0;
    return enrollment.course.price || 0;
  };

  const getTotalPaid = (enrollment: Enrollment) => {
    return enrollment.payments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );
  };

  const getRemainingBalance = (enrollment: Enrollment) => {
    const coursePrice = getCoursePrice(enrollment);
    const totalPaid = getTotalPaid(enrollment);
    return Math.max(0, coursePrice - totalPaid);
  };

  const hasPendingPayments = (enrollment: Enrollment) => {
    return enrollment.payments.some(p => p.status === 'pending');
  };

  const filteredEnrollments = searchName
    ? enrollments.filter(enrollment =>
        getCourseName(enrollment)
          .toLowerCase()
          .includes(searchName.toLowerCase())
      )
    : enrollments;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Enrollments</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          View and manage your course enrollments and payments
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by course name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchName
                ? 'No enrollments found'
                : 'You have no enrollments yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchName
                ? 'Try adjusting your search criteria'
                : 'Enroll in a course to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEnrollments.map(enrollment => {
            const courseName = getCourseName(enrollment);
            const coursePrice = getCoursePrice(enrollment);
            const totalPaid = getTotalPaid(enrollment);
            const remaining = getRemainingBalance(enrollment);
            const hasPending = hasPendingPayments(enrollment);

            return (
              <Card
                key={enrollment._id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() =>
                  navigate(`/app/student/enrollments/${enrollment._id}`)
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {courseName}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                      {enrollment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Course Price
                      </span>
                      <span className="font-semibold">
                        ${coursePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Paid</span>
                      <span className="font-semibold text-success">
                        ${totalPaid.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span
                        className={`font-semibold ${
                          remaining > 0 ? 'text-warning' : 'text-success'
                        }`}
                      >
                        ${remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {hasPending && (
                    <Alert variant="warning" className="py-2">
                      <p className="text-xs">
                        You have pending payment requests
                      </p>
                    </Alert>
                  )}

                  {remaining > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/app/student/enrollments/${enrollment._id}`);
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Make Payment
                    </Button>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Enrolled:{' '}
                        {new Date(enrollment.createdAt).toLocaleDateString()}
                      </span>
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
