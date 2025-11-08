import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  UserRound,
  BookOpen,
  Calendar,
  Edit,
  DollarSign,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { enrollmentsApi } from '../../lib/api/enrollments';
import { getErrorMessage } from '../../lib/utils';
import type { Payment } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
  Dialog,
  DialogContent,
  DialogFooter,
  FormField,
  Input,
} from '../../components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const paymentFormSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

export function EnrollmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const {
    data: enrollment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => enrollmentsApi.getById(id!),
    enabled: !!id,
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: (data: PaymentFormData) => {
      return enrollmentsApi.addPayment(id!, {
        amount: data.amount,
        date: data.date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', id] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Payment added successfully');
      setPaymentDialogOpen(false);
      paymentForm.reset();
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to add payment'));
    },
  });

  const handleAddPayment = async (data: PaymentFormData) => {
    await addPaymentMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Enrollment not found</p>
            <p className="text-sm">
              The enrollment you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/enrollments')}>
          Back to Enrollments
        </Button>
      </div>
    );
  }

  const getStudentName = () => {
    if (typeof enrollment.student === 'string') {
      return 'Unknown Student';
    }
    return `${enrollment.student.firstName} ${enrollment.student.lastName}`;
  };

  const getStudentEmail = () => {
    if (typeof enrollment.student === 'string') {
      return '';
    }
    return enrollment.student.email;
  };

  const getCourseName = () => {
    if (typeof enrollment.course === 'string') {
      return 'Unknown Course';
    }
    return enrollment.course.name || 'Unknown Course';
  };

  const getCoursePrice = () => {
    if (typeof enrollment.course === 'string') {
      return 0;
    }
    return enrollment.course.price || 0;
  };

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

  const getTotalPaid = () => {
    if (!enrollment.payments || !Array.isArray(enrollment.payments)) {
      return 0;
    }
    return enrollment.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getPendingPayments = () => {
    if (!enrollment.payments || !Array.isArray(enrollment.payments)) {
      return 0;
    }
    return enrollment.payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const totalPaid = getTotalPaid();
  const pendingPayments = getPendingPayments();
  const coursePrice = getCoursePrice();
  const remaining = coursePrice - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/admin/enrollments')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Enrollment Details
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {getStudentName()} - {getCourseName()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/app/admin/enrollments/${enrollment._id}/edit`)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Enrollment
          </Button>
        </div>
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
                Student
              </p>
              <p className="text-base font-semibold mt-1">{getStudentName()}</p>
              {getStudentEmail() && (
                <p className="text-sm text-muted-foreground mt-1">
                  {getStudentEmail()}
                </p>
              )}
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
              <p className="text-base font-semibold mt-1">{getCourseName()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                  {enrollment.status.charAt(0).toUpperCase() +
                    enrollment.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Information
            </CardTitle>
            {coursePrice > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course Price
              </p>
              <p className="text-2xl font-bold mt-1">
                ${coursePrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Paid
              </p>
              <p className="text-2xl font-bold text-success mt-1">
                ${totalPaid.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-bold text-warning mt-1">
                ${pendingPayments.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Remaining
              </p>
              <p className="text-2xl font-bold mt-1">${remaining.toFixed(2)}</p>
            </div>
          </div>

          {enrollment.payments && enrollment.payments.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Payment History
              </p>
              <div className="space-y-2">
                {enrollment.payments.map((payment: Payment, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        payment.status === 'paid' ? 'success' : 'warning'
                      }
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Enrollment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Enrollment ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">
                {enrollment._id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tenant ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">
                {enrollment.tenant}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base mt-1">
                {new Date(enrollment.createdAt).toLocaleString()}
              </p>
            </div>
            {enrollment.createdBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {enrollment.createdBy}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={paymentDialogOpen}
        onClose={() => {
          if (!addPaymentMutation.isPending) {
            setPaymentDialogOpen(false);
            paymentForm.reset();
          }
        }}
        title="Add Payment"
        description="Record a payment for this enrollment."
        maxWidth="md"
      >
        <DialogContent>
          <form
            onSubmit={paymentForm.handleSubmit(handleAddPayment)}
            className="space-y-4"
          >
            <FormField
              label="Amount"
              required
              error={paymentForm.formState.errors.amount?.message}
            >
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                disabled={addPaymentMutation.isPending}
                error={paymentForm.formState.errors.amount?.message}
                icon={<DollarSign className="h-4 w-4" />}
                {...paymentForm.register('amount', {
                  valueAsNumber: true,
                })}
              />
            </FormField>

            <FormField
              label="Date"
              error={paymentForm.formState.errors.date?.message}
            >
              <Input
                type="date"
                disabled={addPaymentMutation.isPending}
                error={paymentForm.formState.errors.date?.message}
                {...paymentForm.register('date')}
              />
            </FormField>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPaymentDialogOpen(false);
                  paymentForm.reset();
                }}
                disabled={addPaymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addPaymentMutation.isPending}
                loading={addPaymentMutation.isPending}
              >
                Add Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
