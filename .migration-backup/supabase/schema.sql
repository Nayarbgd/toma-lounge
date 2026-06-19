-- =============================================================================
-- Toma Lounge — Supabase Reservations Schema
-- Run this in the Supabase SQL Editor before deploying the app.
-- =============================================================================

-- Create the reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  phone       TEXT        NOT NULL,
  date        DATE        NOT NULL,
  time        TIME        NOT NULL,
  party_size  INTEGER     NOT NULL CHECK (party_size >= 1 AND party_size <= 50),
  notes       TEXT,
  status      TEXT        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant table-level privileges to the roles used by this app.
-- RLS policies (below) control row-level access, but Postgres also requires
-- explicit GRANT for the role to touch the table at all.
GRANT INSERT ON public.reservations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO service_role;

-- Enable Row Level Security so only the right roles can access this table
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policy: anonymous users can INSERT new reservations (website booking form)
-- They cannot SELECT, UPDATE, or DELETE.
CREATE POLICY "anon_insert_reservations"
  ON reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: service role (used only in the backend Express server, never in the browser)
-- has full SELECT access to read all reservations for the admin dashboard.
CREATE POLICY "service_role_select_reservations"
  ON reservations
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: service role can UPDATE reservations (for status changes and notes from admin dashboard).
CREATE POLICY "service_role_update_reservations"
  ON reservations
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: service role can DELETE reservations if needed.
CREATE POLICY "service_role_delete_reservations"
  ON reservations
  FOR DELETE
  TO service_role
  USING (true);

-- Index on date for efficient filtering and sorting in the admin dashboard
CREATE INDEX IF NOT EXISTS reservations_date_idx ON reservations (date DESC, time DESC);

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS reservations_status_idx ON reservations (status);
