import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { departmentsApi } from '../../lib/api/departments';
import { getErrorMessage } from '../../lib/utils';
import type { Department } from '../../types';
import {
  DepartmentForm,
  useDepartmentForm,
  type DepartmentFormData,
} from './DepartmentForm';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Dialog,
  DialogContent,
  DialogFooter,
  FormDialog,
} from '../../components/ui';

export function DepartmentsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    department: Department | null;
  }>({ open: false, department: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    department: Department | null;
  }>({ open: false, department: null });

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments', { name: searchName || undefined }],
    queryFn: () =>
      departmentsApi.list({
        name: searchName || undefined,
      }),
  });

  const { data: allDepartments = [] } = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: () => departmentsApi.list({}),
  });

  const createMutation = useMutation({
    mutationFn: (data: DepartmentFormData) => {
      return departmentsApi.create({
        name: data.name,
        description: data.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
      setCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to create department'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepartmentFormData }) => {
      const updateData = {
        name: data.name,
        description: data.description,
      };
      return departmentsApi.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
      setEditDialog({ open: false, department: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to update department'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
      setDeleteDialog({ open: false, department: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete department'));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Departments</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage departments and organize courses
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Department
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Departments
                </p>
                <p className="text-2xl font-bold">{allDepartments.length}</p>
              </div>
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name..."
            icon={<Search className="h-4 w-4" />}
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading departments...
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No departments found
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Description
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(department => (
                      <tr
                        key={department._id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={e => {
                          if ((e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          navigate(`/app/admin/departments/${department._id}`);
                        }}
                        onKeyDown={e => {
                          if (
                            e.key === 'Enter' ||
                            e.key === ' ' ||
                            e.key === 'Spacebar'
                          ) {
                            e.preventDefault();
                            if (!(e.target as HTMLElement).closest('button')) {
                              navigate(
                                `/app/admin/departments/${department._id}`
                              );
                            }
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${department.name}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{department.name}</div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {department.description || (
                            <span className="text-muted-foreground/50">
                              No description
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditDialog({
                                  open: true,
                                  department: department,
                                })
                              }
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  department: department,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden grid gap-4 p-4">
                {departments.map(department => (
                  <Card
                    key={department._id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      navigate(`/app/admin/departments/${department._id}`);
                    }}
                    onKeyDown={e => {
                      if (
                        e.key === 'Enter' ||
                        e.key === ' ' ||
                        e.key === 'Spacebar'
                      ) {
                        e.preventDefault();
                        if (!(e.target as HTMLElement).closest('button')) {
                          navigate(`/app/admin/departments/${department._id}`);
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${department.name}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {department.name}
                          </h3>
                          {department.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {department.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px]"
                          onClick={() =>
                            setEditDialog({
                              open: true,
                              department: department,
                            })
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 min-w-[100px]"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              department: department,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateDepartmentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={async data => {
          await createMutation.mutateAsync(data);
        }}
        isSubmitting={createMutation.isPending}
        error={
          createMutation.error
            ? getErrorMessage(
                createMutation.error,
                'Failed to create department'
              )
            : null
        }
      />

      {editDialog.department && (
        <EditDepartmentDialog
          open={editDialog.open}
          department={editDialog.department}
          onClose={() => setEditDialog({ open: false, department: null })}
          onSubmit={async data => {
            await updateMutation.mutateAsync({
              id: editDialog.department!._id,
              data,
            });
          }}
          isSubmitting={updateMutation.isPending}
          error={
            updateMutation.error
              ? getErrorMessage(
                  updateMutation.error,
                  'Failed to update department'
                )
              : null
          }
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteDialog({ open: false, department: null });
          }
        }}
        title="Delete Department"
        description={
          deleteDialog.department
            ? `Are you sure you want to delete the department "${deleteDialog.department.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this department? This action cannot be undone.'
        }
        maxWidth="md"
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, department: null })}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.department) {
                  deleteMutation.mutate(deleteDialog.department._id);
                }
              }}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CreateDepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function CreateDepartmentDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: CreateDepartmentDialogProps) {
  const form = useDepartmentForm();

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      try {
        await onSubmit(form.getValues());
        form.reset();
      } catch (err) {}
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title="Create Department"
      description="Fill in the information below to create a new department."
      onSubmit={handleSubmit}
      submitLabel="Create Department"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <DepartmentForm
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        error={error}
      />
    </FormDialog>
  );
}

interface EditDepartmentDialogProps {
  open: boolean;
  department: Department;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function EditDepartmentDialog({
  open,
  onClose,
  onSubmit,
  department,
  isSubmitting,
  error,
}: EditDepartmentDialogProps) {
  const form = useDepartmentForm(department);

  useEffect(() => {
    if (open && department) {
      form.reset({
        name: department.name || '',
        description: department.description || '',
      });
    }
  }, [open, department, form]);

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      try {
        await onSubmit(form.getValues());
      } catch (err) {}
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title="Edit Department"
      description="Update the department information."
      onSubmit={handleSubmit}
      submitLabel="Update Department"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <DepartmentForm
        department={department}
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        error={error}
      />
    </FormDialog>
  );
}
