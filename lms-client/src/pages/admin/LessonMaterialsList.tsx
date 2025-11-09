import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  ExternalLink,
  Loader2,
  BookOpen,
  User,
  Link as LinkIcon,
  Video,
  Image,
  File,
  Presentation,
  Folder,
} from 'lucide-react';

import { lessonMaterialsApi } from '../../lib/api/lessonMaterials';
import { coursesApi } from '../../lib/api/courses';
import { lessonsApi } from '../../lib/api/lessons';
import { usersApi } from '../../lib/api/users';
import type { LessonMaterial } from '../../types';
import {
  Card,
  CardContent,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Button,
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

export function LessonMaterialsList() {
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('__all__');
  const [filterLesson, setFilterLesson] = useState<string>('__all__');
  const [filterType, setFilterType] = useState<string>('__all__');

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: () => lessonsApi.list({}),
  });

  const { data: materials = [], isLoading } = useQuery({
    queryKey: [
      'lessonMaterials',
      'all',
      {
        course: filterCourse !== '__all__' ? filterCourse : undefined,
        lesson: filterLesson !== '__all__' ? filterLesson : undefined,
      },
    ],
    queryFn: () =>
      lessonMaterialsApi.list({
        course: filterCourse !== '__all__' ? filterCourse : undefined,
        lesson: filterLesson !== '__all__' ? filterLesson : undefined,
      }),
  });

  const { data: professors = [] } = useQuery({
    queryKey: ['users', 'professors'],
    queryFn: () => usersApi.list({ role: 'professor', status: 'active' }),
  });

  const filteredMaterials = searchName
    ? materials.filter(material =>
        material.name.toLowerCase().includes(searchName.toLowerCase())
      )
    : materials.filter(material => {
        if (filterType !== '__all__' && material.type !== filterType) {
          return false;
        }
        return true;
      });

  const getCourseName = (material: LessonMaterial) => {
    if (typeof material.course === 'string') {
      const course = courses.find(c => c._id === material.course);
      return course?.name || 'Unknown Course';
    }
    return material.course.name;
  };

  const getLessonName = (material: LessonMaterial) => {
    if (typeof material.lesson === 'string') {
      const lesson = lessons.find(l => l._id === material.lesson);
      return lesson?.title || 'Unknown Lesson';
    }
    return material.lesson.title;
  };

  const getProfessorName = (material: LessonMaterial) => {
    if (typeof material.professor === 'string') {
      const professor = professors.find(p => p._id === material.professor);
      return professor
        ? `${professor.firstName} ${professor.lastName}`
        : 'Unknown Professor';
    }
    return `${material.professor.firstName} ${material.professor.lastName}`;
  };

  const materialsByType = materials.reduce((acc, material) => {
    acc[material.type] = (acc[material.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Lesson Materials</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View all lesson materials across all courses and lessons
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Materials
                </p>
                <p className="text-2xl font-bold">{materials.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  PDFs
                </p>
                <p className="text-2xl font-bold">
                  {materialsByType['pdf'] || 0}
                </p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <FileText className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Videos
                </p>
                <p className="text-2xl font-bold">
                  {materialsByType['video'] || 0}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <Video className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Links
                </p>
                <p className="text-2xl font-bold">
                  {materialsByType['link'] || 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <LinkIcon className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search materials by name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Courses</SelectItem>
            {courses.map(course => (
              <SelectItem key={course._id} value={course._id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterLesson} onValueChange={setFilterLesson}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by lesson" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Lessons</SelectItem>
            {lessons
              .filter(lesson => {
                if (filterCourse !== '__all__') {
                  const courseId =
                    typeof lesson.course === 'string'
                      ? lesson.course
                      : lesson.course._id;
                  return courseId === filterCourse;
                }
                return true;
              })
              .map(lesson => (
                <SelectItem key={lesson._id} value={lesson._id}>
                  {lesson.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="link">Link</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchName ||
              filterCourse !== '__all__' ||
              filterLesson !== '__all__' ||
              filterType !== '__all__'
                ? 'No materials found'
                : 'No lesson materials yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchName ||
              filterCourse !== '__all__' ||
              filterLesson !== '__all__' ||
              filterType !== '__all__'
                ? 'Try adjusting your search criteria'
                : 'Materials will appear here when professors add them to lessons'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map(material => {
            const courseName = getCourseName(material);
            const lessonName = getLessonName(material);
            const professorName = getProfessorName(material);
            const TypeIcon = getMaterialTypeIcon(material.type);

            return (
              <Card
                key={material._id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  navigate(`/app/admin/lesson-materials/${material._id}`);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      <Badge variant="outline">
                        {getMaterialTypeLabel(material.type)}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-base mb-2 line-clamp-2">
                    {material.name}
                  </h3>
                  {material.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span className="truncate">{courseName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{lessonName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{professorName}</span>
                    </div>
                  </div>
                  {material.url && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open Material</span>
                      </a>
                    </div>
                  )}
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/app/admin/lesson-materials/${material._id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
