import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Award, Search, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { pointsApi } from '../../lib/api/points';
import { useAuthStore } from '../../store/authStore';
import type { Point } from '../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui';

export function StudentPointsList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTitle, setSearchTitle] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('__all__');

  const { data: allPoints = [], isLoading } = useQuery({
    queryKey: ['points', 'my'],
    queryFn: () => pointsApi.list({ student: user?._id }),
    enabled: !!user?._id,
  });

  const courses = useMemo(() => {
    const courseMap = new Map();
    allPoints.forEach(point => {
      const courseId =
        typeof point.course === 'string' ? point.course : point.course._id;
      const courseName =
        typeof point.course === 'string' ? 'Unknown Course' : point.course.name;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, { _id: courseId, name: courseName });
      }
    });
    return Array.from(courseMap.values());
  }, [allPoints]);

  const filteredPoints = useMemo(() => {
    let filtered = allPoints;

    if (filterCourse && filterCourse !== '__all__') {
      filtered = filtered.filter(point => {
        const pointCourseId =
          typeof point.course === 'string' ? point.course : point.course._id;
        return pointCourseId === filterCourse;
      });
    }

    if (searchTitle) {
      filtered = filtered.filter(point =>
        point.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    return filtered;
  }, [allPoints, filterCourse, searchTitle]);

  const coursePointSummaries = useMemo(() => {
    const summaries: Array<{
      courseId: string;
      courseName: string;
      points: Point[];
      totalPoints: number;
      totalMaxPoints: number;
      averagePercentage: number;
    }> = [];

    const courseMap = new Map<string, Point[]>();

    filteredPoints.forEach(point => {
      const courseId =
        typeof point.course === 'string' ? point.course : point.course._id;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, []);
      }
      courseMap.get(courseId)!.push(point);
    });

    courseMap.forEach((points, courseId) => {
      const totalPoints = points.reduce((sum, p) => sum + p.points, 0);
      const totalMaxPoints = points.reduce((sum, p) => sum + p.maxPoints, 0);
      const averagePercentage =
        totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;

      const courseName =
        typeof points[0].course === 'string'
          ? 'Unknown Course'
          : points[0].course.name;

      summaries.push({
        courseId,
        courseName,
        points,
        totalPoints,
        totalMaxPoints,
        averagePercentage,
      });
    });

    return summaries.sort((a, b) => b.averagePercentage - a.averagePercentage);
  }, [filteredPoints]);

  const getCourseName = (point: Point) => {
    if (typeof point.course === 'string') return 'Unknown Course';
    return point.course.name;
  };

  const getPercentageBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'default';
    if (percentage >= 40) return 'warning';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Points</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View your curriculum points and assessments
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search points..."
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
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
      </div>

      {coursePointSummaries.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coursePointSummaries.map(summary => (
            <Card key={summary.courseId}>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">
                  {summary.courseName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Points
                  </p>
                  <p className="text-2xl font-bold">
                    {summary.totalPoints}/{summary.totalMaxPoints}
                  </p>
                  <div className="mt-2">
                    <Badge
                      variant={getPercentageBadgeVariant(
                        summary.averagePercentage
                      )}
                    >
                      {summary.averagePercentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Assessments
                  </p>
                  <p className="text-base font-semibold">
                    {summary.points.length}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    navigate(`/app/student/courses/${summary.courseId}`)
                  }
                >
                  View Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              All Points ({filteredPoints.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPoints.map(point => {
                const courseName = getCourseName(point);
                const pointDate = new Date(point.date);
                const percentage = (point.points / point.maxPoints) * 100;

                return (
                  <div
                    key={point._id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base">
                            {point.title}
                          </h3>
                          <Badge
                            variant={getPercentageBadgeVariant(percentage)}
                          >
                            {point.points}/{point.maxPoints}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{courseName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(pointDate, 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        {point.description && (
                          <p className="text-sm text-muted-foreground">
                            {point.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPoints.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Points Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTitle || filterCourse !== '__all__'
                ? 'No points match your search criteria.'
                : "You don't have any points assigned yet."}
            </p>
            {!searchTitle && filterCourse === '__all__' && (
              <Button onClick={() => navigate('/app/student/courses')}>
                Browse Courses
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
