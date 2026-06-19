-- Migration 002 — Add email column to reservations
-- Run this in Supabase → SQL Editor BEFORE deploying the email confirmation feature.
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS email text;

-- Index for any future email-based lookups
CREATE INDEX IF NOT EXISTS reservations_email_idx ON reservations (email)
  WHERE email IS NOT NULL;
