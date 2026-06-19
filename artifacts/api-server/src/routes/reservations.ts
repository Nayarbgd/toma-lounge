import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { CreateReservationBody, UpdateReservationBody } from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth.js";
import {
  sendNewReservationEmail,
  sendReservationConfirmedEmail,
} from "../lib/email.js";

const router = Router();

// ── POST /api/reservations ────────────────────────────────────────────────────
// Creates a reservation and notifies the OWNER only.
// Guest receives NO email at this stage — they get one when admin confirms.

router.post("/reservations", async (req, res) => {
  const parsed = CreateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, phone, date, partySize, occasion, notes } = parsed.data;
  const guestEmail = (parsed.data as any).email as string | undefined | null;

  const dateObj = new Date(date);
  const reservationDate = dateObj.toISOString().split("T")[0];
  const reservationTime = dateObj.toTimeString().slice(0, 8);

  const insertPayload: Record<string, unknown> = {
    name,
    phone,
    date: reservationDate,
    time: reservationTime,
    party_size: partySize,
    notes: occasion ? `${occasion}${notes ? ` — ${notes}` : ""}` : (notes ?? null),
  };

  // Store email if the column exists (requires migration 002 to be applied).
  // If the column is missing, Supabase will return a column-not-found error —
  // in that case we retry without the email field so existing users are unaffected.
  if (guestEmail) {
    insertPayload.email = guestEmail;
  }

  let data: Record<string, unknown> | null = null;

  const { data: d1, error: e1 } = await supabaseAdmin
    .from("reservations")
    .insert(insertPayload)
    .select()
    .single();

  if (e1) {
    // If column not found (migration 002 not run yet), retry without email
    if (e1.code === "PGRST204" || e1.message?.includes("email")) {
      const { email: _removed, ...payloadWithoutEmail } = insertPayload as any;
      const { data: d2, error: e2 } = await supabaseAdmin
        .from("reservations")
        .insert(payloadWithoutEmail)
        .select()
        .single();

      if (e2) {
        req.log.error({ err: e2 }, "Failed to create reservation");
        res.status(500).json({ error: "Failed to create reservation" });
        return;
      }
      req.log.warn("Email column missing — stored reservation without email (run migration 002)");
      data = d2 as Record<string, unknown>;
    } else {
      req.log.error({ err: e1 }, "Failed to create reservation");
      res.status(500).json({ error: "Failed to create reservation" });
      return;
    }
  } else {
    data = d1 as Record<string, unknown>;
  }

  // Owner notification only — guest receives nothing at creation time
  try {
    await sendNewReservationEmail({
      id: String(data.id),
      name: data.name as string,
      phone: data.phone as string,
      date: data.date as string,
      time: data.time as string,
      partySize: data.party_size as number,
      notes: (data.notes as string | null) ?? null,
      status: (data.status as string) ?? "pending",
    });
  } catch (emailErr) {
    req.log.error({ err: emailErr }, "Owner notification email failed (non-fatal)");
  }

  res.status(201).json(toReservationResponse(data));
});

// ── GET /api/reservations ─────────────────────────────────────────────────────

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

// ── DELETE /api/reservations/:id ──────────────────────────────────────────────

router.delete("/reservations/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from("reservations")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "PGRST116") {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    req.log.error({ err: error }, "Failed to delete reservation");
    res.status(500).json({ error: "Failed to delete reservation" });
    return;
  }

  res.status(204).send();
});

// ── PATCH /api/reservations/:id ───────────────────────────────────────────────
// Updates status/notes.
// If the transition is (any → "confirmed"), sends ONE confirmation email to guest.

router.patch("/reservations/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const parsed = UpdateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const newStatus = parsed.data.status;

  // 1. Fetch the current record first to get previousStatus and guestEmail
  const { data: current, error: fetchError } = await supabaseAdmin
    .from("reservations")
    .select("id, status, email, name, phone, date, time, party_size, notes")
    .eq("id", id)
    .single();

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    req.log.error({ err: fetchError }, "Failed to fetch reservation before update");
    res.status(500).json({ error: "Failed to fetch reservation" });
    return;
  }

  const previousStatus = current.status as string;

  // 2. Build update payload
  const updatePayload: Record<string, unknown> = { status: newStatus };
  if (parsed.data.notes !== undefined) {
    updatePayload.notes = parsed.data.notes;
  }

  // 3. Apply the update
  const { data: updated, error: updateError } = await supabaseAdmin
    .from("reservations")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    if (updateError.code === "PGRST116") {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    req.log.error({ err: updateError }, "Failed to update reservation");
    res.status(500).json({ error: "Failed to update reservation" });
    return;
  }

  // Send response immediately — email is fire-and-forget
  res.json(toReservationResponse(updated as Record<string, unknown>));

  // 4. Send confirmation email to guest ONLY when transitioning → "confirmed"
  //    and ONLY if it wasn't already confirmed (prevents duplicates)
  if (previousStatus !== "confirmed" && newStatus === "confirmed") {
    const guestEmail = current.email as string | null | undefined;

    if (guestEmail) {
      try {
        await sendReservationConfirmedEmail({
          name: current.name as string,
          phone: current.phone as string,
          date: current.date as string,
          time: current.time as string,
          partySize: current.party_size as number,
          notes: (current.notes as string | null) ?? null,
          guestEmail,
        });
      } catch (emailErr) {
        req.log.error({ err: emailErr }, "Guest confirmed email failed (non-fatal)");
      }
    } else {
      req.log.info(
        { id },
        "Reservation confirmed but no guest email on file — skipping confirmation email"
      );
    }
  }
});

// ── Helper ────────────────────────────────────────────────────────────────────

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
