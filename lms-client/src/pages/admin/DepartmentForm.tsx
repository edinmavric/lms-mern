import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, AlertCircle } from 'lucide-react';

import type { Department } from '../../types';
import { Input, FormField, Alert, Textarea } from '../../components/ui';

const departmentFormSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
});

export type DepartmentFormData = z.infer<typeof departmentFormSchema>;

interface DepartmentFormProps {
  department?: Department;
  isSubmitting?: boolean;
  error?: string | null;
  register: ReturnType<typeof useForm<DepartmentFormData>>['register'];
  errors: ReturnType<typeof useForm<DepartmentFormData>>['formState']['errors'];
}

export function DepartmentForm({
  isSubmitting = false,
  error,
  register,
  errors,
}: DepartmentFormProps) {
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

      <FormField label="Department Name" required error={errors.name?.message}>
        <Input
          {...register('name')}
          placeholder="Computer Science"
          disabled={isSubmitting}
          error={errors.name?.message}
          icon={<Building2 className="h-4 w-4" />}
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea
          {...register('description')}
          placeholder="Department description..."
          disabled={isSubmitting}
          error={errors.description?.message}
          rows={4}
        />
      </FormField>
    </div>
  );
}

export function useDepartmentForm(department?: Department) {
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: department?.name || '',
      description: department?.description || '',
    },
  });

  return form;
}
