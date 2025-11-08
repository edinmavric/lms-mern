import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { bankAccountsApi } from '../../lib/api/bankAccounts';
import { getErrorMessage } from '../../lib/utils';
import {
  BankAccountForm,
  useBankAccountForm,
  type BankAccountFormData,
} from './BankAccountForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
} from '../../components/ui';

export function BankAccountEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: bankAccount, isLoading } = useQuery({
    queryKey: ['bankAccount', id],
    queryFn: () => bankAccountsApi.getById(id!),
    enabled: !!id,
  });

  const form = useBankAccountForm(bankAccount);

  useEffect(() => {
    if (bankAccount) {
      form.reset({
        accountHolderName: bankAccount.accountHolderName || '',
        bankName: bankAccount.bankName || '',
        iban: bankAccount.iban || '',
        swiftCode: bankAccount.swiftCode || '',
        currency: bankAccount.currency || 'EUR',
        isPrimary: bankAccount.isPrimary ?? false,
      });
    }
  }, [bankAccount, form]);

  const updateMutation = useMutation({
    mutationFn: (data: BankAccountFormData) => {
      const updateData = {
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        iban: data.iban,
        swiftCode: data.swiftCode,
        currency: data.currency,
        isPrimary: data.isPrimary,
      };
      return bankAccountsApi.update(id!, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccount', id] });
      toast.success('Bank account updated successfully');
      navigate(`/app/admin/bank-accounts/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to update bank account'
      );
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: BankAccountFormData) => {
    setError(null);
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bankAccount) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Bank account not found</p>
            <p className="text-sm">
              The bank account you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/bank-accounts')}>
          Back to Bank Accounts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/app/admin/bank-accounts/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Bank Account</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update bank account information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account Details</CardTitle>
          <CardDescription>
            Update the bank account information. Setting an account as primary
            will unset all other primary accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <BankAccountForm
              isSubmitting={updateMutation.isPending}
              error={error}
              register={form.register}
              control={form.control}
              errors={form.formState.errors}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/admin/bank-accounts/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                loading={updateMutation.isPending}
              >
                {updateMutation.isPending
                  ? 'Updating...'
                  : 'Update Bank Account'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
