import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Edit,
  Trash2,
  Plus,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

import { bankAccountsApi } from '../../lib/api/bankAccounts';
import { getErrorMessage } from '../../lib/utils';
import type { BankAccount } from '../../types';
import {
  BankAccountForm,
  useBankAccountForm,
  type BankAccountFormData,
} from './BankAccountForm';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogFooter,
  FormDialog,
  Badge,
} from '../../components/ui';

export function BankAccountsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchIban, setSearchIban] = useState('');
  const [filterCurrency, setFilterCurrency] = useState<string>('');
  const [filterIsPrimary, setFilterIsPrimary] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    bankAccount: BankAccount | null;
  }>({ open: false, bankAccount: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    bankAccount: BankAccount | null;
  }>({ open: false, bankAccount: null });

  const { data: bankAccounts = [], isLoading } = useQuery({
    queryKey: [
      'bankAccounts',
      {
        currency: filterCurrency || undefined,
        isPrimary:
          filterIsPrimary === 'true'
            ? true
            : filterIsPrimary === 'false'
            ? false
            : undefined,
      },
    ],
    queryFn: () =>
      bankAccountsApi.list({
        currency: (filterCurrency as any) || undefined,
        isPrimary:
          filterIsPrimary === 'true'
            ? true
            : filterIsPrimary === 'false'
            ? false
            : undefined,
      }),
  });

  const { data: allBankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts', 'all'],
    queryFn: () => bankAccountsApi.list({}),
  });

  const filteredBankAccounts = searchIban
    ? bankAccounts.filter(account =>
        account.iban.toLowerCase().includes(searchIban.toLowerCase())
      )
    : bankAccounts;

  const createMutation = useMutation({
    mutationFn: (data: BankAccountFormData) => {
      return bankAccountsApi.create({
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        iban: data.iban,
        swiftCode: data.swiftCode,
        currency: data.currency,
        isPrimary: data.isPrimary,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success('Bank account created successfully');
      setCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to create bank account'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BankAccountFormData }) => {
      const updateData = {
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        iban: data.iban,
        swiftCode: data.swiftCode,
        currency: data.currency,
        isPrimary: data.isPrimary,
      };
      return bankAccountsApi.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success('Bank account updated successfully');
      setEditDialog({ open: false, bankAccount: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to update bank account'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bankAccountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success('Bank account deleted successfully');
      setDeleteDialog({ open: false, bankAccount: null });
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to delete bank account'));
    },
  });

  const getStats = () => {
    const total = allBankAccounts.length;
    const primary = allBankAccounts.filter(a => a.isPrimary).length;
    const currencies = new Set(allBankAccounts.map(a => a.currency)).size;
    return { total, primary, currencies };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage tenant bank accounts
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Accounts
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Primary Accounts
                </p>
                <p className="text-2xl font-bold text-success">
                  {stats.primary}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <Building2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Currencies
                </p>
                <p className="text-2xl font-bold">{stats.currencies}</p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <CreditCard className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder="Search by IBAN..."
                icon={<Search className="h-4 w-4" />}
                value={searchIban}
                onChange={e => setSearchIban(e.target.value)}
              />
            </div>

            <Select
              value={filterCurrency || 'all'}
              onValueChange={value =>
                setFilterCurrency(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
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

            <Select
              value={filterIsPrimary || 'all'}
              onValueChange={value =>
                setFilterIsPrimary(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by primary status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="true">Primary Only</SelectItem>
                <SelectItem value="false">Non-Primary Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading bank accounts...
            </div>
          ) : filteredBankAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bank accounts found
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Account Holder
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Bank Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        IBAN
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Currency
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBankAccounts.map(account => (
                      <tr
                        key={account._id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={e => {
                          if ((e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          navigate(`/app/admin/bank-accounts/${account._id}`);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!(e.target as HTMLElement).closest('button')) {
                              navigate(
                                `/app/admin/bank-accounts/${account._id}`
                              );
                            }
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${account.accountHolderName}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {account.accountHolderName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {account.bankName || '-'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono text-sm">
                          {account.iban}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{account.currency}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {account.isPrimary ? (
                            <Badge variant="success">Primary</Badge>
                          ) : (
                            <Badge variant="outline">Secondary</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditDialog({
                                  open: true,
                                  bankAccount: account,
                                })
                              }
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  bankAccount: account,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3 p-4">
                {filteredBankAccounts.map(account => (
                  <Card
                    key={account._id}
                    className="border-border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      navigate(`/app/admin/bank-accounts/${account._id}`);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!(e.target as HTMLElement).closest('button')) {
                          navigate(`/app/admin/bank-accounts/${account._id}`);
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${account.accountHolderName}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {account.accountHolderName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {account.bankName || 'No bank name'}
                          </p>
                        </div>
                        {account.isPrimary && (
                          <Badge variant="success">Primary</Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground font-mono">
                          <span className="font-medium">IBAN:</span>{' '}
                          {account.iban}
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-medium">Currency:</span>{' '}
                          <Badge variant="outline" className="ml-1">
                            {account.currency}
                          </Badge>
                        </div>
                        {account.swiftCode && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">SWIFT:</span>{' '}
                            {account.swiftCode}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditDialog({ open: true, bankAccount: account })
                          }
                          className="flex-1 min-w-[100px]"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              bankAccount: account,
                            })
                          }
                          className="flex-1 min-w-[100px]"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
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

      <CreateBankAccountDialog
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
                'Failed to create bank account'
              )
            : null
        }
      />

      {editDialog.bankAccount && (
        <EditBankAccountDialog
          open={editDialog.open}
          bankAccount={editDialog.bankAccount}
          onClose={() => setEditDialog({ open: false, bankAccount: null })}
          onSubmit={async data => {
            await updateMutation.mutateAsync({
              id: editDialog.bankAccount!._id,
              data,
            });
          }}
          isSubmitting={updateMutation.isPending}
          error={
            updateMutation.error
              ? getErrorMessage(
                  updateMutation.error,
                  'Failed to update bank account'
                )
              : null
          }
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteDialog({ open: false, bankAccount: null });
          }
        }}
        title="Delete Bank Account"
        description={
          deleteDialog.bankAccount
            ? `Are you sure you want to delete the bank account for "${deleteDialog.bankAccount.accountHolderName}" (${deleteDialog.bankAccount.iban})? This action cannot be undone.`
            : 'Are you sure you want to delete this bank account? This action cannot be undone.'
        }
        maxWidth="md"
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, bankAccount: null })
              }
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.bankAccount) {
                  deleteMutation.mutate(deleteDialog.bankAccount._id);
                }
              }}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete Bank Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CreateBankAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BankAccountFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function CreateBankAccountDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: CreateBankAccountDialogProps) {
  const form = useBankAccountForm();

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
      title="Add Bank Account"
      description="Fill in the information below to add a new bank account."
      onSubmit={handleSubmit}
      submitLabel="Add Bank Account"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <BankAccountForm
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        error={error}
      />
    </FormDialog>
  );
}

interface EditBankAccountDialogProps {
  open: boolean;
  bankAccount: BankAccount;
  onClose: () => void;
  onSubmit: (data: BankAccountFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function EditBankAccountDialog({
  open,
  onClose,
  onSubmit,
  bankAccount,
  isSubmitting,
  error,
}: EditBankAccountDialogProps) {
  const form = useBankAccountForm(bankAccount);

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
      title="Edit Bank Account"
      description="Update the bank account information."
      onSubmit={handleSubmit}
      submitLabel="Update Bank Account"
      cancelLabel="Cancel"
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <BankAccountForm
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        error={error}
      />
    </FormDialog>
  );
}
