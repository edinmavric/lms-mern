import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Loader2, Users, Check } from 'lucide-react';
import { consultationsApi } from '../../lib/api/consultations';
import { enrollmentsApi } from '../../lib/api/enrollments';
import { useAuthStore } from '../../store/authStore';
import type { Consultation } from '../../types';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '../../components/ui';

export function StudentConsultationsList() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['enrollments', 'me', user?._id],
    queryFn: () => enrollmentsApi.list({ student: user?._id }),
    enabled: !!user?._id,
    staleTime: 60_000,
  });

  const myCourseIds = Array.isArray(myEnrollments)
    ? myEnrollments
        .map(e => (typeof e.course === 'string' ? e.course : e.course?._id))
        .filter(Boolean)
    : [];

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations', { upcoming: true }],
    queryFn: () => consultationsApi.list({ upcoming: true }),
  });

  const registerMutation = useMutation({
    mutationFn: (id: string) => consultationsApi.register(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
  const unregisterMutation = useMutation({
    mutationFn: (id: string) => consultationsApi.unregister(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Consultations</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Loading consultations...
        </div>
      ) : consultations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No upcoming consultations.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {consultations
            .filter((c: Consultation) => {
              if (!Array.isArray(c.courses) || myCourseIds.length === 0)
                return false;
              return c.courses.some(course =>
                myCourseIds.includes(
                  typeof course === 'string' ? course : course._id
                )
              );
            })
            .map((c: Consultation) => {
              const registered =
                Array.isArray(c.registeredStudents) &&
                c.registeredStudents.some(
                  r => typeof r.student === 'string' || !!r.student
                );
              const isFull = !!c.isFull;
              return (
                <Card key={c._id} className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{c.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(c.date).toLocaleDateString()} {c.startTime} -{' '}
                        {c.endTime}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      Room: <span className="font-medium">{c.roomNumber}</span>
                    </div>
                    <div className="text-sm flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {c.registeredStudents?.length || 0}{' '}
                      {c.maxStudents ? ` / ${c.maxStudents}` : ''}
                      {isFull && (
                        <Badge variant="warning" className="ml-2">
                          Full
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      {registered ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unregisterMutation.mutate(c._id)}
                          disabled={unregisterMutation.isPending}
                        >
                          {unregisterMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Unregister
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => registerMutation.mutate(c._id)}
                          disabled={registerMutation.isPending || isFull}
                        >
                          {registerMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Register
                        </Button>
                      )}
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
