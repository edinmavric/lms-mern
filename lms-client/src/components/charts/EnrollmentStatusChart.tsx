import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { Enrollment } from '../../types';

interface EnrollmentStatusChartProps {
  enrollments: Enrollment[];
}

const COLORS: Record<string, string> = {
  Active: '#22c55e',
  Completed: '#3b82f6',
  Cancelled: '#ef4444',
  Paused: '#f59e0b',
};

export function EnrollmentStatusChart({
  enrollments,
}: EnrollmentStatusChartProps) {
  const data = [
    {
      name: 'Active',
      value: enrollments.filter(e => e.status === 'active').length,
    },
    {
      name: 'Completed',
      value: enrollments.filter(e => e.status === 'completed').length,
    },
    {
      name: 'Cancelled',
      value: enrollments.filter(e => e.status === 'cancelled').length,
    },
    {
      name: 'Paused',
      value: enrollments.filter(e => e.status === 'paused').length,
    },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No enrollment data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
