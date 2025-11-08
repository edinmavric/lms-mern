import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  Building2,
  Calendar,
  Edit,
} from 'lucide-react';

import { bankAccountsApi } from '../../lib/api/bankAccounts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

export function BankAccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: bankAccount,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bankAccount', id],
    queryFn: () => bankAccountsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !bankAccount) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Bank account not found</p>
            <p className="text-sm">
              The bank account you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/bank-accounts')}>
          Back to Bank Accounts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/admin/bank-accounts')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Bank Account Details
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {bankAccount.accountHolderName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/app/admin/bank-accounts/${bankAccount._id}/edit`)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Bank Account
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Account Holder Name
              </p>
              <p className="text-base font-semibold mt-1">
                {bankAccount.accountHolderName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Bank Name
              </p>
              <p className="text-base mt-1">{bankAccount.bankName || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">IBAN</p>
              <p className="text-base font-mono mt-1">{bankAccount.iban}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                SWIFT Code
              </p>
              <p className="text-base mt-1">{bankAccount.swiftCode || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Currency
              </p>
              <div className="mt-1">
                <Badge variant="outline" className="text-base">
                  {bankAccount.currency}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <div className="mt-1">
                {bankAccount.isPrimary ? (
                  <Badge variant="success">Primary Account</Badge>
                ) : (
                  <Badge variant="outline">Secondary Account</Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base mt-1">
                {new Date(bankAccount.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Bank Account ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">
                {bankAccount._id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tenant ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">
                {bankAccount.tenant}
              </p>
            </div>
            {bankAccount.createdBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {bankAccount.createdBy}
                </p>
              </div>
            )}
            {bankAccount.updatedBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Updated By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {bankAccount.updatedBy}
                </p>
              </div>
            )}
            {bankAccount.isDeleted && bankAccount.deletedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Deleted At
                </p>
                <p className="text-base mt-1">
                  {new Date(bankAccount.deletedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
