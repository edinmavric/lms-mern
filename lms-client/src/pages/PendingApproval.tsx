import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';

export function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
          <p className="text-muted-foreground mb-6">
            Your account is waiting for administrator approval. You'll be able
            to access the platform once your account has been approved.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
