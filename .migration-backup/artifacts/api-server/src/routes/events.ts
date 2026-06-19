import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { emitter, type ReservationChangeEvent } from "../lib/realtime.js";

const router = Router();

router.get("/admin/events", requireAdmin, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(": connected\n\n");

  const listener = (event: ReservationChangeEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  emitter.on("change", listener);

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    emitter.off("change", listener);
  });
});

export default router;
