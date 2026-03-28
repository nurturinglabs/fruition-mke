import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendNewCallNotification } from "@/lib/email";
import { CallLog } from "@/types/call";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Retell webhook received:", JSON.stringify(body, null, 2));

    // Retell may send data in different locations depending on config
    const callData =
      body.call_analysis?.custom_analysis_data ||
      body.call_analysis ||
      body.custom_analysis_data ||
      body;

    const callId = body.call_id || body.call_sid || null;
    const duration =
      body.duration || body.call_duration_seconds || body.duration_ms
        ? Math.round((body.duration_ms || 0) / 1000)
        : null;
    const recordingUrl =
      body.recording_url || body.recording_uri || null;

    const row = {
      caller_name: callData.caller_name || null,
      caller_phone: callData.caller_phone || null,
      callback_preference: callData.callback_preference || null,
      intent: callData.intent || "general_inquiry",
      event_type: callData.event_type || null,
      event_date: callData.event_date || null,
      event_headcount: callData.event_headcount || null,
      special_requirements: callData.special_requirements || null,
      coworking_type: callData.coworking_type || null,
      notes: callData.notes || null,
      urgency: callData.urgency || "normal",
      status: "new",
      retell_call_id: callId,
      call_duration_seconds: duration,
      recording_url: recordingUrl,
      transcript: body.transcript || null,
    };

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

// Also handle GET for easy testing in browser
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Retell webhook endpoint is live. Send a POST request.",
    supabase_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    resend_configured: !!process.env.RESEND_API_KEY,
  });
}
