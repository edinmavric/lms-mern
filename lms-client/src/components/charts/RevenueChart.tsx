import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Enrollment } from '../../types';

interface RevenueChartProps {
  enrollments: Enrollment[];
}

export function RevenueChart({ enrollments }: RevenueChartProps) {
  // Calculate total paid and pending amounts
  const payments = enrollments.flatMap(e => e.payments || []);

  const paidAmount = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (paidAmount === 0 && pendingAmount === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No payment data available</p>
      </div>
    );
  }

  const data = [
    {
      name: 'Payments',
      Paid: paidAmount,
      Pending: pendingAmount,
    },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number | undefined, name: string | undefined) => [`$${value!.toFixed(2)}`, name]}
          />
          <Legend />
          <Bar dataKey="Paid" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Pending" fill="#f59e0b" stackId="a" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Paid: ${paidAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>Pending: ${pendingAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
