import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendNewCallNotification } from "@/lib/email";
import { CallLog } from "@/types/call";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Retell webhook event:", body.event);

    // Only process call_analyzed — ignore call_ended to prevent duplicates
    if (body.event && body.event !== "call_analyzed") {
      return NextResponse.json({ success: true, skipped: body.event });
    }

    // Retell nests everything under body.call
    const call = body.call || body;
    const callAnalysis = call.call_analysis?.custom_analysis_data || {};

    const callId = call.call_id || null;
    const durationMs = call.duration_ms || 0;
    const duration = durationMs ? Math.round(durationMs / 1000) : null;
    const recordingUrl = call.recording_url || null;

    // Build transcript from transcript_object for clean formatting
    let transcript = call.transcript || null;
    if (call.transcript_object && Array.isArray(call.transcript_object)) {
      transcript = call.transcript_object
        .map((t: { role: string; content: string }) => {
          const role = t.role === "agent" ? "Agent" : "Caller";
          // Clean up the content - remove JSON artifacts
          const content = t.content
            .replace(/```json[\s\S]*?```/g, "")
            .replace(/```[\s\S]*?$/g, "")
            .trim();
          if (!content) return null;
          return `${role}: ${content}`;
        })
        .filter(Boolean)
        .join("\n");
    }

    // Extract data from call_analysis if available, otherwise leave null
    // Retell may not always extract structured data
    const row = {
      caller_name: callAnalysis.caller_name || null,
      caller_phone: callAnalysis.caller_phone || null,
      callback_preference: callAnalysis.callback_preference || null,
      intent: callAnalysis.intent || "general_inquiry",
      event_type: callAnalysis.event_type || null,
      event_date: callAnalysis.event_date || null,
      event_headcount: callAnalysis.event_headcount || null,
      special_requirements: callAnalysis.special_requirements || null,
      coworking_type: callAnalysis.coworking_type || null,
      notes: callAnalysis.notes || null,
      urgency: callAnalysis.urgency || "normal",
      status: "new",
      retell_call_id: callId,
      call_duration_seconds: duration,
      recording_url: recordingUrl,
      transcript: transcript,
    };

    // Try to extract info from transcript if call_analysis is empty
    if (!row.caller_name && transcript) {
      // Look for name patterns in the transcript
      const nameMatch = transcript.match(
        /(?:my name is|i'm|this is|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
      );
      if (nameMatch) row.caller_name = nameMatch[1];
    }
    if (!row.caller_phone && transcript) {
      // Look for phone number patterns
      const phoneMatch = transcript.match(
        /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/
      );
      if (phoneMatch) row.caller_phone = phoneMatch[1];
    }
    if (row.intent === "general_inquiry" && transcript) {
      const lower = transcript.toLowerCase();
      if (lower.includes("event") || lower.includes("book")) {
        row.intent = "event_space_booking";
      } else if (lower.includes("coworking") || lower.includes("desk") || lower.includes("membership")) {
        row.intent = "coworking_inquiry";
      } else if (lower.includes("makerspace") || lower.includes("sewing") || lower.includes("woodwork")) {
        row.intent = "makerspace_inquiry";
      } else if (lower.includes("cafe") || lower.includes("coffee") || lower.includes("food")) {
        row.intent = "cafe_inquiry";
      }
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "") {
      console.error("Supabase not configured");
      return NextResponse.json(
        { error: "Database not configured", received: row },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("call_logs")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to log call", details: error.message },
        { status: 500 }
      );
    }

    // Send email notification (non-blocking)
    try {
      await sendNewCallNotification(data as CallLog);
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Invalid request", details: String(err) },
      { status: 400 }
    );
  }
}

// GET for testing
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Retell webhook endpoint is live. Send a POST request.",
    supabase_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    resend_configured: !!process.env.RESEND_API_KEY,
  });
}
