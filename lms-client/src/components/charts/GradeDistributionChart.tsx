import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Grade } from '../../types';

interface GradeDistributionChartProps {
  grades: Grade[];
}

export function GradeDistributionChart({ grades }: GradeDistributionChartProps) {
  if (grades.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No grade data available</p>
      </div>
    );
  }

  // Determine grade scale from data
  const maxGrade = Math.max(...grades.map(g => g.value));
  const minGrade = Math.min(...grades.map(g => g.value));

  // Create buckets based on grade range
  let buckets: { range: string; count: number }[] = [];

  if (maxGrade <= 5) {
    // 1-5 scale
    buckets = [
      { range: '1', count: grades.filter(g => g.value >= 1 && g.value < 2).length },
      { range: '2', count: grades.filter(g => g.value >= 2 && g.value < 3).length },
      { range: '3', count: grades.filter(g => g.value >= 3 && g.value < 4).length },
      { range: '4', count: grades.filter(g => g.value >= 4 && g.value < 5).length },
      { range: '5', count: grades.filter(g => g.value >= 5).length },
    ];
  } else if (minGrade >= 6) {
    // 6-10 scale
    buckets = [
      { range: '6', count: grades.filter(g => g.value >= 6 && g.value < 7).length },
      { range: '7', count: grades.filter(g => g.value >= 7 && g.value < 8).length },
      { range: '8', count: grades.filter(g => g.value >= 8 && g.value < 9).length },
      { range: '9', count: grades.filter(g => g.value >= 9 && g.value < 10).length },
      { range: '10', count: grades.filter(g => g.value >= 10).length },
    ];
  } else {
    // 1-10 scale
    buckets = [
      { range: '1-2', count: grades.filter(g => g.value >= 1 && g.value < 3).length },
      { range: '3-4', count: grades.filter(g => g.value >= 3 && g.value < 5).length },
      { range: '5-6', count: grades.filter(g => g.value >= 5 && g.value < 7).length },
      { range: '7-8', count: grades.filter(g => g.value >= 7 && g.value < 9).length },
      { range: '9-10', count: grades.filter(g => g.value >= 9).length },
    ];
  }

  // Filter out empty buckets
  const data = buckets.filter(b => b.count > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No grade data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={buckets}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="range"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number | undefined) => [value, 'Count']}
        />
        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
