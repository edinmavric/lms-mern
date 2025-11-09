import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { lessonMaterialsApi } from '../../lib/api/lessonMaterials';
import { uploadsApi } from '../../lib/api/uploads';
import { getErrorMessage } from '../../lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  FormField,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
}

export function LessonMaterialEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: material, isLoading } = useQuery({
    queryKey: ['lessonMaterial', id],
    queryFn: () => lessonMaterialsApi.getById(id!),
    enabled: !!id,
  });

  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    description: '',
    type: 'link',
    url: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        description: material.description || '',
        type: material.type || 'link',
        url: material.url || '',
        storageKey: material.storageKey || '',
      });
    }
  }, [material]);

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
      setFormData({ ...formData, url: undefined, storageKey: undefined });
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: MaterialFormData) => {
      let finalData = { ...data };

      if (isFileType && selectedFile) {
        setUploading(true);
        try {
          const { fileUrl, storageKey } = await uploadsApi.uploadFile(
            selectedFile
          );
          finalData = {
            ...finalData,
            url: fileUrl,
            storageKey,
          };
        } catch (error: any) {
          throw new Error(
            error?.response?.data?.message || 'Failed to upload file'
          );
        } finally {
          setUploading(false);
        }
      }

      const { storageKey, ...updateData } = finalData;
      return lessonMaterialsApi.update(id!, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonMaterials'] });
      queryClient.invalidateQueries({ queryKey: ['lessonMaterial', id] });
      toast.success('Lesson material updated successfully');
      navigate(`/app/admin/lesson-materials/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to update lesson material'
      );
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Material name is required');
      return;
    }

    if (isLinkOrVideo && !formData.url?.trim()) {
      setError('URL is required for link and video types');
      return;
    }

    if (isFileType && !selectedFile && !material?.url) {
      setError('Please select a file to upload or keep the existing file');
      return;
    }

    await updateMutation.mutateAsync(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!material) {
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
        <Button onClick={() => navigate('/app/admin/lesson-materials')}>
          Back to Lesson Materials
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/app/admin/lesson-materials/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Edit Lesson Material
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update lesson material information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Details</CardTitle>
          <CardDescription>
            Update the lesson material's information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <p>{error}</p>
              </Alert>
            )}

            <FormField label="Material Name" required>
              <Input
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                  onChange={e =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://example.com/material.pdf"
                  required
                />
              </FormField>
            ) : isFileType ? (
              <FormField label="File">
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
                  <p className="text-xs text-muted-foreground">
                    Leave empty to keep the existing file
                  </p>
                </div>
              </FormField>
            ) : null}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/admin/lesson-materials/${id}`)}
                disabled={updateMutation.isPending || uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || uploading}
                loading={updateMutation.isPending || uploading}
              >
                {updateMutation.isPending || uploading
                  ? 'Updating...'
                  : 'Update Material'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
