import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ShieldX } from 'lucide-react';

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4">403</h1>
          <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
          <p className="text-muted-foreground mb-8">
            You don't have permission to access this resource.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </CardContent>
      </Card>
    </div>
  );
}
