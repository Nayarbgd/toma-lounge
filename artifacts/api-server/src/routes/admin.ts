import { Router } from "express";
import { supabaseAnon } from "../lib/supabase.js";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/admin/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  res.json({ accessToken: data.session.access_token });
});

export default router;
