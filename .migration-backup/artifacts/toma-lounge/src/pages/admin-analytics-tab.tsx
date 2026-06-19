import { useMemo } from "react";
import { type Reservation } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { parseISO, getHours, getDay, format, isThisMonth } from "date-fns";
import { TrendingDown, Repeat2, Clock, BarChart2 } from "lucide-react";

interface Props {
  allReservations: Reservation[];
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12a" : i < 12 ? `${i}a` : i === 12 ? "12p" : `${i - 12}p`
);

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatPill({ icon, label, value, sub, color = "text-primary" }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg bg-primary/10 ${color}`}>{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold mt-0.5">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

const CHART_COLOR = "#2EC4D6";
const BAR_RADIUS = 4;

export function AnalyticsTab({ allReservations }: Props) {
  const analytics = useMemo(() => {
    const total = allReservations.length;
    const cancelled = allReservations.filter(r => r.status === "cancelled").length;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    // Repeat guests (same name appears 2+ times)
    const nameCounts = new Map<string, number>();
    for (const r of allReservations) {
      const key = r.name.toLowerCase().trim();
      nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
    }
    const repeatGuests = [...nameCounts.values()].filter(c => c >= 2).length;

    // Reservations by hour
    const hourCounts = Array(24).fill(0) as number[];
    for (const r of allReservations) {
      const h = getHours(parseISO(r.date));
      hourCounts[h]++;
    }
    const hourData = hourCounts.map((count, hour) => ({ hour: HOUR_LABELS[hour], count, raw: hour }));

    // Peak hour
    const peakHourIdx = hourCounts.indexOf(Math.max(...hourCounts));
    const peakHourLabel = peakHourIdx === 0 ? "12 AM"
      : peakHourIdx < 12 ? `${peakHourIdx} AM`
      : peakHourIdx === 12 ? "12 PM"
      : `${peakHourIdx - 12} PM`;

    // Reservations by day of week
    const dayCounts = Array(7).fill(0) as number[];
    for (const r of allReservations) {
      const d = getDay(parseISO(r.date));
      dayCounts[d]++;
    }
    const dayData = dayCounts.map((count, day) => ({ day: DAY_LABELS[day], count }));

    // This month
    const thisMonthCount = allReservations.filter(r => {
      try { return isThisMonth(parseISO(r.date)); } catch { return false; }
    }).length;

    return { cancellationRate, repeatGuests, peakHourLabel, hourData, dayData, thisMonthCount, total };
  }, [allReservations]);

  const peakHourCount = Math.max(...analytics.hourData.map(d => d.count));

  return (
    <div className="space-y-6">
      {/* Extra stat pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill
          icon={<TrendingDown className="w-4 h-4" />}
          label="Cancellation Rate"
          value={`${analytics.cancellationRate}%`}
          sub={`of ${analytics.total} total reservations`}
          color={analytics.cancellationRate > 20 ? "text-red-500" : "text-primary"}
        />
        <StatPill
          icon={<Repeat2 className="w-4 h-4" />}
          label="Repeat Guests"
          value={analytics.repeatGuests}
          sub="guests with 2+ bookings"
        />
        <StatPill
          icon={<Clock className="w-4 h-4" />}
          label="Peak Time Slot"
          value={analytics.peakHourLabel}
          sub="most popular booking hour"
        />
        <StatPill
          icon={<BarChart2 className="w-4 h-4" />}
          label="This Month"
          value={analytics.thisMonthCount}
          sub={`of ${analytics.total} all-time`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Hour */}
        <div className="rounded-xl border border-border/40 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Reservations by Hour</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.hourData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false}
                interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#999" }}
                formatter={(v: number) => [v, "reservations"]}
              />
              <Bar dataKey="count" radius={[BAR_RADIUS, BAR_RADIUS, 0, 0]}>
                {analytics.hourData.map((entry) => (
                  <Cell
                    key={entry.raw}
                    fill={entry.count === peakHourCount && entry.count > 0 ? "#C9A24B" : CHART_COLOR}
                    fillOpacity={entry.count === 0 ? 0.2 : 0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 text-center">Gold bar = peak hour</p>
        </div>

        {/* By Day of Week */}
        <div className="rounded-xl border border-border/40 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Reservations by Day of Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.dayData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#666" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#999" }}
                formatter={(v: number) => [v, "reservations"]}
              />
              <Bar dataKey="count" fill={CHART_COLOR} radius={[BAR_RADIUS, BAR_RADIUS, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {analytics.total === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">No reservation data yet — charts will populate as bookings come in.</div>
      )}
    </div>
  );
}
