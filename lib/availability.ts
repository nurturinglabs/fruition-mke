import { supabaseAdmin } from "./supabase";
import { Room, Booking } from "@/types/booking";

export interface AvailabilityRequest {
  date: string;
  start_time: string;
  end_time: string;
  headcount: number;
}

export interface AvailabilityResponse {
  available: boolean;
  rooms: Room[];
  suggested_room: string | null;
  alternatives: Array<{ room_id: string; name: string; capacity: number }>;
  next_available?: {
    date: string;
    start_time: string;
    end_time: string;
    room: string;
  } | null;
}

function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function normalizeTime(t: string): string {
  // accept "9:00", "09:00", "09:00:00" → "09:00:00"
  const parts = t.split(":");
  const hh = parts[0]?.padStart(2, "0") ?? "00";
  const mm = parts[1]?.padStart(2, "0") ?? "00";
  const ss = parts[2]?.padStart(2, "0") ?? "00";
  return `${hh}:${mm}:${ss}`;
}

function preferredRoomOrder(headcount: number, rooms: Room[]): Room[] {
  const focus = rooms.filter(r => r.capacity === 4);
  const meeting = rooms.filter(r => r.capacity === 10);
  const main = rooms.filter(r => r.capacity === 30);

  if (headcount <= 4) return [...focus, ...meeting, ...main];
  if (headcount <= 10) return [...meeting, ...main];
  return [...main];
}

export async function checkAvailability(
  req: AvailabilityRequest
): Promise<AvailabilityResponse> {
  const startTime = normalizeTime(req.start_time);
  const endTime = normalizeTime(req.end_time);

  const { data: allRooms, error: roomErr } = await supabaseAdmin
    .from("rooms")
    .select("*")
    .eq("is_active", true);

  if (roomErr || !allRooms) {
    throw new Error(`Failed to fetch rooms: ${roomErr?.message}`);
  }

  const rooms = allRooms as Room[];
  const fittingRooms = rooms.filter(r => r.capacity >= req.headcount);

  if (fittingRooms.length === 0) {
    return {
      available: false,
      rooms: [],
      suggested_room: null,
      alternatives: [],
      next_available: null,
    };
  }

  const { data: dayBookings, error: bookErr } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("date", req.date)
    .neq("status", "cancelled");

  if (bookErr) {
    throw new Error(`Failed to fetch bookings: ${bookErr.message}`);
  }

  const bookings = (dayBookings || []) as Booking[];
  const availableFits = fittingRooms.filter(room => {
    const roomBookings = bookings.filter(b => b.room_id === room.id);
    return !roomBookings.some(b =>
      timesOverlap(startTime, endTime, normalizeTime(b.start_time), normalizeTime(b.end_time))
    );
  });

  if (availableFits.length > 0) {
    const ordered = preferredRoomOrder(req.headcount, availableFits);
    return {
      available: true,
      rooms: ordered,
      suggested_room: ordered[0].id,
      alternatives: ordered.slice(1).map(r => ({ room_id: r.id, name: r.name, capacity: r.capacity })),
    };
  }

  // Nothing fits at the requested slot — look for next available slot over the next 7 days
  const nextAvail = await findNextAvailable(req, fittingRooms);
  return {
    available: false,
    rooms: [],
    suggested_room: null,
    alternatives: [],
    next_available: nextAvail,
  };
}

async function findNextAvailable(
  req: AvailabilityRequest,
  fittingRooms: Room[]
): Promise<AvailabilityResponse["next_available"]> {
  const startDate = new Date(req.date + "T00:00:00");
  const durationMs =
    new Date(`1970-01-01T${normalizeTime(req.end_time)}`).getTime() -
    new Date(`1970-01-01T${normalizeTime(req.start_time)}`).getTime();
  const durationHours = Math.max(1, durationMs / (1000 * 60 * 60));

  const ordered = preferredRoomOrder(req.headcount, fittingRooms);

  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().slice(0, 10);

    const { data: dayBookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("date", dateStr)
      .neq("status", "cancelled");
    const bookings = (dayBookings || []) as Booking[];

    // Try every hour from 8am to (20 - duration)
    for (let hour = 8; hour + durationHours <= 20; hour++) {
      const startT = `${String(hour).padStart(2, "0")}:00:00`;
      const endT = `${String(hour + durationHours).padStart(2, "0")}:00:00`;
      for (const room of ordered) {
        const conflict = bookings.some(
          b =>
            b.room_id === room.id &&
            timesOverlap(startT, endT, normalizeTime(b.start_time), normalizeTime(b.end_time))
        );
        if (!conflict) {
          return { date: dateStr, start_time: startT, end_time: endT, room: room.id };
        }
      }
    }
  }
  return null;
}
