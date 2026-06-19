import { useEffect } from "react";

export interface ReservationChangeEvent {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  record: Record<string, unknown> | null;
  oldRecord: { id: string } | null;
}

interface Options {
  token: string | null;
  onInsert: (record: Record<string, unknown>) => void;
  onUpdate: (record: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}

export function useReservationsRealtime({
  token,
  onInsert,
  onUpdate,
  onDelete,
}: Options) {
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    let buffer = "";

    (async () => {
      try {
        const response = await fetch("/api/admin/events", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const messages = buffer.split("\n\n");
          buffer = messages.pop() ?? "";

          for (const message of messages) {
            const dataLine = message
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!dataLine) continue;
            try {
              const payload: ReservationChangeEvent = JSON.parse(
                dataLine.slice(6)
              );
              if (payload.eventType === "INSERT" && payload.record) {
                onInsert(payload.record);
              } else if (payload.eventType === "UPDATE" && payload.record) {
                onUpdate(payload.record);
              } else if (
                payload.eventType === "DELETE" &&
                payload.oldRecord?.id
              ) {
                onDelete(payload.oldRecord.id);
              }
            } catch {
              // malformed JSON — skip
            }
          }
        }
      } catch {
        // Aborted or network error — no-op
      }
    })();

    return () => controller.abort();
  }, [token]);
}
