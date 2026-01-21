import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { Attendance } from '../../types';

interface AttendanceStatusChartProps {
  attendances: Attendance[];
}

const COLORS: Record<string, string> = {
  Present: '#22c55e',
  Absent: '#ef4444',
  Late: '#f59e0b',
  Excused: '#6b7280',
};

export function AttendanceStatusChart({
  attendances,
}: AttendanceStatusChartProps) {
  const data = [
    {
      name: 'Present',
      value: attendances.filter(a => a.status === 'present').length,
    },
    {
      name: 'Absent',
      value: attendances.filter(a => a.status === 'absent').length,
    },
    {
      name: 'Late',
      value: attendances.filter(a => a.status === 'late').length,
    },
    {
      name: 'Excused',
      value: attendances.filter(a => a.status === 'excused').length,
    },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No attendance data available</p>
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
