import { useState, useMemo } from "react";
import { type Reservation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks,
  addDays, isSameDay, isToday, getHours,
} from "date-fns";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { getStatusColor } from "./admin-reservations-tab";

type CalendarView = "week" | "day";

interface Props {
  allReservations: Reservation[];
  onStatusChange: (id: string, status: string) => void;
}

function ReservationCard({ res, compact = false }: { res: Reservation; compact?: boolean }) {
  const statusColor = getStatusColor(res.status);
  return (
    <div className={`rounded-md border p-2 text-xs space-y-0.5 cursor-default hover:bg-muted/20 transition-colors ${statusColor}`}>
      <div className="font-semibold truncate">{res.name}</div>
      <div className="flex items-center justify-between gap-1">
        <span className="opacity-80">{format(parseISO(res.date), "h:mm a")}</span>
        <span className="flex items-center gap-0.5 opacity-70">
          <Users className="w-2.5 h-2.5" />{res.partySize}
        </span>
      </div>
      {!compact && res.notes && <div className="opacity-60 truncate">{res.notes}</div>}
    </div>
  );
}

function WeekView({ weekStart, allReservations }: { weekStart: Date; allReservations: Reservation[] }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const reservationsByDay = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      map.set(
        key,
        allReservations
          .filter(r => r.date.startsWith(key))
          .sort((a, b) => a.date.localeCompare(b.date))
      );
    }
    return map;
  }, [days, allReservations]);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-1 min-w-[640px]">
        {/* Day headers */}
        {days.map(day => {
          const key = format(day, "yyyy-MM-dd");
          const count = reservationsByDay.get(key)?.length ?? 0;
          const today = isToday(day);
          return (
            <div key={key} className={`p-2 rounded-t-lg text-center ${today ? "bg-primary/10 border border-primary/30" : "bg-muted/30"}`}>
              <div className={`text-xs font-medium ${today ? "text-primary" : "text-muted-foreground"}`}>
                {format(day, "EEE")}
              </div>
              <div className={`text-xl font-bold mt-0.5 ${today ? "text-primary" : ""}`}>
                {format(day, "d")}
              </div>
              {count > 0 && (
                <div className="mt-1">
                  <span className="inline-block bg-primary/20 text-primary text-xs rounded-full px-1.5 py-0.5 font-medium">
                    {count}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Reservation cards per day */}
        {days.map(day => {
          const key = format(day, "yyyy-MM-dd");
          const dayRes = reservationsByDay.get(key) ?? [];
          const today = isToday(day);
          return (
            <div key={key + "-body"}
              className={`rounded-b-lg p-1.5 space-y-1 min-h-[120px] ${today ? "bg-primary/5 border border-t-0 border-primary/30" : "bg-card/50 border border-t-0 border-border/30"}`}>
              {dayRes.map(res => (
                <ReservationCard key={res.id} res={res} compact />
              ))}
              {dayRes.length === 0 && (
                <div className="text-xs text-muted-foreground/40 text-center pt-4">—</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayView({ date, allReservations }: { date: Date; allReservations: Reservation[] }) {
  const dateKey = format(date, "yyyy-MM-dd");
  const dayRes = allReservations
    .filter(r => r.date.startsWith(dateKey))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group by hour bucket for a simple timeline feel
  const groups = useMemo(() => {
    const buckets = new Map<number, Reservation[]>();
    for (const r of dayRes) {
      const h = getHours(parseISO(r.date));
      if (!buckets.has(h)) buckets.set(h, []);
      buckets.get(h)!.push(r);
    }
    return Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]);
  }, [dayRes]);

  if (dayRes.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border border-border/40 rounded-lg bg-card">
        No reservations on {format(date, "EEEE, MMMM d")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">{dayRes.length} reservation{dayRes.length !== 1 ? "s" : ""}</div>
      {groups.map(([hour, res]) => (
        <div key={hour} className="flex gap-3">
          <div className="w-16 shrink-0 text-right">
            <span className="text-xs text-muted-foreground font-mono">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </span>
          </div>
          <div className="flex-1 space-y-2 border-l border-border/40 pl-4">
            {res.map(r => (
              <div key={r.id} className={`rounded-lg border p-3 ${getStatusColor(r.status)}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-xs opacity-70 mt-0.5">{r.phone}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-medium">{format(parseISO(r.date), "h:mm a")}</span>
                    <span className="flex items-center gap-1 text-xs opacity-70">
                      <Users className="w-3 h-3" />{r.partySize} guests
                    </span>
                  </div>
                </div>
                {r.notes && <div className="text-xs opacity-60 mt-1.5 border-t border-current/20 pt-1.5">{r.notes}</div>}
                <Badge variant="outline" className={`mt-2 text-xs capitalize ${getStatusColor(r.status)}`}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarTab({ allReservations, onStatusChange }: Props) {
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const navigate = (dir: 1 | -1) => {
    if (view === "week") setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setCurrentDate(d => addDays(d, dir));
  };

  const goToday = () => setCurrentDate(new Date());

  const rangeLabel = view === "week"
    ? `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`
    : format(currentDate, "EEEE, MMMM d, yyyy");

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 p-1 bg-muted/40 rounded-lg">
          <button onClick={() => setView("week")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${view === "week" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            Week
          </button>
          <button onClick={() => setView("day")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${view === "day" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            Day
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <span className="text-sm font-medium">{rangeLabel}</span>

        <Button variant="ghost" size="sm" className="h-8 text-xs ml-auto" onClick={goToday}>
          Today
        </Button>
      </div>

      {/* View content */}
      {view === "week"
        ? <WeekView weekStart={weekStart} allReservations={allReservations} />
        : <DayView date={currentDate} allReservations={allReservations} />
      }
    </div>
  );
}
