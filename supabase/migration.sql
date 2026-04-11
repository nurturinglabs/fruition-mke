-- Fruition MKE Call Logs Table
-- Run this in the Supabase SQL Editor to set up the database

CREATE TABLE IF NOT EXISTS call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  caller_name TEXT,
  caller_phone TEXT,
  callback_preference TEXT,
  intent TEXT NOT NULL DEFAULT 'general_inquiry',
  event_type TEXT,
  event_date TEXT,
  event_headcount TEXT,
  special_requirements TEXT,
  coworking_type TEXT,
  notes TEXT,
  urgency TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'new',
  retell_call_id TEXT,
  call_duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_intent ON call_logs(intent);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_urgency ON call_logs(urgency);

-- Enable Row Level Security
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for webhook inserts)
DROP POLICY IF EXISTS "Service role has full access" ON call_logs;
CREATE POLICY "Service role has full access" ON call_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow anon read access (for dashboard, gated by app-level auth)
DROP POLICY IF EXISTS "Anon can read call logs" ON call_logs;
CREATE POLICY "Anon can read call logs" ON call_logs
  FOR SELECT
  USING (true);

-- =====================================================================
-- Rooms & Bookings (v1 MVP)
-- =====================================================================

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  room_id TEXT NOT NULL REFERENCES rooms(id),
  booker_name TEXT NOT NULL,
  booker_phone TEXT,
  event_type TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  headcount INTEGER NOT NULL,
  special_requirements TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  source TEXT NOT NULL DEFAULT 'manual',
  call_log_id UUID REFERENCES call_logs(id),
  notes TEXT,
  CONSTRAINT bookings_status_check CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  CONSTRAINT bookings_source_check CHECK (source IN ('agent', 'manual', 'seed')),
  CONSTRAINT bookings_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_room_date ON bookings(room_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access rooms" ON rooms;
CREATE POLICY "Service role full access rooms" ON rooms
  FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Anon can read rooms" ON rooms;
CREATE POLICY "Anon can read rooms" ON rooms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access bookings" ON bookings;
CREATE POLICY "Service role full access bookings" ON bookings
  FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Anon can read bookings" ON bookings;
CREATE POLICY "Anon can read bookings" ON bookings
  FOR SELECT USING (true);

-- Seed the 8-room inventory
INSERT INTO rooms (id, name, capacity, description) VALUES
  ('main-hall', 'Main Hall', 30, 'Large events, workshops, presentations'),
  ('meeting-room-1', 'Meeting Room 1', 10, 'Team sessions, small workshops'),
  ('meeting-room-2', 'Meeting Room 2', 10, 'Team sessions, small workshops'),
  ('focus-room-1', 'Focus Room 1', 4, 'Small meetings, interviews, pods'),
  ('focus-room-2', 'Focus Room 2', 4, 'Small meetings, interviews, pods'),
  ('focus-room-3', 'Focus Room 3', 4, 'Small meetings, interviews, pods'),
  ('focus-room-4', 'Focus Room 4', 4, 'Small meetings, interviews, pods'),
  ('focus-room-5', 'Focus Room 5', 4, 'Small meetings, interviews, pods')
ON CONFLICT (id) DO NOTHING;
