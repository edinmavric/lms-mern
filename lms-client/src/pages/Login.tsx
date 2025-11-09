import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';

import { authApi } from '../lib/api/auth';
import { getErrorMessage } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
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
  Link,
  Alert,
} from '../components/ui';

const tenantSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().optional(),
  contactEmail: z.string().optional(),
});

const loginSchema = z.object({
  tenant: tenantSummarySchema.nullable(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore(state => state.setAuth);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenant: null,
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);

      const response = await authApi.login({
        email: data.email,
        password: data.password,
        tenantId: data.tenant?.id,
      });

      setAuth({
        user: response.user,
        tenant: response.tenant,
        accessToken: response.token,
        refreshToken: response.refreshToken,
      });

      toast.success('Welcome back!');

      const redirectTo =
        (location.state as { from?: Location })?.from?.pathname ?? '/app';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Invalid credentials');
      setLoginError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">LMS++</h1>
          <p className="text-muted-foreground">Learning Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in to your account</CardTitle>
            <CardDescription>
              Select your organisation and enter your credentials to continue.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {loginError && (
                <Alert
                  variant="destructive"
                  onClose={() => setLoginError(null)}
                  className="animate-slide-down"
                >
                  <div className="ml-2 space-y-1">
                    <p className="font-medium">Login failed</p>
                    <p className="text-sm">{loginError}</p>
                    <p className="text-xs opacity-90 mt-2">
                      Please check your credentials and try again. If you've
                      forgotten your password, you can reset it using the link
                      below.
                    </p>
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

              <FormField
                label="Password"
                required
                error={errors.password?.message}
              >
                <Input
                  type="password"
                  placeholder="Enter your password"
                  icon={<Lock className="h-5 w-5" />}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...register('password')}
                />
              </FormField>

              <div className="flex justify-end text-sm">
                <Link to="/forgot-password" variant="primary">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" variant="primary">
                  Request access
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
