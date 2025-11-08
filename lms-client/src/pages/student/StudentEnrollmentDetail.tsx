import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Loader2,
  DollarSign,
  BookOpen,
  CreditCard,
  Building2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { enrollmentsApi } from '../../lib/api/enrollments';
import { bankAccountsApi } from '../../lib/api/bankAccounts';
import { getErrorMessage } from '../../lib/utils';
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

const paymentFormSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .min(0.01, 'Amount must be at least $0.01'),
  date: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

export function StudentEnrollmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    data: enrollment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => enrollmentsApi.getById(id!),
    enabled: !!id,
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts', 'primary'],
    queryFn: () => bankAccountsApi.list({ isPrimary: true }),
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
      toast.success('Payment request submitted successfully');
      setPaymentDialogOpen(false);
      paymentForm.reset();
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to submit payment request'));
    },
  });

  const handleAddPayment = async (data: PaymentFormData) => {
    await addPaymentMutation.mutateAsync(data);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
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
        <Button onClick={() => navigate('/app/student/enrollments')}>
          Back to Enrollments
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof enrollment.course === 'string') return 'Unknown Course';
    return enrollment.course.name;
  };

  const getCoursePrice = () => {
    if (typeof enrollment.course === 'string') return 0;
    return enrollment.course.price || 0;
  };

  const coursePrice = getCoursePrice();
  const totalPaid = enrollment.payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );
  const pendingPayments = enrollment.payments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const paidPayments = enrollment.payments
    .filter(p => p.status === 'paid')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const remaining = Math.max(0, coursePrice - totalPaid);

  const primaryBankAccount =
    bankAccounts.find(acc => acc.isPrimary) || bankAccounts[0];

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

  // Set default payment amount to remaining balance
  const updateDefaultAmount = () => {
    if (remaining > 0) {
      paymentForm.setValue('amount', remaining);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/student/enrollments')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {getCourseName()}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Enrollment Details & Payment
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(enrollment.status)}>
          {enrollment.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
                Course Name
              </p>
              <p className="text-base font-semibold mt-1">{getCourseName()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Enrollment Date
              </p>
              <p className="text-base mt-1">
                {new Date(enrollment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                  {enrollment.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Information
              </CardTitle>
              {remaining > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateDefaultAmount();
                    setPaymentDialogOpen(true);
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Submit Payment
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                  ${paidPayments.toFixed(2)}
                </p>
              </div>
              {pendingPayments > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-warning mt-1">
                    ${pendingPayments.toFixed(2)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Remaining
                </p>
                <p className="text-2xl font-bold mt-1">
                  ${remaining.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {primaryBankAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                <p className="text-sm font-medium">
                  Please transfer payment to the following bank account
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  After making the transfer, submit a payment request below with
                  the amount you paid
                </p>
              </div>
            </Alert>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Account Holder
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base font-semibold">
                    {primaryBankAccount.accountHolderName}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() =>
                      copyToClipboard(
                        primaryBankAccount.accountHolderName,
                        'holder'
                      )
                    }
                  >
                    {copiedField === 'holder' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {primaryBankAccount.bankName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Bank Name
                  </p>
                  <p className="text-base mt-1">
                    {primaryBankAccount.bankName}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  IBAN
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base font-mono font-semibold">
                    {primaryBankAccount.iban}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() =>
                      copyToClipboard(primaryBankAccount.iban, 'iban')
                    }
                  >
                    {copiedField === 'iban' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {primaryBankAccount.swiftCode && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    SWIFT Code
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-mono font-semibold">
                      {primaryBankAccount.swiftCode}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        copyToClipboard(primaryBankAccount.swiftCode!, 'swift')
                      }
                    >
                      {copiedField === 'swift' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Currency
                </p>
                <p className="text-base mt-1">{primaryBankAccount.currency}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {enrollment.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollment.payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-border rounded-lg p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-base">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          payment.status === 'paid' ? 'success' : 'warning'
                        }
                      >
                        {payment.status}
                      </Badge>  
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={paymentDialogOpen}
        onClose={() => {
          if (!addPaymentMutation.isPending) {
            setPaymentDialogOpen(false);
            paymentForm.reset();
          }
        }}
        title="Submit Payment Request"
        description="Please make sure you have transferred the payment to the bank account shown above before submitting this request."
        maxWidth="md"
      >
        <DialogContent>
          <form
            onSubmit={paymentForm.handleSubmit(handleAddPayment)}
            className="space-y-4"
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                <p className="text-sm">
                  Your payment request will be pending until verified by an
                  administrator.
                </p>
              </div>
            </Alert>

            <FormField
              label="Payment Amount"
              required
              error={paymentForm.formState.errors.amount?.message}
            >
              <div className="space-y-1">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remaining}
                  placeholder="0.00"
                  disabled={addPaymentMutation.isPending}
                  error={paymentForm.formState.errors.amount?.message}
                  icon={<DollarSign className="h-4 w-4" />}
                  {...paymentForm.register('amount', {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Remaining balance: ${remaining.toFixed(2)}
                </p>
              </div>
            </FormField>

            <FormField
              label="Payment Date"
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
                Submit Payment Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
