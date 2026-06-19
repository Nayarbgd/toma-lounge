import { EventEmitter } from "events";
import { supabaseAdmin } from "./supabase.js";
import { logger } from "./logger.js";

export interface ReservationChangeEvent {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  record: Record<string, unknown> | null;
  oldRecord: { id: string } | null;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(200);

function mapRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: row.name,
    phone: row.phone,
    date:
      row.date && row.time
        ? `${row.date}T${row.time}`
        : String(row.date ?? ""),
    partySize: row.party_size,
    occasion: null,
    notes: row.notes ?? null,
    status: row.status ?? "pending",
    createdAt: row.created_at
      ? new Date(row.created_at as string).toISOString()
      : new Date().toISOString(),
  };
}

export function startRealtimeSubscription() {
  supabaseAdmin
    .channel("reservations-admin-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reservations" },
      (payload) => {
        const hasNew =
          payload.new && Object.keys(payload.new).length > 0;
        const hasOld =
          payload.old && Object.keys(payload.old).length > 0;

        const event: ReservationChangeEvent = {
          eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
          record: hasNew
            ? mapRow(payload.new as Record<string, unknown>)
            : null,
          oldRecord: hasOld
            ? { id: String((payload.old as Record<string, unknown>).id) }
            : null,
        };

        emitter.emit("change", event);
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        logger.info("Supabase Realtime subscription active on reservations");
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        logger.error({ status }, "Supabase Realtime subscription error");
      }
    });
}

export { emitter };
