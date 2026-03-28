import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendNewCallNotification } from "@/lib/email";
import { CallLog } from "@/types/call";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Retell sends call data in call_analysis.custom_analysis_data
    const callData = body.call_analysis?.custom_analysis_data || {};
    const callId = body.call_id || null;
    const duration = body.duration || null;
    const recordingUrl = body.recording_url || null;

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
    };

    const { data, error } = await supabaseAdmin
      .from("call_logs")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to log call" }, { status: 500 });
    }

    // Send email notification (non-blocking — don't fail the webhook if email fails)
    try {
      await sendNewCallNotification(data as CallLog);
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
