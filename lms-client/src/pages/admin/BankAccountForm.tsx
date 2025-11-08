import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Building2, CreditCard, Globe } from 'lucide-react';

import type { BankAccount } from '../../types';
import {
  Input,
  FormField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Alert,
} from '../../components/ui';

const bankAccountFormSchema = z.object({
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  bankName: z.string().optional(),
  iban: z.string().min(1, 'IBAN is required'),
  swiftCode: z.string().optional(),
  currency: z.enum(['EUR', 'USD', 'GBP', 'RSD', 'CHF', 'JPY', 'AUD', 'CAD']),
  isPrimary: z.boolean().optional(),
});

export type BankAccountFormData = z.infer<typeof bankAccountFormSchema>;

interface BankAccountFormProps {
  isSubmitting?: boolean;
  error?: string | null;
  register: ReturnType<typeof useForm<BankAccountFormData>>['register'];
  control: ReturnType<typeof useForm<BankAccountFormData>>['control'];
  errors: ReturnType<
    typeof useForm<BankAccountFormData>
  >['formState']['errors'];
}

export function BankAccountForm({
  isSubmitting = false,
  error,
  register,
  control,
  errors,
}: BankAccountFormProps) {
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="space-y-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
      )}

      <FormField
        label="Account Holder Name"
        required
        error={errors.accountHolderName?.message}
      >
        <Input
          placeholder="John Doe"
          disabled={isSubmitting}
          error={errors.accountHolderName?.message}
          icon={<CreditCard className="h-4 w-4" />}
          {...register('accountHolderName')}
        />
      </FormField>

      <FormField label="Bank Name" error={errors.bankName?.message}>
        <Input
          placeholder="Bank name (optional)"
          disabled={isSubmitting}
          error={errors.bankName?.message}
          icon={<Building2 className="h-4 w-4" />}
          {...register('bankName')}
        />
      </FormField>

      <FormField label="IBAN" required error={errors.iban?.message}>
        <Input
          placeholder="GB82 WEST 1234 5698 7654 32"
          disabled={isSubmitting}
          error={errors.iban?.message}
          icon={<CreditCard className="h-4 w-4" />}
          {...register('iban')}
        />
      </FormField>

      <FormField label="SWIFT Code" error={errors.swiftCode?.message}>
        <Input
          placeholder="SWIFT code (optional)"
          disabled={isSubmitting}
          error={errors.swiftCode?.message}
          icon={<Globe className="h-4 w-4" />}
          {...register('swiftCode')}
        />
      </FormField>

      <FormField label="Currency" required error={errors.currency?.message}>
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <SelectTrigger error={!!errors.currency}>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="RSD">RSD - Serbian Dinar</SelectItem>
                <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField
        label="Primary Account"
        error={errors.isPrimary?.message}
        helperText="Mark this account as the primary account for the tenant"
      >
        <Controller
          name="isPrimary"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={field.value || false}
                onChange={e => field.onChange(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="isPrimary"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Set as primary account
              </label>
            </div>
          )}
        />
      </FormField>
    </div>
  );
}

export function useBankAccountForm(bankAccount?: BankAccount) {
  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: {
      accountHolderName: bankAccount?.accountHolderName || '',
      bankName: bankAccount?.bankName || '',
      iban: bankAccount?.iban || '',
      swiftCode: bankAccount?.swiftCode || '',
      currency: bankAccount?.currency || 'EUR',
      isPrimary: bankAccount?.isPrimary ?? false,
    },
  });

  return form;
}
