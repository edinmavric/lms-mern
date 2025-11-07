import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, Lock, UserRound } from 'lucide-react';

import { authApi } from '../lib/api/auth';
import { getErrorMessage } from '../lib/utils';
import { TenantSelector } from '../components/TenantSelector';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  FormField,
  Alert,
  Link,
  Select,
} from '../components/ui';

const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().optional(),
  contactEmail: z.string().optional(),
});

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be at most 128 characters long')
  .regex(/[A-Z]/, 'Must include at least one uppercase letter')
  .regex(/[a-z]/, 'Must include at least one lowercase letter')
  .regex(/[0-9]/, 'Must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must include at least one special character');

const individualSignupSchema = z
  .object({
    tenant: tenantSchema.nullable(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['student', 'professor']),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })
  .refine(data => data.tenant !== null, {
    message: 'Please select an organisation',
    path: ['tenant'],
  });

type IndividualSignupForm = z.infer<typeof individualSignupSchema>;

export function SignupIndividual() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<IndividualSignupForm>({
    resolver: zodResolver(individualSignupSchema),
    defaultValues: {
      tenant: null,
      role: 'student',
    },
  });

  const onSubmit = async (values: IndividualSignupForm) => {
    try {
      setSuccessMessage(null);
      await authApi.register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        tenantId: values.tenant!.id,
        role: values.role,
      });

      setSuccessMessage(
        'Registration submitted. Your administrator will review and approve your access shortly.'
      );
      toast.success('Registration submitted');
      reset({
        tenant: values.tenant,
        firstName: '',
        lastName: '',
        email: '',
        role: 'student',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to complete registration'));
    }
  };

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-4xl font-bold">Join an existing organisation</h1>
          <p className="text-muted-foreground">
            Select your organisation and submit your profile for administrator
            approval. You’ll receive an email once your account is activated.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request access</CardTitle>
            <CardDescription>
              Provide your details to join your organisation. All signups are
              tenant-scoped and protected by our approval workflow.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="First name"
                  required
                  error={errors.firstName?.message}
                >
                  <Input
                    placeholder="Taylor"
                    icon={<UserRound className="h-5 w-5" />}
                    {...register('firstName')}
                  />
                </FormField>

                <FormField
                  label="Last name"
                  required
                  error={errors.lastName?.message}
                >
                  <Input
                    placeholder="Jordan"
                    icon={<UserRound className="h-5 w-5" />}
                    {...register('lastName')}
                  />
                </FormField>
              </div>

              <FormField
                label="Work email"
                required
                error={errors.email?.message}
              >
                <Input
                  type="email"
                  placeholder="you@organisation.com"
                  icon={<Mail className="h-5 w-5" />}
                  {...register('email')}
                />
              </FormField>

              <FormField
                label="Role"
                required
                error={errors.role?.message}
                helperText="Select whether you'll be a student or a teacher in this organisation."
              >
                <Select {...register('role')} disabled={isSubmitting}>
                  <option value="student">Student</option>
                  <option value="professor">Teacher / Professor</option>
                </Select>
              </FormField>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Password"
                  required
                  error={errors.password?.message}
                >
                  <Input
                    type="password"
                    placeholder="Create a secure password"
                    icon={<Lock className="h-5 w-5" />}
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
                    placeholder="Repeat your password"
                    icon={<Lock className="h-5 w-5" />}
                    {...register('confirmPassword')}
                  />
                </FormField>
              </div>

              <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
                Passwords must include at least one uppercase letter, one
                lowercase letter, one number, and one special character.
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting request…' : 'Submit for approval'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 text-sm text-muted-foreground">
            {successMessage && (
              <Alert variant="success">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Request submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {successMessage}
                  </p>
                </div>
              </Alert>
            )}
            <p>
              Already approved?{' '}
              <Link to="/login" variant="primary">
                Sign in instead
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
