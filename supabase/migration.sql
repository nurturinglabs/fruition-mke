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
  recording_url TEXT
);

-- Indexes for common queries
CREATE INDEX idx_call_logs_status ON call_logs(status);
CREATE INDEX idx_call_logs_intent ON call_logs(intent);
CREATE INDEX idx_call_logs_created_at ON call_logs(created_at DESC);
CREATE INDEX idx_call_logs_urgency ON call_logs(urgency);

-- Enable Row Level Security
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for webhook inserts)
CREATE POLICY "Service role has full access" ON call_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow anon read access (for dashboard, gated by app-level auth)
CREATE POLICY "Anon can read call logs" ON call_logs
  FOR SELECT
  USING (true);
