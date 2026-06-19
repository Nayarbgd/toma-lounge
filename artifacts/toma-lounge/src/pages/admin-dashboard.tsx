import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useListReservations,
  useUpdateReservation,
  useDeleteReservation,
  getListReservationsQueryKey,
  type Reservation,
} from "@workspace/api-client-react";
import {
  format,
  isToday,
  isThisWeek,
  addHours,
  parseISO,
  formatDistanceToNow,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  isEqual,
} from "date-fns";
import {
  LogOut, Trash2, Wifi, Search, Download, CheckCircle2, XCircle,
  ChevronUp, ChevronDown, Users, Calendar, Clock, AlertTriangle,
  ChevronsUpDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservationsRealtime } from "@/hooks/use-reservations-realtime";

type DateFilter = "today" | "week" | "all" | "custom";
type SortField = "date" | "partySize";
type SortDir = "asc" | "desc";

const ALL_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;

function getStatusColor(status: string) {
  switch (status) {
    case "pending":   return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "confirmed": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
    case "completed": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    default:          return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className={`rounded-xl border bg-card p-4 flex flex-col gap-1 ${accent ?? "border-border/40"}`}>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={`text-3xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function AdminDashboard() {
  const { isAuthenticated, clearToken, getToken } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = getToken();

  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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
  const deleteMutation = useDeleteReservation({ request: { headers: authHeaders } });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming2h = addHours(now, 2);
    const todayCount = allReservations.filter(r => isToday(parseISO(r.date))).length;
    const weekCount = allReservations.filter(r => isThisWeek(parseISO(r.date), { weekStartsOn: 1 })).length;
    const pending = allReservations.filter(r => r.status === "pending").length;
    const confirmed = allReservations.filter(r => r.status === "confirmed").length;
    const cancelled = allReservations.filter(r => r.status === "cancelled").length;
    const completed = allReservations.filter(r => r.status === "completed").length;
    const upcoming = allReservations.filter(r => {
      const d = parseISO(r.date);
      return (r.status === "pending" || r.status === "confirmed") &&
        (isAfter(d, now) || isEqual(d, now)) &&
        (isBefore(d, upcoming2h) || isEqual(d, upcoming2h));
    });
    return { todayCount, weekCount, pending, confirmed, cancelled, completed, upcoming };
  }, [allReservations]);

  // ── Filtered + sorted reservations ────────────────────────────────────────
  const filteredReservations = useMemo(() => {
    let list = [...allReservations];

    // Date filter
    if (dateFilter === "today") {
      list = list.filter(r => isToday(parseISO(r.date)));
    } else if (dateFilter === "week") {
      list = list.filter(r => isThisWeek(parseISO(r.date), { weekStartsOn: 1 }));
    } else if (dateFilter === "custom" && customStart && customEnd) {
      const s = startOfDay(parseISO(customStart));
      const e = endOfDay(parseISO(customEnd));
      list = list.filter(r => {
        const d = parseISO(r.date);
        return (isAfter(d, s) || isEqual(d, s)) && (isBefore(d, e) || isEqual(d, e));
      });
    }

    // Status filter
    if (statusFilters.length > 0) {
      list = list.filter(r => statusFilters.includes(r.status));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) || r.phone.includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "partySize") {
        cmp = a.partySize - b.partySize;
      } else {
        cmp = a.date.localeCompare(b.date);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [allReservations, dateFilter, customStart, customEnd, statusFilters, searchQuery, sortField, sortDir]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  const handleInsert = useCallback((record: Record<string, unknown>) => {
    const incoming = record as unknown as Reservation;
    queryClient.setQueryData<Reservation[]>(queryKey, (prev) => {
      if (!prev) return [incoming];
      if (prev.some(r => r.id === incoming.id)) return prev;
      return [incoming, ...prev];
    });
    toast({ title: "New reservation", description: `${incoming.name} — ${incoming.partySize} guests on ${format(parseISO(incoming.date), "MMM d, h:mm a")}` });
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

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleStatusChange = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => toast({ title: "Status updated" }),
      onError: (e) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteMutation.mutate({ id: deleteTargetId }, {
      onSuccess: () => { toast({ title: "Reservation deleted" }); setDeleteTargetId(null); },
      onError: (e) => { toast({ title: "Delete failed", description: e.message, variant: "destructive" }); setDeleteTargetId(null); },
    });
  };

  const handleBulkConfirm = async () => {
    const pending = filteredReservations.filter(r => selectedIds.has(r.id) && r.status === "pending");
    if (pending.length === 0) return;
    let successCount = 0;
    for (const r of pending) {
      try {
        await new Promise<void>((resolve, reject) => {
          updateMutation.mutate({ id: r.id, data: { status: "confirmed" as any } }, { onSuccess: () => resolve(), onError: reject });
        });
        successCount++;
      } catch {}
    }
    toast({ title: `${successCount} reservation${successCount !== 1 ? "s" : ""} confirmed` });
    setSelectedIds(new Set());
  };

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ["Name", "Phone", "Date", "Time", "Party Size", "Notes", "Status", "Booked At"];
    const rows = filteredReservations.map(r => {
      const d = parseISO(r.date);
      return [
        `"${r.name}"`,
        `"${r.phone}"`,
        format(d, "yyyy-MM-dd"),
        format(d, "HH:mm"),
        r.partySize,
        `"${r.notes ?? ""}"`,
        r.status,
        r.createdAt ? format(parseISO(r.createdAt), "yyyy-MM-dd HH:mm") : "",
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toma-lounge-reservations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Toggle helpers ─────────────────────────────────────────────────────────
  const toggleStatusFilter = (s: string) => {
    setStatusFilters(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const allVisibleSelected = filteredReservations.length > 0 && filteredReservations.every(r => selectedIds.has(r.id));
  const toggleSelectAll = () => {
    if (allVisibleSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredReservations.map(r => r.id)));
  };

  const selectedPendingCount = filteredReservations.filter(r => selectedIds.has(r.id) && r.status === "pending").length;

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

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">

        {/* ── Stats Overview ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Today" value={stats.todayCount} sub="reservations" accent="border-primary/30" />
          <StatCard label="This Week" value={stats.weekCount} sub="reservations" />
          <StatCard label="Pending" value={stats.pending} sub="need attention" accent={stats.pending > 0 ? "border-yellow-500/30" : "border-border/40"} />
          <StatCard label="Upcoming 2h" value={stats.upcoming.length} sub={stats.upcoming.length > 0 ? "prep tables" : "no upcoming"} accent={stats.upcoming.length > 0 ? "border-primary/40" : "border-border/40"} />
        </div>

        {/* Status breakdown chips */}
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(s => (
            <span key={s} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(s)}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}: {allReservations.filter(r => r.status === s).length}
            </span>
          ))}
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
                    {r.name} · {r.partySize} guests · {format(parseISO(r.date), "h:mm a")} · <span className={`capitalize ${r.status === "pending" ? "text-yellow-500" : "text-green-500"}`}>{r.status}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Reservations Panel ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Reservations</h2>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs h-8">
              <Download className="w-3.5 h-3.5" />Export CSV
            </Button>
          </div>

          {/* Date tabs */}
          <div className="flex gap-1 p-1 bg-muted/40 rounded-lg w-fit">
            {(["today", "week", "all", "custom"] as DateFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize
                  ${dateFilter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f === "week" ? "This Week" : f}
              </button>
            ))}
          </div>

          {/* Custom date range */}
          {dateFilter === "custom" && (
            <div className="flex gap-2 items-center flex-wrap">
              <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-auto h-8 text-xs" />
              <span className="text-muted-foreground text-xs">to</span>
              <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-auto h-8 text-xs" />
            </div>
          )}

          {/* Status toggles + search row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors capitalize
                    ${statusFilters.includes(s) ? getStatusColor(s) + " border-opacity-100" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
                >
                  {s}
                </button>
              ))}
              {statusFilters.length > 0 && (
                <button onClick={() => setStatusFilters([])} className="px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              )}
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search name or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-primary/30 bg-primary/5">
              <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
              {selectedPendingCount > 0 && (
                <Button size="sm" className="h-7 text-xs gap-1" onClick={handleBulkConfirm} disabled={updateMutation.isPending}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm {selectedPendingCount} Pending
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading reservations…</div>
          ) : (
            <>
              {/* ── Desktop Table ── */}
              <div className="hidden md:block rounded-lg border border-border/40 bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="w-10">
                        <Checkbox checked={allVisibleSelected} onCheckedChange={toggleSelectAll} />
                      </TableHead>
                      <TableHead>
                        <button onClick={() => toggleSort("date")} className="flex items-center gap-1 text-xs font-semibold hover:text-foreground">
                          Guest <SortIcon field="date" />
                        </button>
                      </TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>
                        <button onClick={() => toggleSort("date")} className="flex items-center gap-1 text-xs font-semibold hover:text-foreground">
                          Date & Time <SortIcon field="date" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button onClick={() => toggleSort("partySize")} className="flex items-center gap-1 text-xs font-semibold hover:text-foreground">
                          <Users className="w-3 h-3" /><SortIcon field="partySize" />
                        </button>
                      </TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map(res => (
                      <TableRow key={res.id} className={`border-border/40 hover:bg-muted/30 ${selectedIds.has(res.id) ? "bg-primary/5" : ""}`}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(res.id)}
                            onCheckedChange={(v) => {
                              setSelectedIds(prev => {
                                const next = new Set(prev);
                                v ? next.add(res.id) : next.delete(res.id);
                                return next;
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{res.name}</div>
                          {res.createdAt && (
                            <div className="text-xs text-muted-foreground">
                              Booked {formatDistanceToNow(parseISO(res.createdAt), { addSuffix: true })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{res.phone}</TableCell>
                        <TableCell>
                          <div className="text-sm">{format(parseISO(res.date), "MMM d, yyyy")}</div>
                          <div className="text-xs text-muted-foreground">{format(parseISO(res.date), "h:mm a")}</div>
                        </TableCell>
                        <TableCell className="text-sm">{res.partySize}</TableCell>
                        <TableCell className="max-w-[160px] truncate text-sm" title={res.notes ?? ""}>{res.notes ?? "—"}</TableCell>
                        <TableCell>
                          <Select value={res.status} onValueChange={(val) => handleStatusChange(res.id, val)}>
                            <SelectTrigger className={`h-7 w-[120px] text-xs ${getStatusColor(res.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {res.status === "pending" && (
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-green-500 hover:bg-green-500/10"
                                title="Confirm"
                                onClick={() => handleStatusChange(res.id, "confirmed")}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            {(res.status === "pending" || res.status === "confirmed") && (
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-red-400 hover:bg-red-500/10"
                                title="Cancel"
                                onClick={() => handleStatusChange(res.id, "cancelled")}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              title="Delete"
                              onClick={() => setDeleteTargetId(res.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredReservations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground hover:bg-transparent">
                          No reservations found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* ── Mobile Cards ── */}
              <div className="md:hidden space-y-3">
                {filteredReservations.map(res => (
                  <Card
                    key={res.id}
                    className={`border-border/40 bg-card ${selectedIds.has(res.id) ? "border-primary/40 bg-primary/5" : ""}`}
                  >
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Checkbox
                            checked={selectedIds.has(res.id)}
                            onCheckedChange={(v) => {
                              setSelectedIds(prev => {
                                const next = new Set(prev);
                                v ? next.add(res.id) : next.delete(res.id);
                                return next;
                              });
                            }}
                            className="mt-0.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate">{res.name}</CardTitle>
                            <div className="text-xs text-muted-foreground mt-0.5">{res.phone}</div>
                            {res.createdAt && (
                              <div className="text-xs text-muted-foreground">
                                Booked {formatDistanceToNow(parseISO(res.createdAt), { addSuffix: true })}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(res.status)} text-xs shrink-0 capitalize`}>
                          {res.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Date</div>
                          <div className="font-medium">{format(parseISO(res.date), "MMM d")}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Time</div>
                          <div className="font-medium">{format(parseISO(res.date), "h:mm a")}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Guests</div>
                          <div className="font-medium">{res.partySize}</div>
                        </div>
                      </div>
                      {res.notes && (
                        <div className="text-xs text-muted-foreground border-t border-border/30 pt-2">{res.notes}</div>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        {res.status === "pending" && (
                          <Button
                            size="sm" className="h-8 flex-1 gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
                            variant="ghost"
                            onClick={() => handleStatusChange(res.id, "confirmed")}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />Confirm
                          </Button>
                        )}
                        {(res.status === "pending" || res.status === "confirmed") && (
                          <Button
                            size="sm" className="h-8 flex-1 gap-1 text-red-400 hover:bg-red-500/10 border border-red-500/20"
                            variant="ghost"
                            onClick={() => handleStatusChange(res.id, "cancelled")}
                          >
                            <XCircle className="w-3.5 h-3.5" />Cancel
                          </Button>
                        )}
                        <Select value={res.status} onValueChange={(val) => handleStatusChange(res.id, val)}>
                          <SelectTrigger className={`h-8 text-xs flex-1 ${getStatusColor(res.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                          onClick={() => setDeleteTargetId(res.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredReservations.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground border border-border/40 rounded-lg bg-card">
                    No reservations found.
                  </div>
                )}
              </div>

              {/* Count footer */}
              {filteredReservations.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing {filteredReservations.length} reservation{filteredReservations.length !== 1 ? "s" : ""}
                </p>
              )}
            </>
          )}
        </div>
      </main>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(o) => { if (!o) setDeleteTargetId(null); }}>
        <AlertDialogContent className="bg-card border-border/40">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reservation?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background border-border/40">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
