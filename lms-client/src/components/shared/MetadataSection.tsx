import { useAuthStore } from '../../store/authStore';
import { useUserById } from '../../hooks/useUserById';

interface MetadataSectionProps {
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  showTenant?: boolean;
}

export function MetadataSection({
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  showTenant = true,
}: MetadataSectionProps) {
  const { tenant } = useAuthStore();
  const { getUserName: getCreatedByName } = useUserById(createdBy);
  const { getUserName: getUpdatedByName } = useUserById(updatedBy);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {showTenant && tenant && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Tenant</p>
          <p className="text-base mt-1">{tenant.name}</p>
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-muted-foreground">Created At</p>
        <p className="text-base mt-1">{new Date(createdAt).toLocaleString()}</p>
      </div>
      {createdBy && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Created By</p>
          <p className="text-base mt-1">{getCreatedByName()}</p>
        </div>
      )}
      {updatedAt && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Updated At</p>
          <p className="text-base mt-1">
            {new Date(updatedAt).toLocaleString()}
          </p>
        </div>
      )}
      {updatedBy && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Updated By</p>
          <p className="text-base mt-1">{getUpdatedByName()}</p>
        </div>
      )}
    </div>
  );
}
