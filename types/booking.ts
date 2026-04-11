export type RoomCategory = "main-hall" | "meeting-room" | "focus-room";

export interface Room {
  id: string;
  name: string;
  capacity: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export type BookingStatus = "confirmed" | "pending" | "cancelled";
export type BookingSource = "agent" | "manual" | "seed";

export interface Booking {
  id: string;
  created_at: string;
  room_id: string;
  booker_name: string;
  booker_phone: string | null;
  event_type: string | null;
  date: string;
  start_time: string;
  end_time: string;
  headcount: number;
  special_requirements: string | null;
  status: BookingStatus;
  source: BookingSource;
  call_log_id: string | null;
  notes: string | null;
}

export interface BookingWithRoom extends Booking {
  room: Room;
}

export function getRoomCategory(roomId: string): RoomCategory {
  if (roomId === "main-hall") return "main-hall";
  if (roomId.startsWith("meeting-room")) return "meeting-room";
  return "focus-room";
}

export const ROOM_COLORS: Record<RoomCategory, { bg: string; text: string; border: string }> = {
  "main-hall": { bg: "#C4622D", text: "#FFFFFF", border: "#A3511E" },
  "meeting-room": { bg: "#2D6A4F", text: "#FFFFFF", border: "#1F4D38" },
  "focus-room": { bg: "#3B6EA5", text: "#FFFFFF", border: "#2A5580" },
};
