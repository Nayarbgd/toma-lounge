import { Router } from "express";
import { supabaseAnon, supabaseAdmin } from "../lib/supabase.js";
import { CreateReservationBody, UpdateReservationBody } from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/reservations", async (req, res) => {
  const parsed = CreateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, phone, date, partySize, occasion, notes } = parsed.data;

  const dateObj = new Date(date);
  const reservationDate = dateObj.toISOString().split("T")[0];
  const reservationTime = dateObj.toTimeString().slice(0, 8);

  const { data, error } = await supabaseAnon
    .from("reservations")
    .insert({
      name,
      phone,
      date: reservationDate,
      time: reservationTime,
      party_size: partySize,
      notes: occasion ? `${occasion}${notes ? ` — ${notes}` : ""}` : (notes ?? null),
    })
    .select()
    .single();

  if (error) {
    req.log.error({ err: error }, "Failed to create reservation");
    res.status(500).json({ error: "Failed to create reservation" });
    return;
  }

  res.status(201).json(toReservationResponse(data));
});

router.get("/reservations", requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) {
    req.log.error({ err: error }, "Failed to list reservations");
    res.status(500).json({ error: "Failed to list reservations" });
    return;
  }

  res.json((data ?? []).map(toReservationResponse));
});

router.patch("/reservations/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const parsed = UpdateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updatePayload: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.notes !== undefined) {
    updatePayload.notes = parsed.data.notes;
  }

  const { data, error } = await supabaseAdmin
    .from("reservations")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    req.log.error({ err: error }, "Failed to update reservation");
    res.status(500).json({ error: "Failed to update reservation" });
    return;
  }

  res.json(toReservationResponse(data));
});

function toReservationResponse(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: row.name,
    phone: row.phone,
    date: row.date && row.time ? `${row.date}T${row.time}` : String(row.date ?? ""),
    partySize: row.party_size,
    occasion: null,
    notes: row.notes ?? null,
    status: row.status ?? "pending",
    createdAt: row.created_at
      ? new Date(row.created_at as string).toISOString()
      : new Date().toISOString(),
  };
}

export default router;
