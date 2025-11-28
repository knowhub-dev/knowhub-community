'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface ResourcePoint {
  timestamp: string;
  value: number;
}

interface ResourceChartProps {
  title: string;
  data: ResourcePoint[];
  unit?: string;
  color?: string;
}

const formatLabel = (label: string) => new Date(label).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

export function ResourceChart({ title, data, unit = '%', color = '#8b5cf6' }: ResourceChartProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 dark:bg-gray-900/40 shadow-lg backdrop-blur-md">
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>
      <div className="h-48 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="timestamp" tickFormatter={formatLabel} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} width={28} axisLine={false} tickLine={false} domain={[0, 'dataMax + 20']} />
            <Tooltip
              contentStyle={{ background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
              labelFormatter={(label) => formatLabel(label as string)}
              formatter={(value: number) => [`${value.toFixed(1)}${unit}`, title]}
            />
            <Area type="monotone" dataKey="value" stroke={color} fill={`url(#color-${title})`} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ResourceChart;
