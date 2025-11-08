import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Building2, Edit, Calendar } from 'lucide-react';

import { departmentsApi } from '../../lib/api/departments';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
} from '../../components/ui';

export function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: department,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Department not found</p>
            <p className="text-sm">
              The department you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/departments')}>
          Back to Departments
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
            onClick={() => navigate('/app/admin/departments')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {department.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Department Details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/app/admin/departments/${department._id}/edit`)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Department
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base font-semibold mt-1">{department.name}</p>
            </div>
            {department.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-base mt-1">{department.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Record Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Department ID
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {department._id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tenant ID
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {department.tenant}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created At
                </p>
                <p className="text-base mt-1">
                  {new Date(department.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Updated At
                </p>
                <p className="text-base mt-1">
                  {new Date(department.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
