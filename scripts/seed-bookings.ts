/**
 * One-time seed script — creates ~20 dummy bookings spread across the next 14 days.
 * Run with: npx tsx scripts/seed-bookings.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type Seed = {
  room_id: string;
  booker_name: string;
  booker_phone: string;
  event_type: string;
  date: string;
  start_time: string;
  end_time: string;
  headcount: number;
  special_requirements?: string;
};

const seeds: Seed[] = [
  { room_id: "main-hall", booker_name: "Marcus Johnson", booker_phone: "414-555-0101", event_type: "Tech Meetup", date: dayOffset(1), start_time: "09:00", end_time: "12:00", headcount: 30, special_requirements: "AV equipment" },
  { room_id: "meeting-room-1", booker_name: "Sarah Chen", booker_phone: "414-555-0102", event_type: "Client Interview", date: dayOffset(1), start_time: "14:00", end_time: "16:00", headcount: 6 },
  { room_id: "focus-room-3", booker_name: "Devon Rice", booker_phone: "414-555-0103", event_type: "1:1 Coaching", date: dayOffset(2), start_time: "10:00", end_time: "11:00", headcount: 2 },
  { room_id: "main-hall", booker_name: "Aisha Williams", booker_phone: "414-555-0104", event_type: "Art Workshop", date: dayOffset(3), start_time: "13:00", end_time: "17:00", headcount: 25, special_requirements: "Tables/seating" },
  { room_id: "meeting-room-2", booker_name: "Tom Becker", booker_phone: "414-555-0105", event_type: "Podcast Recording", date: dayOffset(4), start_time: "09:00", end_time: "10:00", headcount: 4 },
  { room_id: "focus-room-1", booker_name: "Priya Patel", booker_phone: "414-555-0106", event_type: "Team Standup", date: dayOffset(4), start_time: "11:00", end_time: "11:30", headcount: 4 },
  { room_id: "focus-room-2", booker_name: "Jordan Fields", booker_phone: "414-555-0107", event_type: "Design Review", date: dayOffset(5), start_time: "14:00", end_time: "15:30", headcount: 3 },
  { room_id: "main-hall", booker_name: "Rebecca Lin", booker_phone: "414-555-0108", event_type: "Book Launch", date: dayOffset(6), start_time: "18:00", end_time: "20:00", headcount: 28, special_requirements: "AV equipment, Catering" },
  { room_id: "meeting-room-1", booker_name: "Carlos Mendez", booker_phone: "414-555-0109", event_type: "Board Meeting", date: dayOffset(7), start_time: "09:00", end_time: "11:00", headcount: 8 },
  { room_id: "focus-room-4", booker_name: "Leah Goldberg", booker_phone: "414-555-0110", event_type: "Therapy Session", date: dayOffset(7), start_time: "13:00", end_time: "14:00", headcount: 2 },
  { room_id: "focus-room-5", booker_name: "Kevin O'Brien", booker_phone: "414-555-0111", event_type: "Tutoring", date: dayOffset(8), start_time: "16:00", end_time: "17:00", headcount: 2 },
  { room_id: "meeting-room-2", booker_name: "Yuki Tanaka", booker_phone: "414-555-0112", event_type: "Product Demo", date: dayOffset(8), start_time: "10:00", end_time: "11:30", headcount: 7 },
  { room_id: "main-hall", booker_name: "Angela Ross", booker_phone: "414-555-0113", event_type: "Dance Workshop", date: dayOffset(9), start_time: "10:00", end_time: "13:00", headcount: 20 },
  { room_id: "focus-room-1", booker_name: "Sam Rivera", booker_phone: "414-555-0114", event_type: "Resume Review", date: dayOffset(10), start_time: "09:00", end_time: "10:00", headcount: 2 },
  { room_id: "focus-room-2", booker_name: "Nora Kim", booker_phone: "414-555-0115", event_type: "Mock Interview", date: dayOffset(10), start_time: "11:00", end_time: "12:00", headcount: 2 },
  { room_id: "meeting-room-1", booker_name: "David Park", booker_phone: "414-555-0116", event_type: "Client Pitch", date: dayOffset(11), start_time: "14:00", end_time: "15:30", headcount: 6 },
  { room_id: "main-hall", booker_name: "Monique Harris", booker_phone: "414-555-0117", event_type: "Community Forum", date: dayOffset(12), start_time: "17:00", end_time: "19:30", headcount: 30, special_requirements: "AV equipment" },
  { room_id: "focus-room-3", booker_name: "Ethan Lee", booker_phone: "414-555-0118", event_type: "Coding Session", date: dayOffset(12), start_time: "13:00", end_time: "15:00", headcount: 3 },
  { room_id: "meeting-room-2", booker_name: "Grace Adeyemi", booker_phone: "414-555-0119", event_type: "Strategy Workshop", date: dayOffset(13), start_time: "09:00", end_time: "12:00", headcount: 9 },
  { room_id: "focus-room-4", booker_name: "Ben Schmidt", booker_phone: "414-555-0120", event_type: "1:1 Mentoring", date: dayOffset(14), start_time: "15:00", end_time: "16:00", headcount: 2 },
];

async function run() {
  console.log(`Seeding ${seeds.length} bookings...`);

  // Wipe existing seed rows so script is idempotent
  const { error: delErr } = await supabase.from("bookings").delete().eq("source", "seed");
  if (delErr) {
    console.error("Failed to clear existing seed rows:", delErr.message);
    process.exit(1);
  }

  const rows = seeds.map(s => ({
    ...s,
    status: "confirmed" as const,
    source: "seed" as const,
  }));

  const { data, error } = await supabase.from("bookings").insert(rows).select();
  if (error) {
    console.error("Seed insert failed:", error.message);
    process.exit(1);
  }
  console.log(`Inserted ${data?.length ?? 0} bookings.`);
}

run();
