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

    // Extract info from transcript if call_analysis didn't provide it
    // Only look at CALLER lines to avoid matching agent speech (e.g. "This is Zara")
    if (call.transcript_object && Array.isArray(call.transcript_object)) {
      const callerLines = call.transcript_object
        .filter((t: { role: string }) => t.role === "user")
        .map((t: { content: string }) => t.content)
        .join(" ");

      const agentLines = call.transcript_object
        .filter((t: { role: string }) => t.role === "agent")
        .map((t: { content: string }) => t.content)
        .join(" ");

      // Extract name from caller speech
      if (!row.caller_name) {
        const nameMatch = callerLines.match(
          /(?:my name is|i'm|i am|it's|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
        );
        if (nameMatch) row.caller_name = nameMatch[1];
      }

      // Also check if agent confirmed a name — "so that's [Name]" or "Great, [Name]!"
      if (!row.caller_name) {
        const agentConfirm = agentLines.match(
          /(?:so that's|got it,?|great,?|perfect,?|thanks?,?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[!,.\s]/i
        );
        if (agentConfirm && agentConfirm[1].toLowerCase() !== "zara") {
          row.caller_name = agentConfirm[1];
        }
      }

      // Extract phone from agent confirmation (more reliable — agent reads it back formatted)
      if (!row.caller_phone) {
        const phoneInAgent = agentLines.match(
          /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/
        );
        if (phoneInAgent) row.caller_phone = phoneInAgent[1];
      }
      // Fallback: phone from caller speech
      if (!row.caller_phone) {
        const phoneInCaller = callerLines.match(
          /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/
        );
        if (phoneInCaller) row.caller_phone = phoneInCaller[1];
      }

      // Extract callback preference from caller speech
      if (!row.callback_preference) {
        const callerLower = callerLines.toLowerCase();
        if (callerLower.includes("morning")) row.callback_preference = "morning";
        else if (callerLower.includes("afternoon")) row.callback_preference = "afternoon";
        else if (callerLower.includes("evening")) row.callback_preference = "evening";
        else if (callerLower.includes("anytime") || callerLower.includes("any time"))
          row.callback_preference = "anytime";
      }

      // Detect intent from full transcript
      if (row.intent === "general_inquiry") {
        const allText = (callerLines + " " + agentLines).toLowerCase();
        if (allText.includes("event") || allText.includes("book")) {
          row.intent = "event_space_booking";
        } else if (allText.includes("coworking") || allText.includes("desk") || allText.includes("membership")) {
          row.intent = "coworking_inquiry";
        } else if (allText.includes("makerspace") || allText.includes("sewing") || allText.includes("woodwork")) {
          row.intent = "makerspace_inquiry";
        } else if (allText.includes("cafe") || allText.includes("coffee") || allText.includes("food")) {
          row.intent = "cafe_inquiry";
        }
      }

      // Extract event details from caller + agent speech
      if (row.intent === "event_space_booking") {
        if (!row.event_type) {
          const typeMatch = callerLines.match(
            /(?:a |an )?(\w+(?:\s+\w+)?)\s+(?:meetup|meeting|party|workshop|event|photoshoot|gathering)/i
          );
          if (typeMatch) row.event_type = typeMatch[0].trim();
        }
        if (!row.event_headcount) {
          const headcountMatch = callerLines.match(
            /(\d+)\s*(?:people|guests|attendees|persons|folks)/i
          );
          if (headcountMatch) row.event_headcount = headcountMatch[1];
        }
        if (!row.event_date) {
          // Check agent confirmation for date (more reliable)
          const dateMatch = agentLines.match(
            /(?:on |for )?((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s+from\s+[\d\s:APMapm]+(?:to|-)[\d\s:APMapm]+)?)/i
          );
          if (dateMatch) row.event_date = dateMatch[1];
        }
        if (!row.special_requirements) {
          const lower = callerLines.toLowerCase();
          if (lower.includes("av ") || lower.includes("audio") || lower.includes("projector") || lower.includes("equipment")) {
            row.special_requirements = "AV equipment";
          }
          if (lower.includes("catering") || lower.includes("food")) {
            row.special_requirements = (row.special_requirements ? row.special_requirements + ", " : "") + "Catering";
          }
        }
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
