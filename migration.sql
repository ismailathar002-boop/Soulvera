-- ============================================================
-- Soulvera Database Migration
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── PROPOSALS TABLE ─────────────────────────────────────────
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT false;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;

-- ── PROFILES TABLE — Personal ────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS build TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religious_practice TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relocate TEXT;

-- ── PROFILES TABLE — Education & Career ──────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_honors TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS islamic_education TEXT;

-- ── PROFILES TABLE — Family Background ───────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS father_occupation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mother_occupation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brothers_count INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brothers_married INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sisters_count INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sisters_educated BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_description TEXT;

-- ── PROFILES TABLE — Residence & Assets ──────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS houses_count INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS house_location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agricultural_land BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plots TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS residence_address TEXT;

-- ── PROFILES TABLE — Partner Preferences ─────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_min_age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_max_age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_height TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_education TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_profession TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_caste TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_marital_status TEXT;

-- ── PROFILES TABLE — Contact (Admin Only) ────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_number TEXT;
