import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "crypto";
import {
  AdminLoginBody,
  UpdateReservationBody,
} from "@workspace/api-zod";
import { reservations } from "./reservations";

const router: IRouter = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@tomalounge.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

const tokens: Set<string> = new Set();

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  if (!tokens.has(token)) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  next();
}

router.post("/admin/login", (req: Request, res: Response) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = randomUUID();
  tokens.add(token);
  res.json({ accessToken: token });
});

router.get("/admin/reservations", authMiddleware, (_req: Request, res: Response) => {
  const list = Array.from(reservations.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(list);
});

router.patch("/admin/reservations/:id", authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const reservation = reservations.get(id);
  if (!reservation) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  const parsed = UpdateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updated = { ...reservation, ...parsed.data };
  reservations.set(id, updated);
  res.json(updated);
});

router.delete("/admin/reservations/:id", authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  if (!reservations.has(id)) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }
  reservations.delete(id);
  res.status(204).send();
});

const sseClients: Map<string, Response> = new Map();

router.get("/admin/events", authMiddleware, (req: Request, res: Response) => {
  const clientId = randomUUID();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.set(clientId, res);

  req.on("close", () => {
    sseClients.delete(clientId);
  });
});

export function broadcastReservationEvent(
  eventType: "INSERT" | "UPDATE" | "DELETE",
  record: Record<string, unknown> | null,
  oldRecord: { id: string } | null
) {
  const payload = JSON.stringify({ eventType, record, oldRecord });
  sseClients.forEach((res) => {
    res.write(`data: ${payload}\n\n`);
  });
}

export default router;
