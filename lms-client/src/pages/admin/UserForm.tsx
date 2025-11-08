import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, UserRound, Lock, AlertCircle } from 'lucide-react';

import type { User } from '../../types';
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

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be at most 128 characters long')
  .regex(/[A-Z]/, 'Must include at least one uppercase letter')
  .regex(/[a-z]/, 'Must include at least one lowercase letter')
  .regex(/[0-9]/, 'Must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must include at least one special character')
  .optional()
  .or(z.literal(''));

const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'professor', 'student']),
  status: z.enum(['active', 'pending', 'disabled']),
  password: passwordSchema,
});

export type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User;
  isSubmitting?: boolean;
  error?: string | null;
  register: ReturnType<typeof useForm<UserFormData>>['register'];
  control: ReturnType<typeof useForm<UserFormData>>['control'];
  errors: ReturnType<typeof useForm<UserFormData>>['formState']['errors'];
}

export function UserForm({
  user,
  isSubmitting = false,
  error,
  register,
  control,
  errors,
}: UserFormProps) {
  const isEditing = !!user;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="animate-slide-down">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2 space-y-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="First name"
          required
          error={errors.firstName?.message}
        >
          <Input
            placeholder="John"
            icon={<UserRound className="h-5 w-5" />}
            disabled={isSubmitting}
            {...register('firstName')}
          />
        </FormField>

        <FormField
          label="Last name"
          required
          error={errors.lastName?.message}
        >
          <Input
            placeholder="Doe"
            icon={<UserRound className="h-5 w-5" />}
            disabled={isSubmitting}
            {...register('lastName')}
          />
        </FormField>
      </div>

      <FormField label="Email address" required error={errors.email?.message}>
        <Input
          type="email"
          placeholder="john.doe@example.com"
          icon={<Mail className="h-5 w-5" />}
          disabled={isSubmitting || isEditing}
          {...register('email')}
        />
        {isEditing && (
          <p className="text-xs text-muted-foreground mt-1">
            Email cannot be changed after user creation
          </p>
        )}
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Role" required error={errors.role?.message}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger error={!!errors.role}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="Status" required error={errors.status?.message}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger error={!!errors.status}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField
        label={isEditing ? 'New password (optional)' : 'Password'}
        required={!isEditing}
        error={errors.password?.message}
        helperText={
          isEditing
            ? 'Leave blank to keep the current password'
            : 'Must include uppercase, lowercase, number, and special character'
        }
      >
        <Input
          type="password"
          placeholder={isEditing ? 'Enter new password' : 'Enter password'}
          icon={<Lock className="h-5 w-5" />}
          disabled={isSubmitting}
          {...register('password')}
        />
      </FormField>

      {!isEditing && (
        <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
          Passwords must include at least one uppercase letter, one lowercase
          letter, one number, and one special character.
        </div>
      )}
    </div>
  );
}

export function useUserForm(user?: User) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || 'student',
      status: user?.status || 'active',
      password: '',
    },
  });

  return form;
}

