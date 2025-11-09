import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { pointsApi } from '../../lib/api/points';
import { coursesApi } from '../../lib/api/courses';
import { usersApi } from '../../lib/api/users';
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
} from '../../components/ui';

interface PointFormData {
  student: string;
  course: string;
  points: number;
  maxPoints: number;
  title: string;
  description?: string;
  date: string;
}

export function ProfessorPointEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const { data: point, isLoading } = useQuery({
    queryKey: ['point', id],
    queryFn: () => pointsApi.getById(id!),
    enabled: !!id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => usersApi.list({ role: 'student', status: 'active' }),
  });

  const [formData, setFormData] = useState<PointFormData>({
    student: '',
    course: '',
    points: 0,
    maxPoints: 100,
    title: '',
    description: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  useEffect(() => {
    if (point) {
      setFormData({
        student:
          typeof point.student === 'string' ? point.student : point.student._id,
        course:
          typeof point.course === 'string' ? point.course : point.course._id,
        points: point.points || 0,
        maxPoints: point.maxPoints || 100,
        title: point.title || '',
        description: point.description || '',
        date: point.date
          ? format(new Date(point.date), "yyyy-MM-dd'T'HH:mm")
          : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [point]);

  const updateMutation = useMutation({
    mutationFn: (data: PointFormData) => {
      return pointsApi.update(id!, {
        points: data.points,
        maxPoints: data.maxPoints,
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] });
      queryClient.invalidateQueries({ queryKey: ['point', id] });
      toast.success('Point updated successfully');
      navigate(`/app/professor/points/${id}`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(error, 'Failed to update point');
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.points > formData.maxPoints) {
      toast.error(
        `Points cannot exceed maximum points (${formData.maxPoints})`
      );
      return;
    }

    if (formData.points < 0) {
      toast.error('Points cannot be negative');
      return;
    }

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

  if (!point) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Point not found</p>
            <p className="text-sm">
              The point assignment you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/professor/points')}>
          Back to Points
        </Button>
      </div>
    );
  }

  const getCourseName = () => {
    if (typeof point.course === 'string') {
      const course = courses.find(c => c._id === point.course);
      return course?.name || 'Unknown Course';
    }
    return point.course.name;
  };

  const getStudentName = () => {
    if (typeof point.student === 'string') {
      const student = students.find(s => s._id === point.student);
      return student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student';
    }
    return `${point.student.firstName} ${point.student.lastName}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/app/professor/points/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Point</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Update point assignment information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Point Details</CardTitle>
          <CardDescription>
            Update the point assignment's information. Course and student cannot
            be changed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <p>{error}</p>
              </Alert>
            )}

            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Course</p>
              <p className="text-base">{getCourseName()}</p>
            </div>

            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Student</p>
              <p className="text-base">{getStudentName()}</p>
            </div>

            <FormField label="Title" required>
              <Input
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Assignment 1, Quiz 2, etc."
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
                placeholder="Point description..."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Points" required>
                <Input
                  type="number"
                  min="0"
                  max={formData.maxPoints}
                  value={formData.points}
                  onChange={e => {
                    const points = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      points: Math.max(0, Math.min(points, formData.maxPoints)),
                    });
                  }}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max: {formData.maxPoints} points
                </p>
              </FormField>

              <FormField label="Max Points" required>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxPoints}
                  onChange={e => {
                    const maxPoints = Math.max(
                      1,
                      parseInt(e.target.value) || 100
                    );
                    setFormData({
                      ...formData,
                      maxPoints,
                      points: Math.min(formData.points, maxPoints),
                    });
                  }}
                  required
                />
              </FormField>
            </div>

            <FormField label="Date" required>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={e =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/professor/points/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                loading={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Point'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
