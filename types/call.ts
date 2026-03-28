export type CallIntent =
  | "coworking_inquiry"
  | "event_space_booking"
  | "makerspace_inquiry"
  | "cafe_inquiry"
  | "general_inquiry";

export type CallStatus = "new" | "reviewed" | "followed_up" | "closed";

export type CallUrgency = "normal" | "urgent";

export interface CallLog {
  id: string;
  created_at: string;
  caller_name: string | null;
  caller_phone: string | null;
  callback_preference: string | null;
  intent: CallIntent;
  event_type: string | null;
  event_date: string | null;
  event_headcount: string | null;
  special_requirements: string | null;
  coworking_type: string | null;
  notes: string | null;
  urgency: CallUrgency;
  status: CallStatus;
  retell_call_id: string | null;
  call_duration_seconds: number | null;
  recording_url: string | null;
  transcript: string | null;
}
