import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { enrollmentsApi } from '../../lib/api/enrollments';
import { getErrorMessage } from '../../lib/utils';
import type { Enrollment, Payment } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Alert,
} from '../../components/ui';

export function EnrollmentPaymentApproval() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', 'all'],
    queryFn: () => enrollmentsApi.list({}),
  });

  const enrollmentsWithPendingPayments = enrollments.filter(enrollment => {
    return (
      enrollment.payments &&
      enrollment.payments.some(
        (payment: Payment) => payment.status === 'pending'
      )
    );
  });

  const filteredEnrollments = searchQuery
    ? enrollmentsWithPendingPayments.filter(enrollment => {
        const student =
          typeof enrollment.student === 'object' ? enrollment.student : null;
        const course =
          typeof enrollment.course === 'object' ? enrollment.course : null;

        if (!student && !course) return false;

        const studentName = student
          ? `${student.firstName} ${student.lastName}`.toLowerCase()
          : '';
        const studentEmail = student ? student.email.toLowerCase() : '';
        const courseName = course ? course.name.toLowerCase() : '';
        const search = searchQuery.toLowerCase();

        return (
          studentName.includes(search) ||
          studentEmail.includes(search) ||
          courseName.includes(search)
        );
      })
    : enrollmentsWithPendingPayments;

  const updatePaymentMutation = useMutation({
    mutationFn: async ({
      enrollmentId,
      paymentIndex,
      status,
    }: {
      enrollmentId: string;
      paymentIndex: number;
      status: 'paid' | 'pending';
    }) => {
      const enrollment = enrollments.find(e => e._id === enrollmentId);
      if (!enrollment) throw new Error('Enrollment not found');

      const updatedPayments = [...enrollment.payments];
      updatedPayments[paymentIndex] = {
        ...updatedPayments[paymentIndex],
        status,
      };

      return enrollmentsApi.update(enrollmentId, {
        payments: updatedPayments,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Payment status updated successfully');
    },
    onError: error => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to update payment status'
      );
      toast.error(errorMessage);
    },
  });

  const handleApprovePayment = async (
    enrollmentId: string,
    paymentIndex: number
  ) => {
    await updatePaymentMutation.mutateAsync({
      enrollmentId,
      paymentIndex,
      status: 'paid',
    });
  };

  const getStudentName = (enrollment: Enrollment) => {
    if (typeof enrollment.student === 'string') {
      return 'Unknown Student';
    }
    return `${enrollment.student.firstName} ${enrollment.student.lastName}`;
  };

  const getStudentEmail = (enrollment: Enrollment) => {
    if (typeof enrollment.student === 'string') {
      return '';
    }
    return enrollment.student.email;
  };

  const getCourseName = (enrollment: Enrollment) => {
    if (typeof enrollment.course === 'string') {
      return 'Unknown Course';
    }
    return enrollment.course.name || 'Unknown Course';
  };

  const getCoursePrice = (enrollment: Enrollment) => {
    if (typeof enrollment.course === 'string') {
      return 0;
    }
    return enrollment.course.price || 0;
  };

  const getPendingPayments = (enrollment: Enrollment) => {
    if (!enrollment.payments) return [];
    return enrollment.payments.filter(
      (payment: Payment) => payment.status === 'pending'
    );
  };

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
          <h1 className="text-2xl md:text-3xl font-bold">Payment Approval</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Review and approve pending enrollment payments
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, or course..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredEnrollments.length === 0 ? (
            <Alert>
              <div className="space-y-1">
                <p className="font-medium">No pending payments</p>
                <p className="text-sm">
                  {searchQuery
                    ? 'No enrollments with pending payments match your search.'
                    : 'All payments have been processed.'}
                </p>
              </div>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredEnrollments.map(enrollment => {
                const pendingPayments = getPendingPayments(enrollment);
                const coursePrice = getCoursePrice(enrollment);

                return (
                  <Card key={enrollment._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {getStudentName(enrollment)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getStudentEmail(enrollment)}
                          </p>
                          <p className="text-sm font-medium mt-2">
                            {getCourseName(enrollment)}
                          </p>
                          {coursePrice > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Course Price: ${coursePrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/app/admin/enrollments/${enrollment._id}`)
                          }
                        >
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pendingPayments.map(
                          (payment: Payment, index: number) => {
                            const paymentIndex = enrollment.payments.findIndex(
                              (p: Payment) =>
                                p.amount === payment.amount &&
                                p.date === payment.date &&
                                p.status === 'pending'
                            );

                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-semibold">
                                      ${payment.amount.toFixed(2)}
                                    </p>
                                    <Badge variant="warning">Pending</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Submitted:{' '}
                                    {format(
                                      new Date(payment.date),
                                      'MMM dd, yyyy'
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApprovePayment(
                                        enrollment._id,
                                        paymentIndex
                                      )
                                    }
                                    disabled={updatePaymentMutation.isPending}
                                    loading={
                                      updatePaymentMutation.isPending &&
                                      updatePaymentMutation.variables
                                        ?.enrollmentId === enrollment._id
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
