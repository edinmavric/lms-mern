import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  FileText,
  Plus,
  Edit,
  Trash2,
  Link as LinkIcon,
  File,
  Video,
  Image,
  Presentation,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

import { lessonsApi } from '../../lib/api/lessons';
import { coursesApi } from '../../lib/api/courses';
import { lessonMaterialsApi } from '../../lib/api/lessonMaterials';
import { uploadsApi } from '../../lib/api/uploads';
import { useAuthStore } from '../../store/authStore';
import type { LessonMaterial } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Dialog,
  DialogContent,
  DialogFooter,
  FormField,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
} from '../../components/ui';

interface MaterialFormData {
  name: string;
  description?: string;
  type:
    | 'pdf'
    | 'video'
    | 'presentation'
    | 'link'
    | 'document'
    | 'image'
    | 'other';
  url?: string;
  storageKey?: string;
  file?: File;
}

function MaterialForm({
  material,
  onSubmit,
  onCancel,
}: {
  material?: LessonMaterial | null;
  onSubmit: (data: MaterialFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<MaterialFormData>({
    name: material?.name || '',
    description: material?.description || '',
    type: material?.type || 'link',
    url: material?.url || '',
    storageKey: material?.storageKey || '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isFileType = [
    'pdf',
    'document',
    'image',
    'presentation',
    'other',
  ].includes(formData.type);
  const isLinkOrVideo = ['link', 'video'].includes(formData.type);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({ ...formData, file, url: undefined, storageKey: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Material name is required');
      return;
    }

    if (isLinkOrVideo) {
      if (!formData.url?.trim()) {
        toast.error('URL is required for link and video types');
        return;
      }
      const { file, ...submitData } = formData;
      onSubmit(submitData);
    } else if (isFileType) {
      if (selectedFile) {
        setUploading(true);
        try {
          const { fileUrl, storageKey } = await uploadsApi.uploadFile(
            selectedFile
          );
          const { file, ...submitData } = formData;
          onSubmit({
            ...submitData,
            url: fileUrl,
            storageKey,
          });
          setUploading(false);
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message || 'Failed to upload file'
          );
          setUploading(false);
          return;
        }
      } else if (material && material.url) {
        const { file, ...submitData } = formData;
        onSubmit({
          ...submitData,
          url: material.url,
          storageKey: material.storageKey,
        });
      } else {
        toast.error('Please select a file to upload');
        return;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Material Name" required>
        <Input
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Lecture Slides, Reading Material"
          required
        />
      </FormField>

      <FormField label="Description">
        <textarea
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Optional description of the material"
        />
      </FormField>

      <FormField label="Type" required>
        <Select
          value={formData.type}
          onValueChange={value => {
            const newType = value as MaterialFormData['type'];
            setFormData({
              ...formData,
              type: newType,
              url: undefined,
              storageKey: undefined,
              file: undefined,
            });
            setSelectedFile(null);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="link">Link</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {isLinkOrVideo ? (
        <FormField label="URL" required>
          <Input
            type="url"
            value={formData.url || ''}
            onChange={e => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com/material.pdf"
            required
          />
        </FormField>
      ) : isFileType ? (
        <FormField label="File" required>
          <div className="space-y-2">
            <Input
              type="file"
              onChange={handleFileChange}
              accept={
                formData.type === 'pdf'
                  ? '.pdf'
                  : formData.type === 'image'
                  ? 'image/*'
                  : formData.type === 'document'
                  ? '.doc,.docx,.txt'
                  : formData.type === 'presentation'
                  ? '.ppt,.pptx'
                  : '*'
              }
              className="cursor-pointer"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {material && material.url && !selectedFile && (
              <p className="text-sm text-muted-foreground">
                Current file:{' '}
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {material.name}
                </a>
              </p>
            )}
          </div>
        </FormField>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            'Save Material'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProfessorLessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [createMaterialDialogOpen, setCreateMaterialDialogOpen] =
    useState(false);
  const [editMaterialDialog, setEditMaterialDialog] = useState<{
    open: boolean;
    material: LessonMaterial | null;
  }>({ open: false, material: null });
  const [deleteMaterialDialog, setDeleteMaterialDialog] = useState<{
    open: boolean;
    material: LessonMaterial | null;
  }>({ open: false, material: null });

  const {
    data: lesson,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonsApi.getById(id!),
    enabled: !!id,
  });

  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
    enabled: !!user?._id,
  });

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['lessonMaterials', 'lesson', id],
    queryFn: () => lessonMaterialsApi.list({ lesson: id }),
    enabled: !!id,
  });

  const createMaterialMutation = useMutation({
    mutationFn: lessonMaterialsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['lessonMaterials', 'lesson', id],
      });
      setCreateMaterialDialogOpen(false);
      toast.success('Material added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add material');
    },
  });

  const updateMaterialMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      lessonMaterialsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['lessonMaterials', 'lesson', id],
      });
      setEditMaterialDialog({ open: false, material: null });
      toast.success('Material updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update material'
      );
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: lessonMaterialsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['lessonMaterials', 'lesson', id],
      });
      setDeleteMaterialDialog({ open: false, material: null });
      toast.success('Material deleted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete material'
      );
    },
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
        <Button onClick={() => navigate('/app/professor/lessons')}>
          Back to My Lessons
        </Button>
      </div>
    );
  }

  const lessonCourseId =
    typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
  const isMyLesson = myCourses.some(course => course._id === lessonCourseId);

  if (!isMyLesson) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">
              This lesson does not belong to any of your courses.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/lessons')}>
          Back to My Lessons
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof lesson.course === 'string') {
      const course = myCourses.find(c => c._id === lesson.course);
      return course?.name || 'Unknown Course';
    }
    return lesson.course.name || 'Unknown Course';
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <File className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'presentation':
        return <Presentation className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getMaterialTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleCreateMaterial = (data: MaterialFormData) => {
    if (!id) return;
    createMaterialMutation.mutate({
      lesson: id,
      ...data,
    });
  };

  const handleUpdateMaterial = (data: MaterialFormData) => {
    if (!editMaterialDialog.material) return;
    updateMaterialMutation.mutate({
      id: editMaterialDialog.material._id,
      data,
    });
  };

  const handleDeleteMaterial = () => {
    if (!deleteMaterialDialog.material) return;
    deleteMaterialMutation.mutate(deleteMaterialDialog.material._id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/professor/lessons')}
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lesson Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Lesson Title
              </p>
              <p className="text-base font-semibold mt-1">{lesson.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course
              </p>
              <p className="text-base mt-1">{getCourseName()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-base mt-1">
                {new Date(lesson.date).toLocaleDateString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start Time
                </p>
                <p className="text-base mt-1">{lesson.startTime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  End Time
                </p>
                <p className="text-base mt-1">{lesson.endTime}</p>
              </div>
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
              <Calendar className="h-5 w-5" />
              Schedule Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date
                </p>
                <p className="text-base">
                  {new Date(lesson.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Time
                </p>
                <p className="text-base">
                  {lesson.startTime} - {lesson.endTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lesson Materials
            </CardTitle>
            <Button size="sm" onClick={() => setCreateMaterialDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {materialsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : materials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No materials added yet. Click "Add Material" to add resources for
              this lesson.
            </p>
          ) : (
            <div className="space-y-3">
              {materials.map(material => (
                <div
                  key={material._id}
                  className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {getMaterialTypeIcon(material.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-base">
                          {material.name}
                        </h3>
                        <Badge variant="outline">
                          {getMaterialTypeLabel(material.type)}
                        </Badge>
                      </div>
                      {material.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {material.description}
                        </p>
                      )}
                      {material.url && (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2 flex items-center gap-1 break-all"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{material.url}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setEditMaterialDialog({ open: true, material })
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() =>
                        setDeleteMaterialDialog({ open: true, material })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createMaterialDialogOpen}
        onClose={() => setCreateMaterialDialogOpen(false)}
        title="Add Material"
        description="Add a new material resource for this lesson"
      >
        <DialogContent>
          <MaterialForm
            onSubmit={handleCreateMaterial}
            onCancel={() => setCreateMaterialDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editMaterialDialog.open}
        onClose={() => setEditMaterialDialog({ open: false, material: null })}
        title="Edit Material"
        description="Update material details"
      >
        <DialogContent>
          <MaterialForm
            material={editMaterialDialog.material}
            onSubmit={handleUpdateMaterial}
            onCancel={() =>
              setEditMaterialDialog({ open: false, material: null })
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteMaterialDialog.open}
        onClose={() => setDeleteMaterialDialog({ open: false, material: null })}
        title="Delete Material"
        description={`Are you sure you want to delete "${deleteMaterialDialog.material?.name}"? This action cannot be undone.`}
      >
        <DialogContent>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteMaterialDialog({ open: false, material: null })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMaterial}
              disabled={deleteMaterialMutation.isPending}
            >
              {deleteMaterialMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
