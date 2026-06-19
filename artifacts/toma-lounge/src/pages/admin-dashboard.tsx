import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListReservations, useUpdateReservation } from "@workspace/api-client-react";
import { format } from "date-fns";
import { LogOut, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminDashboard() {
  const { isAuthenticated, clearToken, getToken } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const token = getToken();

  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: allReservations, isLoading, refetch } = useListReservations({
    request: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  const updateMutation = useUpdateReservation({
    request: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateMutation.mutate(
      { 
        id, 
        data: { status: newStatus as any } 
      },
      {
        onSuccess: () => {
          toast({
            title: "Status updated",
            description: "Reservation status has been updated successfully.",
          });
          refetch();
        },
        onError: (error) => {
          toast({
            title: "Update failed",
            description: error.message || "Could not update reservation status.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "confirmed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "completed": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const reservations = statusFilter === "all" 
    ? allReservations 
    : allReservations?.filter(r => r.status === statusFilter);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-wider text-primary">
            TOMA LOUNGE <span className="text-sm font-normal text-muted-foreground ml-2">Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearToken} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Reservations</h1>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reservations</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading reservations...</div>
        ) : (
          <>
            <div className="hidden md:block rounded-md border border-border/40 bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead>Guest</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations?.map((res) => (
                    <TableRow key={res.id} className="border-border/40 hover:bg-muted/50">
                      <TableCell className="font-medium">{res.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{res.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{format(new Date(res.date), "MMM d, yyyy")}</div>
                        <div className="text-sm text-muted-foreground">{format(new Date(res.date), "h:mm a")}</div>
                      </TableCell>
                      <TableCell>{res.partySize}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={res.notes || ""}>
                        {res.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={res.status}
                          onValueChange={(val) => handleStatusChange(res.id, val)}
                        >
                          <SelectTrigger className={`h-8 w-[130px] text-xs ${getStatusColor(res.status)}`}>
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
                    </TableRow>
                  ))}
                  {(!reservations || reservations.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground hover:bg-transparent">
                        No reservations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden space-y-4">
              {reservations?.map((res) => (
                <Card key={res.id} className="border-border/40 bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{res.name}</CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">{res.phone}</div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(res.status)}>
                        {res.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                      <div>
                        <div className="text-muted-foreground text-xs">Date</div>
                        <div>{format(new Date(res.date), "MMM d, yyyy")}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Time</div>
                        <div>{format(new Date(res.date), "h:mm a")}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Party Size</div>
                        <div>{res.partySize} people</div>
                      </div>
                    </div>
                    {res.notes && (
                      <div>
                        <div className="text-muted-foreground text-xs">Notes</div>
                        <div className="text-sm">{res.notes}</div>
                      </div>
                    )}
                    <div className="pt-2 border-t border-border/40">
                      <Select
                        value={res.status}
                        onValueChange={(val) => handleStatusChange(res.id, val)}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!reservations || reservations.length === 0) && (
                <div className="text-center py-12 text-muted-foreground border border-border/40 rounded-lg bg-card">
                  No reservations found.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
