import { Resend } from "resend";
import { CallLog } from "@/types/call";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "owner@fruitionmke.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const intentLabels: Record<string, string> = {
  coworking_inquiry: "Coworking Inquiry",
  event_space_booking: "Event Space Booking",
  makerspace_inquiry: "Makerspace Inquiry",
  cafe_inquiry: "Cafe Inquiry",
  general_inquiry: "General Inquiry",
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

export async function sendNewCallNotification(call: CallLog) {
  const resend = getResendClient();
  const intentLabel = intentLabels[call.intent] || call.intent;

  await resend.emails.send({
    from: "Fruition MKE <notifications@fruitionmke.com>",
    to: [OWNER_EMAIL],
    subject: `New call from ${call.caller_name || "Unknown Caller"} — Fruition MKE`,
    text: `Hi!

You just received a new call through your Fruition MKE voice assistant.

Caller: ${call.caller_name || "Not provided"}
Phone: ${call.caller_phone || "Not provided"}
Intent: ${intentLabel}
Callback Preference: ${call.callback_preference || "Not specified"}
Urgency: ${call.urgency}

Notes: ${call.notes || "None"}

Log in to your dashboard to review and follow up:
${APP_URL}

— Fruition MKE`,
  });
}
