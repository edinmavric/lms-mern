import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Award,
  UserRound,
  Calendar,
  Edit,
  History,
} from 'lucide-react';

import { gradesApi } from '../../lib/api/grades';
import type { GradeHistory } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
} from '../../components/ui';

export function GradeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: grade,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['grade', id],
    queryFn: () => gradesApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !grade) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Grade not found</p>
            <p className="text-sm">
              The grade you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/grades')}>
          Back to Grades
        </Button>
      </div>
    );
  }

  const getStudentName = () => {
    if (typeof grade.student === 'string') {
      return 'Unknown Student';
    }
    return `${grade.student.firstName} ${grade.student.lastName}`;
  };

  const getStudentEmail = () => {
    if (typeof grade.student === 'string') {
      return '';
    }
    return grade.student.email;
  };

  const getCourseName = () => {
    if (typeof grade.course === 'string') {
      return 'Unknown Course';
    }
    return grade.course.name || 'Unknown Course';
  };

  const getProfessorName = () => {
    if (typeof grade.professor === 'string') {
      return 'Unknown Professor';
    }
    return `${grade.professor.firstName} ${grade.professor.lastName}`;
  };

  const getProfessorEmail = () => {
    if (typeof grade.professor === 'string') {
      return '';
    }
    return grade.professor.email;
  };

  const getChangedByName = (historyItem: GradeHistory) => {
    if (typeof historyItem.changedBy === 'string') {
      return 'Unknown';
    }
    return `${historyItem.changedBy.firstName} ${historyItem.changedBy.lastName}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/admin/grades')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Grade Details</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {getStudentName()} - {getCourseName()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/app/admin/grades/${grade._id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Grade
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Grade Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Grade Value
              </p>
              <p className="text-3xl font-bold mt-1">
                {grade.value.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Attempt
              </p>
              <p className="text-base font-semibold mt-1">{grade.attempt}</p>
            </div>
            {grade.comment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Comment
                </p>
                <p className="text-base mt-1 whitespace-pre-wrap">
                  {grade.comment}
                </p>
              </div>
            )}
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
                Professor
              </p>
              <p className="text-base font-semibold mt-1">
                {getProfessorName()}
              </p>
              {getProfessorEmail() && (
                <p className="text-sm text-muted-foreground mt-1">
                  {getProfessorEmail()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {grade.history && grade.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Grade History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grade.history.map((historyItem: GradeHistory, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Changed from {historyItem.oldValue.toFixed(2)} to{' '}
                      {historyItem.newValue.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Changed by: {getChangedByName(historyItem)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(historyItem.changedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Grade Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Grade ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">{grade._id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tenant ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">{grade.tenant}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-base mt-1">
                {new Date(grade.date).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base mt-1">
                {new Date(grade.createdAt).toLocaleString()}
              </p>
            </div>
            {grade.createdBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {grade.createdBy}
                </p>
              </div>
            )}
            {grade.updatedBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Updated By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {grade.updatedBy}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
