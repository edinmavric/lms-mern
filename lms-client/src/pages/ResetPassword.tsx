import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { authApi } from '../lib/api/auth';
import { getErrorMessage } from '../lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  FormField,
  Link,
  Alert,
} from '../components/ui';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be at most 128 characters long')
  .regex(/[A-Z]/, 'Must include at least one uppercase letter')
  .regex(/[a-z]/, 'Must include at least one lowercase letter')
  .regex(/[0-9]/, 'Must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must include at least one special character');

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const tenantIdParam = searchParams.get('tenantId');

    if (!tokenParam || !tenantIdParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
      setTenantId(tenantIdParam);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !tenantId) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    try {
      setError(null);

      await authApi.resetPassword({
        token,
        newPassword: data.password,
        tenantId,
      });

      setSuccess(true);
      toast.success('Password reset successful');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to reset password');
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
              <CardTitle className="text-2xl">
                Password reset successful
              </CardTitle>
              <CardDescription>
                Your password has been reset. You can now sign in with your new
                password.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="success">
                <div className="ml-2 space-y-1">
                  <p className="font-medium text-foreground">Success</p>
                  <p className="text-sm text-muted-foreground">
                    Your password has been successfully reset. Redirecting to
                    login...
                  </p>
                </div>
              </Alert>

              <Button className="w-full" onClick={() => navigate('/login')}>
                Go to login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token || !tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold">LMS++</h1>
            <p className="text-muted-foreground">Learning Management System</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Invalid reset link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <div className="ml-2 space-y-1">
                  <p className="font-medium">Link invalid</p>
                  <p className="text-sm">
                    The password reset link is missing required parameters or
                    has expired. Please request a new password reset.
                  </p>
                </div>
              </Alert>

              <div className="space-y-3">
                <Link to="/forgot-password">
                  <Button className="w-full">Request new reset link</Button>
                </Link>

                <p className="text-center text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <Link to="/login" variant="primary">
                    Sign in
                  </Link>
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
              Enter your new password below. Make sure it meets the security
              requirements.
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
                    <p className="font-medium">Reset failed</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </Alert>
              )}

              <FormField
                label="New password"
                required
                error={errors.password?.message}
              >
                <Input
                  type="password"
                  placeholder="Enter your new password"
                  icon={<Lock className="h-5 w-5" />}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register('password')}
                />
              </FormField>

              <FormField
                label="Confirm password"
                required
                error={errors.confirmPassword?.message}
              >
                <Input
                  type="password"
                  placeholder="Confirm your new password"
                  icon={<Lock className="h-5 w-5" />}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register('confirmPassword')}
                />
              </FormField>

              <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
                Passwords must include at least one uppercase letter, one
                lowercase letter, one number, and one special character.
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Resetting password…' : 'Reset password'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" variant="primary">
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
