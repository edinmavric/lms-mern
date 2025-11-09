import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

import { authApi } from '../lib/api/auth';
import { getErrorMessage } from '../lib/utils';
import { TenantSelector } from '../components/TenantSelector';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  FormField,
  Alert,
  Link,
} from '../components/ui';

const tenantSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().optional(),
  contactEmail: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  tenant: tenantSummarySchema.nullable(),
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      tenant: null,
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      setSuccess(false);

      await authApi.forgotPassword({
        email: data.email,
        tenantId: data.tenant!.id,
      });

      setSuccess(true);
      toast.success('Password reset email sent');
      reset({
        tenant: data.tenant,
        email: '',
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to send reset email');
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold">LMS++</h1>
            <p className="text-muted-foreground">Learning Management System</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We've sent you a password reset link if an account exists with
                that email.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="success">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Email sent</p>
                  <p className="text-sm text-muted-foreground">
                    If an account exists with the email you provided, you'll
                    receive a password reset link shortly. Please check your
                    inbox and spam folder.
                  </p>
                </div>
              </Alert>

              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full">Back to login</Button>
                </Link>

                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-primary hover:underline"
                  >
                    Try again
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">LMS++</h1>
          <p className="text-muted-foreground">Learning Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your organisation and email address. We'll send you a link
              to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {error && (
                <Alert
                  variant="destructive"
                  onClose={() => setError(null)}
                  className="animate-slide-down"
                >
                  <div className="ml-2 space-y-1">
                    <p className="font-medium">Request failed</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </Alert>
              )}

              <Controller
                name="tenant"
                control={control}
                rules={{ required: 'Please select an organisation' }}
                render={({ field }) => (
                  <TenantSelector
                    label="Organisation"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    required
                    error={errors.tenant?.message}
                    helperText="Search by organisation name or domain."
                  />
                )}
              />

              <FormField
                label="Email address"
                required
                error={errors.email?.message}
                helperText="Enter the email address associated with your account."
              >
                <Input
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="h-5 w-5" />}
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register('email')}
                />
              </FormField>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Sending reset link…' : 'Send reset link'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
