import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import {
  useListReservations,
  useUpdateReservation,
  getListReservationsQueryKey,
  type Reservation,
} from "@workspace/api-client-react";
import {
  format, isToday, isThisWeek, addHours, parseISO, isAfter, isBefore, isEqual,
} from "date-fns";
import {
  LogOut, Wifi, LayoutDashboard, CalendarDays, BarChart2,
  TableProperties, Settings, List, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservationsRealtime } from "@/hooks/use-reservations-realtime";
import { ReservationsTab } from "./admin-reservations-tab";
import { CalendarTab } from "./admin-calendar-tab";
import { AnalyticsTab } from "./admin-analytics-tab";

type DashboardTab = "overview" | "reservations" | "calendar" | "analytics" | "tables" | "settings";

const TABS: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",     label: "Overview",     icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "reservations", label: "Reservations", icon: <List className="w-4 h-4" /> },
  { id: "calendar",     label: "Calendar",     icon: <CalendarDays className="w-4 h-4" /> },
  { id: "analytics",    label: "Analytics",    icon: <BarChart2 className="w-4 h-4" /> },
  { id: "tables",       label: "Tables",       icon: <TableProperties className="w-4 h-4" /> },
  { id: "settings",     label: "Settings",     icon: <Settings className="w-4 h-4" /> },
];

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className={`rounded-xl border bg-card p-4 flex flex-col gap-1 ${accent ?? "border-border/40"}`}>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={`text-3xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function ComingSoonTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="p-4 rounded-full bg-muted/40"><Settings className="w-8 h-8 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      <div className="mt-2 px-4 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-500 max-w-sm">
        Run <code className="font-mono">migrations/001_admin_features.sql</code> in Supabase SQL Editor to unlock this section.
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { isAuthenticated, clearToken, getToken } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = getToken();

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) setLocation("/admin/login");
  }, [isAuthenticated, setLocation]);

  const authHeaders = { Authorization: `Bearer ${token}` };
  const queryKey = getListReservationsQueryKey();

  const { data: allReservations = [], isLoading } = useListReservations({
    request: { headers: authHeaders },
  });

  const updateMutation = useUpdateReservation({ request: { headers: authHeaders } });

  const handleStatusChange = useCallback((id: string, newStatus: string) => {
    updateMutation.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: (updated: Reservation) => {
        queryClient.setQueryData<Reservation[]>(queryKey, (prev) =>
          prev ? prev.map(r => r.id === updated.id ? updated : r) : prev
        );
        toast({ title: "Status updated" });
      },
      onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
    });
  }, [updateMutation, queryClient, queryKey, toast]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  const handleInsert = useCallback((record: Record<string, unknown>) => {
    const incoming = record as unknown as Reservation;
    queryClient.setQueryData<Reservation[]>(queryKey, (prev) => {
      if (!prev) return [incoming];
      if (prev.some(r => r.id === incoming.id)) return prev;
      return [incoming, ...prev];
    });
    toast({
      title: "New reservation",
      description: `${incoming.name} — ${incoming.partySize} guests on ${format(parseISO(incoming.date), "MMM d, h:mm a")}`,
    });
    setRealtimeConnected(true);
  }, [queryClient, queryKey, toast]);

  const handleUpdate = useCallback((record: Record<string, unknown>) => {
    const updated = record as unknown as Reservation;
    queryClient.setQueryData<Reservation[]>(queryKey, (prev) =>
      prev ? prev.map(r => r.id === updated.id ? { ...r, ...updated } : r) : prev
    );
    setRealtimeConnected(true);
  }, [queryClient, queryKey]);

  const handleDelete = useCallback((id: string) => {
    queryClient.setQueryData<Reservation[]>(queryKey, (prev) =>
      prev ? prev.filter(r => r.id !== id) : prev
    );
    setRealtimeConnected(true);
  }, [queryClient, queryKey]);

  useReservationsRealtime({ token, onInsert: handleInsert, onUpdate: handleUpdate, onDelete: handleDelete });

  // ── Overview stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming2h = addHours(now, 2);
    return {
      todayCount: allReservations.filter(r => isToday(parseISO(r.date))).length,
      weekCount: allReservations.filter(r => isThisWeek(parseISO(r.date), { weekStartsOn: 1 })).length,
      pending: allReservations.filter(r => r.status === "pending").length,
      confirmed: allReservations.filter(r => r.status === "confirmed").length,
      cancelled: allReservations.filter(r => r.status === "cancelled").length,
      completed: allReservations.filter(r => r.status === "completed").length,
      upcoming: allReservations.filter(r => {
        const d = parseISO(r.date);
        return (r.status === "pending" || r.status === "confirmed") &&
          (isAfter(d, now) || isEqual(d, now)) &&
          (isBefore(d, upcoming2h) || isEqual(d, upcoming2h));
      }),
    };
  }, [allReservations]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-wider text-primary">TOMA LOUNGE</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">/ Admin</span>
            {realtimeConnected && (
              <div className="flex items-center gap-1 text-xs text-green-500 ml-1">
                <Wifi className="w-3 h-3" /><span className="hidden sm:inline">Live</span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={clearToken} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-1.5" />Sign Out
          </Button>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <div className="border-b border-border/40 bg-background/95 sticky top-14 z-40">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto scrollbar-none -mb-px gap-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors shrink-0
                  ${activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
                  }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 container mx-auto px-4 py-6">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Overview</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Today" value={stats.todayCount} sub="reservations" accent="border-primary/30" />
              <StatCard label="This Week" value={stats.weekCount} sub="reservations" />
              <StatCard label="Pending" value={stats.pending} sub="need attention"
                accent={stats.pending > 0 ? "border-yellow-500/30" : "border-border/40"} />
              <StatCard label="Upcoming 2h" value={stats.upcoming.length}
                sub={stats.upcoming.length > 0 ? "prep tables" : "none upcoming"}
                accent={stats.upcoming.length > 0 ? "border-primary/40" : "border-border/40"} />
            </div>

            {/* Status breakdown */}
            <div className="flex flex-wrap gap-2">
              {(["pending", "confirmed", "cancelled", "completed"] as const).map(s => {
                const colors: Record<string, string> = {
                  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                  confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
                  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
                  completed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
                };
                return (
                  <span key={s} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors[s]}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}: {stats[s as keyof typeof stats] as number}
                  </span>
                );
              })}
            </div>

            {/* Upcoming 2h alert */}
            {stats.upcoming.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
                <AlertTriangle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary">Tables needed in the next 2 hours</p>
                  <div className="mt-1 space-y-0.5">
                    {stats.upcoming.map(r => (
                      <p key={r.id} className="text-xs text-muted-foreground">
                        {r.name} · {r.partySize} guests · {format(parseISO(r.date), "h:mm a")} ·{" "}
                        <span className={r.status === "pending" ? "text-yellow-500" : "text-green-500"}>
                          {r.status}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick jump to reservations */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setActiveTab("reservations")}>
                View All Reservations →
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setActiveTab("calendar")}>
                Open Calendar →
              </Button>
            </div>
          </div>
        )}

        {/* RESERVATIONS TAB */}
        {activeTab === "reservations" && (
          <ReservationsTab
            allReservations={allReservations}
            authHeaders={authHeaders}
            isLoading={isLoading}
          />
        )}

        {/* CALENDAR TAB */}
        {activeTab === "calendar" && (
          <CalendarTab
            allReservations={allReservations}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Analytics</h2>

            {/* Top stat cards (reused from overview) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Today" value={stats.todayCount} sub="reservations" accent="border-primary/30" />
              <StatCard label="This Week" value={stats.weekCount} sub="reservations" />
              <StatCard label="Pending" value={stats.pending} sub="need attention" />
              <StatCard label="Upcoming 2h" value={stats.upcoming.length} sub="in next 2 hours" />
            </div>

            <AnalyticsTab allReservations={allReservations} />
          </div>
        )}

        {/* TABLES TAB */}
        {activeTab === "tables" && (
          <ComingSoonTab
            title="Table Management"
            description="Configure restaurant tables, capacities, and assign tables to reservations automatically or manually."
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <ComingSoonTab
            title="Restaurant Settings"
            description="Manage business hours, blocked dates, blocked time slots, and the online reservations toggle."
          />
        )}

      </main>
    </div>
  );
}
