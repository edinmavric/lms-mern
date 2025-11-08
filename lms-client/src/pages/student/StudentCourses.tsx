import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Lock,
  Building2,
  User,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

import { coursesApi } from '../../lib/api/courses';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { getErrorMessage } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import type { Course, Enrollment } from '../../types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Dialog,
  DialogContent,
  DialogFooter,
  FormField,
  Alert,
  Badge,
} from '../../components/ui';

export function StudentCourses() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchName, setSearchName] = useState('');
  const [enrollDialog, setEnrollDialog] = useState<{
    open: boolean;
    course: Course | null;
  }>({ open: false, course: null });
  const [enrollmentPassword, setEnrollmentPassword] = useState('');

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => enrollmentsApi.list({ student: user?._id }),
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({}),
  });

  const enrolledCourseIds = enrollments
    .filter(e => e.status !== 'cancelled')
    .map(e => (typeof e.course === 'string' ? e.course : e.course._id));

  const enrolledCourses = allCourses.filter(c =>
    enrolledCourseIds.includes(c._id)
  );
  const availableCourses = allCourses.filter(
    c => !enrolledCourseIds.includes(c._id)
  );

  const filteredEnrolledCourses = searchName
    ? enrolledCourses.filter(course =>
        course.name.toLowerCase().includes(searchName.toLowerCase())
      )
    : enrolledCourses;

  const filteredAvailableCourses = searchName
    ? availableCourses.filter(course =>
        course.name.toLowerCase().includes(searchName.toLowerCase())
      )
    : availableCourses;

  const enrollMutation = useMutation({
    mutationFn: async ({
      courseId,
      password,
    }: {
      courseId: string;
      password?: string;
    }) => {
      return enrollmentsApi.create({
        course: courseId,
        enrollmentPassword: password,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Successfully enrolled in course');
      setEnrollDialog({ open: false, course: null });
      setEnrollmentPassword('');
    },
    onError: error => {
      toast.error(getErrorMessage(error, 'Failed to enroll in course'));
    },
  });

  const handleEnroll = () => {
    if (!enrollDialog.course) return;
    enrollMutation.mutate({
      courseId: enrollDialog.course._id,
      password: enrollmentPassword || undefined,
    });
  };

  const getProfessorName = (course: Course) => {
    if (typeof course.professor === 'string') return 'Unknown Professor';
    return `${course.professor.firstName} ${course.professor.lastName}`;
  };

  const getDepartmentName = (course: Course) => {
    if (!course.department) return null;
    if (typeof course.department === 'string') return 'Unknown Department';
    return course.department.name;
  };

  const getEnrollmentStatus = (course: Course): Enrollment | null => {
    return (
      enrollments.find(e => {
        const courseId = typeof e.course === 'string' ? e.course : e.course._id;
        return courseId === course._id;
      }) || null
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          View your enrolled courses and discover new ones to enroll in
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by course name..."
            icon={<Search className="h-4 w-4" />}
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
        {filteredEnrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchName
                ? 'No enrolled courses match your search'
                : 'You are not enrolled in any courses yet'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEnrolledCourses.map(course => {
              const enrollment = getEnrollmentStatus(course);
              return (
                <Card
                  key={course._id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/app/student/courses/${course._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <Badge
                        variant={
                          enrollment?.status === 'active'
                            ? 'success'
                            : enrollment?.status === 'completed'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {enrollment?.status || 'active'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{getProfessorName(course)}</span>
                    </div>
                    {getDepartmentName(course) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{getDepartmentName(course)}</span>
                      </div>
                    )}
                    {course.price !== undefined && course.price > 0 && (
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>{course.price.toFixed(2)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
        {filteredAvailableCourses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchName
                ? 'No available courses match your search'
                : 'No available courses to enroll in'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAvailableCourses.map(course => (
              <Card
                key={course._id}
                className="hover:bg-muted/50 transition-colors"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{getProfessorName(course)}</span>
                  </div>
                  {getDepartmentName(course) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{getDepartmentName(course)}</span>
                    </div>
                  )}
                  {course.price !== undefined && course.price > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <DollarSign className="h-4 w-4" />
                      <span>{course.price.toFixed(2)}</span>
                    </div>
                  )}
                  {course.enrollmentPassword && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Password required</span>
                    </div>
                  )}
                  <Button
                    className="w-full mt-4"
                    onClick={() => setEnrollDialog({ open: true, course })}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Enroll
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={enrollDialog.open}
        onClose={() => {
          if (!enrollMutation.isPending) {
            setEnrollDialog({ open: false, course: null });
            setEnrollmentPassword('');
          }
        }}
        title="Enroll in Course"
        description={
          enrollDialog.course
            ? `Enroll in "${enrollDialog.course.name}"`
            : 'Enroll in course'
        }
        maxWidth="md"
      >
        <DialogContent>
          {enrollDialog.course?.enrollmentPassword && (
            <Alert className="mb-4">
              <Lock className="h-4 w-4" />
              <div>
                <p className="font-medium">Password Required</p>
                <p className="text-sm">
                  This course requires an enrollment password.
                </p>
              </div>
            </Alert>
          )}
          <FormField
            label="Enrollment Password"
            required={!!enrollDialog.course?.enrollmentPassword}
            helperText={
              enrollDialog.course?.enrollmentPassword
                ? 'Enter the enrollment password for this course'
                : 'This course does not require a password'
            }
          >
            <Input
              type="password"
              placeholder={
                enrollDialog.course?.enrollmentPassword
                  ? 'Enter enrollment password'
                  : 'Not required'
              }
              value={enrollmentPassword}
              onChange={e => setEnrollmentPassword(e.target.value)}
              disabled={
                enrollMutation.isPending ||
                !enrollDialog.course?.enrollmentPassword
              }
              icon={<Lock className="h-4 w-4" />}
            />
          </FormField>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEnrollDialog({ open: false, course: null });
                setEnrollmentPassword('');
              }}
              disabled={enrollMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={
                enrollMutation.isPending ||
                (!!enrollDialog.course?.enrollmentPassword &&
                  !enrollmentPassword)
              }
              loading={enrollMutation.isPending}
            >
              Enroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
