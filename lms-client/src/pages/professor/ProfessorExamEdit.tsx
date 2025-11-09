import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { examsApi } from '../../lib/api/exams';
import { coursesApi } from '../../lib/api/courses';
import { useAuthStore } from '../../store/authStore';
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

interface ExamFormData {
  course: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxPoints: number;
  passingPoints: number;
  type: 'preliminary' | 'finishing';
  subscriptionDeadline: string;
  isActive: boolean;
}

export function ProfessorExamEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const { data: exam, isLoading } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => examsApi.getById(id!),
    enabled: !!id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
    enabled: !!user?._id,
  });

  const [formData, setFormData] = useState<ExamFormData>({
    course: '',
    title: '',
    description: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: '',
    maxPoints: 100,
    passingPoints: 50,
    type: 'finishing',
    subscriptionDeadline: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    isActive: true,
  });

  useEffect(() => {
    if (exam) {
      const examCourseId =
        typeof exam.course === 'string' ? exam.course : exam.course._id;
      const hasAccess = courses.some(c => c._id === examCourseId);

      if (!hasAccess) {
        setError('You do not have permission to edit this exam');
        return;
      }

      setFormData({
        course: examCourseId,
        title: exam.title || '',
        description: exam.description || '',
        date: exam.date
          ? format(new Date(exam.date), "yyyy-MM-dd'T'HH:mm")
          : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        location: exam.location || '',
        maxPoints: exam.maxPoints || 100,
        passingPoints: exam.passingPoints || 50,
        type: exam.type || 'finishing',
        subscriptionDeadline: exam.subscriptionDeadline
          ? format(new Date(exam.subscriptionDeadline), "yyyy-MM-dd'T'HH:mm")
          : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        isActive: exam.isActive ?? true,
      });
    }
  }, [exam, courses]);

  const updateMutation = useMutation({
    mutationFn: (data: ExamFormData) => {
      return examsApi.update(id!, {
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
        location: data.location,
        maxPoints: data.maxPoints,
        passingPoints: data.passingPoints,
        type: data.type,
        subscriptionDeadline: new Date(data.subscriptionDeadline).toISOString(),
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
      toast.success('Exam updated successfully');
      navigate(`/app/professor/exams/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(error, 'Failed to update exam');
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Exam not found</p>
            <p className="text-sm">
              The exam you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/exams')}>
          Back to Exams
        </Button>
      </div>
    );
  }

  if (error && error.includes('permission')) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/exams')}>
          Back to Exams
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
          onClick={() => navigate(`/app/professor/exams/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Exam</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update exam information and settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>Update the exam's information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <p>{error}</p>
              </Alert>
            )}

            <FormField label="Course" required>
              <Select
                value={formData.course}
                onValueChange={value =>
                  setFormData({ ...formData, course: value })
                }
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Course cannot be changed after exam creation
              </p>
            </FormField>

            <FormField label="Title" required>
              <Input
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Final Exam"
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
                placeholder="Exam description..."
              />
            </FormField>

            <FormField label="Exam Date & Time" required>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={e => {
                  const newDate = e.target.value;
                  setFormData({
                    ...formData,
                    date: newDate,
                    subscriptionDeadline:
                      formData.type === 'preliminary'
                        ? newDate
                        : formData.subscriptionDeadline,
                  });
                }}
                required
              />
            </FormField>

            <FormField label="Location">
              <Input
                value={formData.location}
                onChange={e =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Room 101"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Max Points" required>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxPoints}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      maxPoints: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </FormField>

              <FormField label="Passing Points" required>
                <Input
                  type="number"
                  min="0"
                  max={formData.maxPoints}
                  value={formData.passingPoints}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      passingPoints: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </FormField>
            </div>

            <FormField label="Exam Type" required>
              <Select
                value={formData.type}
                onValueChange={value => {
                  const newType = value as 'preliminary' | 'finishing';
                  if (newType === 'preliminary') {
                    setFormData({
                      ...formData,
                      type: newType,
                      subscriptionDeadline: formData.date,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      type: newType,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preliminary">Preliminary Exam</SelectItem>
                  <SelectItem value="finishing">Finishing Exam</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.type === 'preliminary'
                  ? 'Preliminary exams automatically subscribe all enrolled students'
                  : 'Finishing exams require students to manually subscribe'}
              </p>
            </FormField>

            <FormField label="Subscription Deadline" required>
              <Input
                type="datetime-local"
                value={formData.subscriptionDeadline}
                onChange={e =>
                  setFormData({
                    ...formData,
                    subscriptionDeadline: e.target.value,
                  })
                }
                required
                disabled={formData.type === 'preliminary'}
              />
              {formData.type === 'preliminary' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Subscription deadline is not applicable for preliminary exams
                </p>
              )}
            </FormField>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-border"
              />
              <label htmlFor="isActive" className="text-sm">
                Active
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/professor/exams/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                loading={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Exam'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
