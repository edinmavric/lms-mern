import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ActivityLogStats } from '../../types';

interface ActivityChartProps {
  stats: ActivityLogStats | undefined;
}

export function ActivityChart({ stats }: ActivityChartProps) {
  if (!stats || !stats.entityTypeStats || stats.entityTypeStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No activity data available</p>
      </div>
    );
  }

  // Transform entity type stats to chart data, sorted by count
  const data = stats.entityTypeStats
    .map(item => ({
      name: item._id,
      count: item.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Show top 8 entity types

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number | undefined) => [value, 'Actions']}
        />
        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
