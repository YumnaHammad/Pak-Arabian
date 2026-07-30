'use client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatPKR } from '@/lib/utils';

/**
 * Daily revenue.
 *
 * A single series, one colour, no legend — the chart answers one question and
 * the axis labels carry the rest. Gridlines are pushed almost to invisible so
 * the shape of the data is what the eye lands on.
 */
export default function RevenueChart({ data = [] }) {
  const empty = data.every((d) => d.revenue === 0);

  return (
    <div className="h-[240px] w-full">
      {empty ? (
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-hairline/60">
          <p className="text-[13px] text-ink-4">No revenue in this period yet.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A227" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#C9A227" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(237,237,240,0.34)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={22}
            />
            <YAxis
              tick={{ fill: 'rgba(237,237,240,0.34)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={64}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />

            <Tooltip
              cursor={{ stroke: 'rgba(201,162,39,0.4)', strokeWidth: 1 }}
              contentStyle={{
                background: '#16161a',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 8,
                fontSize: 12,
                padding: '10px 12px',
              }}
              labelStyle={{ color: 'rgba(237,237,240,0.55)', marginBottom: 4 }}
              formatter={(value, _name, entry) => [
                formatPKR(value),
                `${entry.payload.orders} ${entry.payload.orders === 1 ? 'order' : 'orders'}`,
              ]}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#C9A227"
              strokeWidth={1.75}
              fill="url(#revenueFill)"
              dot={false}
              activeDot={{ r: 3.5, fill: '#C9A227', stroke: '#09090b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
