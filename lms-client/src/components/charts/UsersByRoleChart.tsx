import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { User } from '../../types';

interface UsersByRoleChartProps {
  users: User[];
}

const COLORS: Record<string, string> = {
  Admin: '#ef4444',
  Professor: '#3b82f6',
  Student: '#22c55e',
};

export function UsersByRoleChart({ users }: UsersByRoleChartProps) {
  const data = [
    { name: 'Admin', value: users.filter(u => u.role === 'admin').length },
    {
      name: 'Professor',
      value: users.filter(u => u.role === 'professor').length,
    },
    { name: 'Student', value: users.filter(u => u.role === 'student').length },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No user data available</p>
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
