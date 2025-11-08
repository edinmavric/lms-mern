import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  ClipboardCheck,
  UserRound,
  Calendar,
  Edit,
} from 'lucide-react';

import { attendanceApi } from '../../lib/api/attendance';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

export function AttendanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: attendance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => attendanceApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !attendance) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Attendance record not found</p>
            <p className="text-sm">
              The attendance record you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/attendances')}>
          Back to Attendance
        </Button>
      </div>
    );
  }

  const getStudentName = () => {
    if (typeof attendance.student === 'string') {
      return 'Unknown Student';
    }
    return `${attendance.student.firstName} ${attendance.student.lastName}`;
  };

  const getStudentEmail = () => {
    if (typeof attendance.student === 'string') {
      return '';
    }
    return attendance.student.email;
  };

  const getCourseName = () => {
    if (!attendance.course) return 'No course';
    if (typeof attendance.course === 'string') {
      return 'Unknown Course';
    }
    return attendance.course.name || 'Unknown Course';
  };

  const getRecordedByName = () => {
    if (!attendance.recordedBy) return 'Unknown';
    if (typeof attendance.recordedBy === 'string') {
      return 'Unknown';
    }
    return `${attendance.recordedBy.firstName} ${attendance.recordedBy.lastName}`;
  };

  const getRecordedByEmail = () => {
    if (!attendance.recordedBy) return '';
    if (typeof attendance.recordedBy === 'string') {
      return '';
    }
    return attendance.recordedBy.email;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'destructive';
      case 'late':
        return 'warning';
      case 'excused':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'excused':
        return 'Excused';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/admin/attendances')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Attendance Details
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {getStudentName()} -{' '}
              {new Date(attendance.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/app/admin/attendances/${attendance._id}/edit`)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Attendance
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Attendance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <div className="mt-1">
                <Badge
                  variant={getStatusBadgeVariant(attendance.status)}
                  className="text-base font-semibold"
                >
                  {getStatusLabel(attendance.status)}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-base font-semibold mt-1">
                {new Date(attendance.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Recorded At
              </p>
              <p className="text-base mt-1">
                {new Date(attendance.recordedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Student
              </p>
              <p className="text-base font-semibold mt-1">{getStudentName()}</p>
              {getStudentEmail() && (
                <p className="text-sm text-muted-foreground mt-1">
                  {getStudentEmail()}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course
              </p>
              <p className="text-base font-semibold mt-1">{getCourseName()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Recorded By
              </p>
              <p className="text-base font-semibold mt-1">
                {getRecordedByName()}
              </p>
              {getRecordedByEmail() && (
                <p className="text-sm text-muted-foreground mt-1">
                  {getRecordedByEmail()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                Attendance ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">
                {attendance._id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tenant ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">
                {attendance.tenant}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base mt-1">
                {new Date(attendance.createdAt).toLocaleString()}
              </p>
            </div>
            {attendance.createdBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {attendance.createdBy}
                </p>
              </div>
            )}
            {attendance.updatedBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Updated By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {attendance.updatedBy}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
