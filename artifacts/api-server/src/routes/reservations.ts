import { Router } from "express";
import { db, reservationsTable } from "@workspace/db";
import { CreateReservationBody } from "@workspace/api-zod";

const router = Router();

router.post("/reservations", async (req, res) => {
  const parsed = CreateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, phone, date, partySize, occasion, notes } = parsed.data;
  const [reservation] = await db
    .insert(reservationsTable)
    .values({ name, phone, date, partySize, occasion: occasion ?? null, notes: notes ?? null })
    .returning();
  res.status(201).json({
    ...reservation,
    createdAt: reservation.createdAt.toISOString(),
  });
});

router.get("/reservations", async (_req, res) => {
  const reservations = await db.select().from(reservationsTable);
  res.json(
    reservations.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

export default router;
