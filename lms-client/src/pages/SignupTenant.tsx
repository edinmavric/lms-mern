import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Globe,
  Lock,
  Mail,
  UserRound,
  CheckCircle2,
} from 'lucide-react';

import { authApi } from '../lib/api/auth';
import { getErrorMessage } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Alert,
  Badge,
} from '../components/ui';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be at most 128 characters long')
  .regex(/[A-Z]/, 'Must include at least one uppercase letter')
  .regex(/[a-z]/, 'Must include at least one lowercase letter')
  .regex(/[0-9]/, 'Must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must include at least one special character');

const tenantSignupSchema = z
  .object({
    adminFirstName: z.string().min(1, 'First name is required'),
    adminLastName: z.string().min(1, 'Last name is required'),
    adminEmail: z.string().email('Invalid email address'),
    adminPassword: passwordSchema,
    adminConfirmPassword: z.string(),
    tenantName: z.string().min(1, 'Organisation name is required'),
    domain: z
      .string()
      .trim()
      .optional()
      .refine(
        value =>
          !value ||
          /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(
            value
          ),
        'Enter a valid domain'
      ),
    contactEmail: z
      .string()
      .trim()
      .optional()
      .refine(value => !value || z.string().email().safeParse(value).success, {
        message: 'Invalid contact email address',
      }),
    gradeLabel: z.enum(['1-5', '1-10', '6-10']),
    gradeMin: z.number().min(1).max(20),
    gradeMax: z.number().min(1).max(20),
    attendancePercent: z
      .number()
      .min(0, 'Attendance requirement must be at least 0')
      .max(100, 'Attendance requirement cannot exceed 100'),
    allowRemote: z.boolean(),
    currency: z.string().min(1, 'Currency is required'),
    locale: z.string().min(1, 'Locale is required'),
  })
  .refine(data => data.adminPassword === data.adminConfirmPassword, {
    path: ['adminConfirmPassword'],
    message: 'Passwords must match',
  })
  .refine(data => data.gradeMin < data.gradeMax, {
    path: ['gradeMax'],
    message: 'Maximum grade must be greater than minimum grade',
  });

type TenantSignupForm = z.infer<typeof tenantSignupSchema>;

const gradePresets: Record<
  TenantSignupForm['gradeLabel'],
  { min: number; max: number }
> = {
  '1-5': { min: 1, max: 5 },
  '1-10': { min: 1, max: 10 },
  '6-10': { min: 6, max: 10 },
};

export function SignupTenant() {
  const [step, setStep] = useState<1 | 2>(1);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const {
    control,
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TenantSignupForm>({
    resolver: zodResolver<TenantSignupForm, any, TenantSignupForm>(
      tenantSignupSchema
    ),
    defaultValues: {
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: '',
      adminConfirmPassword: '',
      tenantName: '',
      domain: undefined,
      contactEmail: undefined,
      gradeLabel: '1-5',
      gradeMin: gradePresets['1-5'].min,
      gradeMax: gradePresets['1-5'].max,
      attendancePercent: 75,
      allowRemote: false,
      currency: 'EUR',
      locale: 'en',
    },
    mode: 'onTouched',
  });

  const adminFirstName = watch('adminFirstName');
  const adminLastName = watch('adminLastName');
  const adminEmail = watch('adminEmail');
  const adminPassword = watch('adminPassword');
  const adminConfirmPassword = watch('adminConfirmPassword');

  const isStepOneValid = useMemo(() => {
    const filled =
      adminFirstName?.trim() &&
      adminLastName?.trim() &&
      adminEmail?.trim() &&
      adminPassword &&
      adminConfirmPassword;
    const hasErrors =
      !!errors.adminFirstName ||
      !!errors.adminLastName ||
      !!errors.adminEmail ||
      !!errors.adminPassword ||
      !!errors.adminConfirmPassword;

    return Boolean(filled) && !hasErrors;
  }, [
    adminFirstName,
    adminLastName,
    adminEmail,
    adminPassword,
    adminConfirmPassword,
    errors.adminFirstName,
    errors.adminLastName,
    errors.adminEmail,
    errors.adminPassword,
    errors.adminConfirmPassword,
  ]);

  const handleGradePresetChange = (value: TenantSignupForm['gradeLabel']) => {
    const preset = gradePresets[value];
    setValue('gradeMin', preset.min, { shouldValidate: true });
    setValue('gradeMax', preset.max, { shouldValidate: true });
  };

  const onSubmit = async (values: TenantSignupForm) => {
    try {
      setSubmissionError(null);
      const response = await authApi.tenantSignup({
        tenantName: values.tenantName,
        domain: values.domain?.trim() || undefined,
        contactEmail: values.contactEmail?.trim() || undefined,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword,
        adminFirstName: values.adminFirstName,
        adminLastName: values.adminLastName,
        settings: {
          gradeScale: {
            min: values.gradeMin,
            max: values.gradeMax,
            label: values.gradeLabel,
          },
          attendanceRules: {
            requiredPresencePercent: values.attendancePercent,
            allowRemote: values.allowRemote,
          },
          currency: values.currency,
          locale: values.locale,
        },
      });

      setAuth({
        user: response.user,
        tenant: response.tenant,
        accessToken: response.token,
        refreshToken: response.refreshToken,
      });

      toast.success('Tenant created successfully');
      navigate('/app');
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to create tenant');
      setSubmissionError(message);
      toast.error(message);
    }
  };

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 space-y-3 text-center">
          <Badge
            variant="secondary"
            className="inline-flex items-center gap-2 text-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-success" />
            Fast-track onboarding for new tenants
          </Badge>
          <h1 className="text-4xl font-bold">Create a new organisation</h1>
          <p className="text-muted-foreground md:text-lg">
            Provision your tenant, invite team members, and roll out courses in
            minutes. You control branding, grade scales, and approval workflows.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete the onboarding steps</CardTitle>
            <CardDescription>
              We’ll create your administrator account and configure your
              organisation defaults.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  step === 1
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <p className="font-semibold">Step 1 · Admin account</p>
                <p>Create your personal login with elevated privileges.</p>
              </div>
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  step === 2
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <p className="font-semibold">Step 2 · Organisation profile</p>
                <p>Define tenant details and operational settings.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="First name"
                      required
                      error={errors.adminFirstName?.message}
                    >
                      <Input
                        placeholder="Alex"
                        icon={<UserRound className="h-5 w-5" />}
                        {...register('adminFirstName')}
                      />
                    </FormField>
                    <FormField
                      label="Last name"
                      required
                      error={errors.adminLastName?.message}
                    >
                      <Input
                        placeholder="Rivera"
                        icon={<UserRound className="h-5 w-5" />}
                        {...register('adminLastName')}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Work email"
                    required
                    error={errors.adminEmail?.message}
                  >
                    <Input
                      type="email"
                      placeholder="you@organisation.com"
                      icon={<Mail className="h-5 w-5" />}
                      {...register('adminEmail')}
                    />
                  </FormField>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Password"
                      required
                      error={errors.adminPassword?.message}
                    >
                      <Input
                        type="password"
                        placeholder="Create a secure password"
                        icon={<Lock className="h-5 w-5" />}
                        {...register('adminPassword')}
                      />
                    </FormField>
                    <FormField
                      label="Confirm password"
                      required
                      error={errors.adminConfirmPassword?.message}
                    >
                      <Input
                        type="password"
                        placeholder="Repeat your password"
                        icon={<Lock className="h-5 w-5" />}
                        {...register('adminConfirmPassword')}
                      />
                    </FormField>
                  </div>

                  <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
                    Passwords must include at least one uppercase letter, one
                    lowercase letter, one number, and one special character.
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <FormField
                    label="Organisation name"
                    required
                    error={errors.tenantName?.message}
                  >
                    <Input
                      placeholder="Nova Academy"
                      icon={<Building2 className="h-5 w-5" />}
                      {...register('tenantName')}
                    />
                  </FormField>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Primary domain"
                      error={errors.domain?.message}
                    >
                      <Input
                        placeholder="academy.example.com"
                        icon={<Globe className="h-5 w-5" />}
                        {...register('domain')}
                      />
                    </FormField>
                    <FormField
                      label="Contact email"
                      error={errors.contactEmail?.message}
                    >
                      <Input
                        type="email"
                        placeholder="info@academy.com"
                        icon={<Mail className="h-5 w-5" />}
                        {...register('contactEmail')}
                      />
                    </FormField>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Default currency"
                      required
                      error={errors.currency?.message}
                    >
                      <Controller
                        name="currency"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger error={!!errors.currency}>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EUR">EUR · Euro</SelectItem>
                              <SelectItem value="USD">USD · US Dollar</SelectItem>
                              <SelectItem value="GBP">GBP · British Pound</SelectItem>
                              <SelectItem value="BAM">
                                BAM · Bosnia Convertible Mark
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>

                    <FormField
                      label="Locale"
                      required
                      error={errors.locale?.message}
                    >
                      <Controller
                        name="locale"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger error={!!errors.locale}>
                              <SelectValue placeholder="Select locale" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="bs">Bosnian</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>
                  </div>

                  <div className="space-y-4 rounded-lg border border-border p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Grade scale defaults
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Controller
                        name="gradeLabel"
                        control={control}
                        render={({ field }) => (
                          <FormField
                            label="Preset"
                            required
                            error={errors.gradeLabel?.message}
                          >
                            <Select
                              value={field.value}
                              onValueChange={(value: TenantSignupForm['gradeLabel']) => {
                                field.onChange(value);
                                handleGradePresetChange(value);
                              }}
                            >
                              <SelectTrigger error={!!errors.gradeLabel}>
                                <SelectValue placeholder="Select preset" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-5">1 - 5</SelectItem>
                                <SelectItem value="1-10">1 - 10</SelectItem>
                                <SelectItem value="6-10">6 - 10</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>
                        )}
                      />
                      <FormField
                        label="Minimum"
                        required
                        error={errors.gradeMin?.message}
                      >
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          {...register('gradeMin', { valueAsNumber: true })}
                        />
                      </FormField>
                      <FormField
                        label="Maximum"
                        required
                        error={errors.gradeMax?.message}
                      >
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          {...register('gradeMax', { valueAsNumber: true })}
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-lg border border-border p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Attendance rules
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label="Required presence (%)"
                        required
                        error={errors.attendancePercent?.message}
                      >
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...register('attendancePercent', {
                            valueAsNumber: true,
                          })}
                        />
                      </FormField>
                      <FormField
                        label="Remote attendance"
                        error={errors.allowRemote?.message}
                      >
                        <Controller
                          name="allowRemote"
                          control={control}
                          render={({ field }) => (
                            <label className="flex items-center gap-3 text-sm text-muted-foreground">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                checked={field.value}
                                onChange={event =>
                                  field.onChange(event.target.checked)
                                }
                              />
                              Allow remote participation
                            </label>
                          )}
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
                    You can further customise branding, authentication policies,
                    and integrations from the admin dashboard after onboarding.
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">
                  Step {step} of 2
                </div>
                <div className="flex gap-3">
                  {step === 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                  )}
                  {step === 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setStep(2)}
                      disabled={!isStepOneValid}
                      className="gap-2"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  {step === 2 && (
                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating tenant…' : 'Create tenant'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {submissionError && (
              <Alert variant="destructive">
                <div className="space-y-1">
                  <p className="font-medium">Setup failed</p>
                  <p className="text-sm text-muted-foreground">
                    {submissionError}
                  </p>
                </div>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="text-sm text-muted-foreground">
            Need assistance or custom onboarding? Reach out to our support team
            and we’ll walk you through multi-tenant deployments.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
