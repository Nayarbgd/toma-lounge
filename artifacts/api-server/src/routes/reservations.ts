import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import {
  CreateReservationBody,
  ListReservationsResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: string;
  specialRequests?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
}

export const reservations: Map<string, Reservation> = new Map();

router.post("/reservations", (req: Request, res: Response) => {
  const parsed = CreateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const reservation: Reservation = {
    id: randomUUID(),
    ...parsed.data,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  reservations.set(reservation.id, reservation);
  res.status(201).json(reservation);
});

export default router;
