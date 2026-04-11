# Retell Agent Configuration — Zara (Fruition MKE)

This document is the source of truth for the Retell dashboard config. The agent lives in Retell, not in this repo — you paste/update these values in the Retell UI.

## Agent basics

| Field | Value |
|---|---|
| Name | `Zara - Fruition MKE` |
| Voice | ElevenLabs warm female (Rachel or Bella) |
| LLM | Claude Sonnet (or Retell native) |
| End-of-call webhook | `POST https://fruition-mke.vercel.app/api/retell/webhook` |

## Begin message (greeting)

```
Hi, thanks for calling Fruition MKE! This is Zara, your virtual assistant.
Our team is currently unavailable, but I'm here to help.
I can take down your details and make sure the right person gets back to you.
What brings you in today?
```

## System prompt

See `fruition-mke-voice-agent-PRD 2.md` §3.8 for the canonical version. Key rules:

- Ask for caller's **first name** before anything else
- Never quote prices
- For event bookings: **call `check_availability` before confirming**
- Capacity routing: ≤4 → Focus Rooms, ≤10 → Meeting Rooms, ≤30 → Main Hall
- End every call with the structured JSON summary (see below)

## Custom function: `check_availability`

Paste this into the Retell custom functions UI:

```json
{
  "name": "check_availability",
  "description": "Check if a room is available for a given date, time, and headcount. Call this before confirming any event space booking. Returns the suggested room if available, or the next available slot if not.",
  "url": "https://fruition-mke.vercel.app/api/availability",
  "method": "POST",
  "parameters": {
    "type": "object",
    "required": ["date", "start_time", "end_time", "headcount"],
    "properties": {
      "date": {
        "type": "string",
        "description": "ISO date string in YYYY-MM-DD format, e.g. 2026-05-05"
      },
      "start_time": {
        "type": "string",
        "description": "24-hour time in HH:MM format, e.g. 09:00"
      },
      "end_time": {
        "type": "string",
        "description": "24-hour time in HH:MM format, e.g. 12:00"
      },
      "headcount": {
        "type": "integer",
        "description": "Number of people attending"
      }
    }
  }
}
```

### Response shape Zara will see

**Available:**
```json
{
  "available": true,
  "rooms": [{ "id": "main-hall", "name": "Main Hall", "capacity": 30 }],
  "suggested_room": "main-hall",
  "alternatives": []
}
```

**Not available:**
```json
{
  "available": false,
  "rooms": [],
  "suggested_room": null,
  "alternatives": [],
  "next_available": {
    "date": "2026-05-06",
    "start_time": "09:00:00",
    "end_time": "12:00:00",
    "room": "main-hall"
  }
}
```

Zara should:
1. If `available: true` → confirm the booking using `suggested_room`
2. If `available: false` and `next_available` is present → offer that slot verbally
3. If `available: false` and `next_available` is null → tell caller the owner will follow up personally, and log as `booking_status: pending_owner`

## End-of-call JSON summary (structured output)

Zara must output this JSON structure as the final turn / analysis payload. The webhook reads it from `call.call_analysis.custom_analysis_data`:

```json
{
  "caller_name": "",
  "caller_phone": "",
  "callback_preference": "",
  "intent": "event_space_booking | coworking_inquiry | makerspace_inquiry | cafe_inquiry | general_inquiry",
  "event_type": "",
  "event_date": "YYYY-MM-DD",
  "event_start_time": "HH:MM",
  "event_end_time": "HH:MM",
  "event_headcount": "",
  "room_assigned": "room id if confirmed, else null",
  "booking_status": "confirmed | pending_owner | unavailable",
  "special_requirements": "",
  "coworking_type": "",
  "notes": "",
  "urgency": "normal | urgent"
}
```

**Important:** when `booking_status === "confirmed"` and `room_assigned`, `event_date`, `event_start_time`, `event_end_time` are all populated, the webhook inserts a row into the `bookings` table linked to the call log. Zara must only set `booking_status: confirmed` **after** a successful `check_availability` call that returned `available: true`.

## Room inventory (for Zara's reference)

| Room ID | Name | Capacity |
|---|---|---|
| `main-hall` | Main Hall | 30 |
| `meeting-room-1` | Meeting Room 1 | 10 |
| `meeting-room-2` | Meeting Room 2 | 10 |
| `focus-room-1` to `focus-room-5` | Focus Rooms | 4 each |
