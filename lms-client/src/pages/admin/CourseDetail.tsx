import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  UserRound,
  Calendar,
  Edit,
  Users,
} from 'lucide-react';

import { coursesApi } from '../../lib/api/courses';
import type { Course } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../../components/ui';

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <div className="space-y-1">
            <p className="font-medium">Course not found</p>
            <p className="text-sm">
              The course you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate('/app/admin/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  const getProfessorName = (professor: Course['professor']) => {
    if (typeof professor === 'string') return 'Unknown';
    return `${professor.firstName} ${professor.lastName}`;
  };

  const getProfessorEmail = (professor: Course['professor']) => {
    if (typeof professor === 'string') return '';
    return professor.email;
  };

  const getStudentCount = () => {
    if (Array.isArray(course.students)) {
      return course.students.length;
    }
    return 0;
  };

  const getStudents = () => {
    if (Array.isArray(course.students)) {
      return course.students;
    }
    return [];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/admin/courses')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{course.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Course Details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/app/admin/courses/${course._id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course Name
              </p>
              <p className="text-base font-semibold mt-1">{course.name}</p>
            </div>
            {course.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-base mt-1">{course.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <p className="text-base font-semibold mt-1">
                {course.price ? `$${course.price.toFixed(2)}` : 'Free'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Professor & Students
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Professor
              </p>
              <p className="text-base font-semibold mt-1">
                {getProfessorName(course.professor)}
              </p>
              {getProfessorEmail(course.professor) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {getProfessorEmail(course.professor)}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Enrolled Students
              </p>
              <div className="mt-1">
                <Badge variant="default">
                  {getStudentCount()}{' '}
                  {getStudentCount() === 1 ? 'student' : 'students'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {course.schedule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {course.schedule.days && course.schedule.days.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Days
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {course.schedule.days.map((day, idx) => (
                      <Badge key={idx} variant="outline">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {course.schedule.startTime && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Start Time
                  </p>
                  <p className="text-base mt-1">{course.schedule.startTime}</p>
                </div>
              )}
              {course.schedule.endTime && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    End Time
                  </p>
                  <p className="text-base mt-1">{course.schedule.endTime}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {getStudents().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enrolled Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getStudents().map(student => {
                const studentName =
                  typeof student === 'string'
                    ? 'Unknown'
                    : `${student.firstName} ${student.lastName}`;
                const studentEmail =
                  typeof student === 'string' ? '' : student.email;
                return (
                  <div
                    key={typeof student === 'string' ? student : student._id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-base font-medium">{studentName}</p>
                      {studentEmail && (
                        <p className="text-sm text-muted-foreground">
                          {studentEmail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Course Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">{course._id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tenant ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">
                {course.tenant}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base mt-1">
                {new Date(course.createdAt).toLocaleString()}
              </p>
            </div>
            {course.createdBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created By
                </p>
                <p className="text-sm font-mono mt-1 break-all">
                  {course.createdBy}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
