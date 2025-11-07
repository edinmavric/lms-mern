import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, Lock } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Label, Link } from '../components/ui';

const loginSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form data:', data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">LMS Platform</h1>
          <p className="text-muted-foreground">Learning Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="organizationName" required>
                  Organization Name
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="organizationName"
                  placeholder="Enter your organization name"
                  icon={<Building2 className="h-5 w-5" />}
                  error={errors.organizationName?.message}
                  {...register('organizationName')}
                />
              </div>

              <div>
                <Label htmlFor="email" required>
                  Email Address
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="h-5 w-5" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" required>
                    Password
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  icon={<Lock className="h-5 w-5" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" variant="primary">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
