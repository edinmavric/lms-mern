import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Users, Building2 } from 'lucide-react';

import { coursesApi } from '../../lib/api/courses';
import { useAuthStore } from '../../store/authStore';
import type { Course } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
} from '../../components/ui';

export function ProfessorCoursesList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', 'professor', user?._id],
    queryFn: () => coursesApi.list({ professor: user?._id }),
  });

  const filteredCourses = searchName
    ? courses.filter(course =>
        course.name.toLowerCase().includes(searchName.toLowerCase())
      )
    : courses;

  const getDepartmentName = (course: Course) => {
    if (!course.department) return null;
    if (typeof course.department === 'string') return 'Unknown Department';
    return course.department.name;
  };

  const getStudentCount = (course: Course) => {
    if (Array.isArray(course.students)) {
      return course.students.length;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          View and manage your assigned courses
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by course name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchName ? 'No courses found' : 'You have no assigned courses'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchName
                ? 'Try adjusting your search criteria'
                : 'Contact an administrator to be assigned to courses'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => {
            const departmentName = getDepartmentName(course);
            const studentCount = getStudentCount(course);

            return (
              <Card
                key={course._id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/app/professor/courses/${course._id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {course.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {departmentName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {departmentName}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {studentCount}{' '}
                        {studentCount === 1 ? 'student' : 'students'}
                      </span>
                    </div>
                    {course.price !== undefined && course.price > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">
                          ${course.price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/app/professor/courses/${course._id}`);
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
