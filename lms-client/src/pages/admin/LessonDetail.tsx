import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Calendar,
  Edit,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';

import { lessonsApi } from '../../lib/api/lessons';
import type { LessonMaterial } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

export function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: lesson,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Lesson not found</p>
            <p className="text-sm">
              The lesson you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/lessons')}>
          Back to Lessons
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof lesson.course === 'string') {
      return 'Unknown Course';
    }
    return lesson.course?.name || 'Unknown Course';
  };

  const getMaterialIcon = (type: LessonMaterial['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <BookOpen className="h-4 w-4" />;
      case 'presentation':
        return <FileText className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getMaterialTypeLabel = (type: LessonMaterial['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/admin/lessons')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Lesson Details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/app/admin/lessons/${lesson._id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Lesson
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lesson Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-base font-semibold mt-1">{lesson.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course
              </p>
              <p className="text-base font-semibold mt-1">
                {getCourseName()}
              </p>
            </div>
            {lesson.content && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Content
                </p>
                <p className="text-base mt-1 whitespace-pre-wrap">
                  {lesson.content}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(lesson.materials) && lesson.materials.length > 0 ? (
              <div className="space-y-3">
                {lesson.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border"
                  >
                    <div className="mt-0.5">
                      {getMaterialIcon(material.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getMaterialTypeLabel(material.type)}
                        </Badge>
                      </div>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-1 block break-all"
                      >
                        {material.url}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No materials</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lesson Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Lesson ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">{lesson._id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tenant ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">
                {lesson.tenant}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base mt-1">
                {new Date(lesson.createdAt).toLocaleString()}
              </p>
            </div>
            {lesson.createdBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {typeof lesson.createdBy === 'string'
                    ? lesson.createdBy
                    : `${lesson.createdBy.firstName} ${lesson.createdBy.lastName}`}
                </p>
              </div>
            )}
            {lesson.updatedBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Updated By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {typeof lesson.updatedBy === 'string'
                    ? lesson.updatedBy
                    : `${lesson.updatedBy.firstName} ${lesson.updatedBy.lastName}`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

