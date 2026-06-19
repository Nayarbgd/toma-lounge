-- =============================================================
-- Migration 001 — Admin Features
-- Run this in Supabase → SQL Editor
-- =============================================================

-- 1. Business Hours (per day of week)
CREATE TABLE IF NOT EXISTS business_hours (
  id            serial PRIMARY KEY,
  day_of_week   integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun,1=Mon...6=Sat
  is_closed     boolean NOT NULL DEFAULT false,
  open_time     time,          -- NULL when is_closed = true
  close_time    time,          -- NULL when is_closed = true
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day_of_week)
);

-- Seed default hours: open every day 08:00–03:00
INSERT INTO business_hours (day_of_week, is_closed, open_time, close_time)
VALUES
  (0, false, '08:00', '03:00'),
  (1, false, '08:00', '03:00'),
  (2, false, '08:00', '03:00'),
  (3, false, '08:00', '03:00'),
  (4, false, '08:00', '03:00'),
  (5, false, '08:00', '03:00'),
  (6, false, '08:00', '03:00')
ON CONFLICT (day_of_week) DO NOTHING;

-- 2. Blocked Dates (whole days unavailable)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id         serial PRIMARY KEY,
  date       date NOT NULL UNIQUE,
  reason     text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Blocked Time Slots (partial day blocks)
CREATE TABLE IF NOT EXISTS blocked_time_slots (
  id         serial PRIMARY KEY,
  date       date NOT NULL,
  start_time time NOT NULL,
  end_time   time NOT NULL,
  reason     text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- 4. Restaurant Tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  capacity   integer NOT NULL CHECK (capacity > 0),
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed some default tables
INSERT INTO restaurant_tables (name, capacity) VALUES
  ('Table 1', 2),
  ('Table 2', 2),
  ('Table 3', 4),
  ('Table 4', 4),
  ('Table 5', 6),
  ('Table 6', 6),
  ('Table 7', 8),
  ('VIP Room', 12)
ON CONFLICT DO NOTHING;

-- 5. Table Assignments (reservation ↔ table)
CREATE TABLE IF NOT EXISTS table_assignments (
  id             serial PRIMARY KEY,
  reservation_id integer NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  table_id       integer NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  assigned_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reservation_id)  -- one table per reservation for V1
);

-- 6. Restaurant Settings (single-row config)
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id                    integer PRIMARY KEY DEFAULT 1,
  reservations_enabled  boolean NOT NULL DEFAULT true,
  updated_at            timestamptz NOT NULL DEFAULT now(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  CHECK (id = 1)  -- enforce single row
);

INSERT INTO restaurant_settings (id, reservations_enabled)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Enable Row Level Security (recommended for Supabase)
-- =============================================================

ALTER TABLE business_hours       ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables     ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings   ENABLE ROW LEVEL SECURITY;

-- Public read access for reservation form validation
CREATE POLICY "public_read_business_hours"    ON business_hours     FOR SELECT USING (true);
CREATE POLICY "public_read_blocked_dates"     ON blocked_dates      FOR SELECT USING (true);
CREATE POLICY "public_read_blocked_slots"     ON blocked_time_slots FOR SELECT USING (true);
CREATE POLICY "public_read_settings"          ON restaurant_settings FOR SELECT USING (true);

-- Service role bypasses RLS automatically (used by api-server with service_role key)
