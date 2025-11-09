import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  FileText,
  BookOpen,
  ExternalLink,
  Link as LinkIcon,
  Video,
  Image,
  File,
  Presentation,
  Folder,
  Calendar,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';

import { lessonMaterialsApi } from '../../lib/api/lessonMaterials';
import { coursesApi } from '../../lib/api/courses';
import { lessonsApi } from '../../lib/api/lessons';
import { useAuthStore } from '../../store/authStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
} from '../../components/ui';

const getMaterialTypeIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return FileText;
    case 'video':
      return Video;
    case 'presentation':
      return Presentation;
    case 'link':
      return LinkIcon;
    case 'document':
      return File;
    case 'image':
      return Image;
    default:
      return Folder;
  }
};

const getMaterialTypeLabel = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'PDF';
    case 'video':
      return 'Video';
    case 'presentation':
      return 'Presentation';
    case 'link':
      return 'Link';
    case 'document':
      return 'Document';
    case 'image':
      return 'Image';
    default:
      return 'Other';
  }
};

export function ProfessorLessonMaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    data: material,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lessonMaterial', id],
    queryFn: () => lessonMaterialsApi.getById(id!),
    enabled: !!id,
  });

  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: () => lessonsApi.list({}),
  });

  const myLessons = allLessons.filter(lesson => {
    const courseId =
      typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
    return myCourses.some(course => course._id === courseId);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Lesson material not found</p>
            <p className="text-sm">
              The lesson material you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/lesson-materials')}>
          Back to Lesson Materials
        </Button>
      </div>
    );
  }

  const materialCourseId =
    typeof material.course === 'string' ? material.course : material.course._id;
  const belongsToProfessor = myCourses.some(
    course => course._id === materialCourseId
  );

  if (!belongsToProfessor) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">
              You don't have access to this lesson material.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/lesson-materials')}>
          Back to Lesson Materials
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof material.course === 'string') {
      const course = myCourses.find(c => c._id === material.course);
      return course?.name || 'Unknown Course';
    }
    return material.course.name;
  };

  const getLessonName = () => {
    if (typeof material.lesson === 'string') {
      const lesson = myLessons.find(l => l._id === material.lesson);
      return lesson?.title || 'Unknown Lesson';
    }
    return material.lesson.title;
  };

  const TypeIcon = getMaterialTypeIcon(material.type);
  const lessonId =
    typeof material.lesson === 'string' ? material.lesson : material.lesson._id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/professor/lesson-materials')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <TypeIcon className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {material.name}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                {getCourseName()} • {getLessonName()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/app/professor/lesson-materials/${id}/edit`)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Material
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/app/professor/lessons/${lessonId}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Lesson
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TypeIcon className="h-5 w-5" />
              Material Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base font-semibold mt-1">{material.name}</p>
            </div>
            {material.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-base mt-1">{material.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <div className="mt-1">
                <Badge variant="outline">
                  {getMaterialTypeLabel(material.type)}
                </Badge>
              </div>
            </div>
            {material.url && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">URL</p>
                <div className="mt-1">
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate">{material.url}</span>
                  </a>
                </div>
              </div>
            )}
            {material.storageKey && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Storage Key
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                  {material.storageKey}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course & Lesson Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course
              </p>
              <div className="flex items-center gap-2 mt-1">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-base font-semibold">{getCourseName()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Lesson
              </p>
              <div className="flex items-center gap-2 mt-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">{getLessonName()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base mt-1">
                {format(new Date(material.createdAt), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
            {material.updatedAt !== material.createdAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Updated At
                </p>
                <p className="text-base mt-1">
                  {format(new Date(material.updatedAt), 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {material.url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Access Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Material URL
                </p>
                <p className="text-sm truncate">{material.url}</p>
              </div>
              <Button
                onClick={() => window.open(material.url, '_blank')}
                className="ml-4 shrink-0"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Material
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Created At
            </p>
            <p className="text-base mt-1">
              {format(new Date(material.createdAt), 'MMMM dd, yyyy HH:mm')}
            </p>
          </div>
          {material.updatedAt !== material.createdAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-base mt-1">
                {format(new Date(material.updatedAt), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
