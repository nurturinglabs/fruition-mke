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

    // Extract info from transcript
    // Strategy: find the agent's CONFIRMATION line (last long agent message that recaps everything)
    // This is the most reliable source — agent reads back name, phone, event details in one clean sentence
    if (call.transcript_object && Array.isArray(call.transcript_object)) {
      const agentMessages = call.transcript_object
        .filter((t: { role: string }) => t.role === "agent")
        .map((t: { content: string }) => t.content);

      const callerMessages = call.transcript_object
        .filter((t: { role: string }) => t.role === "user")
        .map((t: { content: string }) => t.content);

      // Find the confirmation line — the longest agent message that contains a phone number or "confirm"
      const confirmationLine = agentMessages
        .filter((m: string) => m.length > 80)
        .find((m: string) => {
          const lower = m.toLowerCase();
          return lower.includes("confirm") || lower.includes("got here") ||
                 lower.includes("sound right") || lower.includes("that correct") ||
                 /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(m);
        }) || "";

      const allCallerText = callerMessages.join(" ");
      const allAgentText = agentMessages.join(" ");
      console.log("Confirmation line found:", confirmationLine.substring(0, 200));

      // --- NAME ---
      // From confirmation: "You're [Name]" or "that's [Name],"
      if (!row.caller_name && confirmationLine) {
        const namePatterns = [
          /(?:you're|that's|you are)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[,!.]/i,
          /(?:you're|that's|you are)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        ];
        for (const pattern of namePatterns) {
          const match = confirmationLine.match(pattern);
          if (match && !["zara", "welcome", "looking", "calling"].includes(match[1].toLowerCase())) {
            row.caller_name = match[1];
            break;
          }
        }
      }
      // Fallback: caller says "my name is X" or "name is X"
      if (!row.caller_name) {
        // Only match explicit "my name is" or "name is" — NOT "I'm" which catches "I'm looking to..."
        const callerNameMatch = allCallerText.match(
          /(?:my name is|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/im
        );
        if (callerNameMatch) {
          const candidate = callerNameMatch[1].toLowerCase();
          const blacklist = ["looking", "calling", "here", "fine", "good", "interested", "wanting", "trying", "going"];
          if (!blacklist.includes(candidate)) {
            row.caller_name = callerNameMatch[1];
          }
        }
      }
      // Last fallback: agent says "Great, [Name]!" or "Thanks, [Name]!"
      if (!row.caller_name) {
        const agentNameMatch = allAgentText.match(
          /(?:Great|Thanks|Perfect|Hi|Hello),?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[\s!.,]/g
        );
        if (agentNameMatch) {
          // Get the last match (most likely the actual caller name, not "Zara")
          for (const m of agentNameMatch.reverse()) {
            const extracted = m.replace(/^(?:Great|Thanks|Perfect|Hi|Hello),?\s+/i, "").replace(/[\s!.,]+$/, "");
            if (extracted.toLowerCase() !== "zara" && extracted.length > 1) {
              row.caller_name = extracted;
              break;
            }
          }
        }
      }

      // --- PHONE ---
      if (!row.caller_phone) {
        // Best source: agent confirmation has formatted number
        const phoneMatch = (confirmationLine || allAgentText).match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
        if (phoneMatch) row.caller_phone = phoneMatch[1];
      }

      // --- CALLBACK ---
      if (!row.callback_preference) {
        const callerLower = allCallerText.toLowerCase();
        if (callerLower.includes("morning")) row.callback_preference = "morning";
        else if (callerLower.includes("afternoon")) row.callback_preference = "afternoon";
        else if (callerLower.includes("evening")) row.callback_preference = "evening";
        else if (callerLower.includes("anytime") || callerLower.includes("any time"))
          row.callback_preference = "anytime";
      }

      // --- INTENT ---
      if (row.intent === "general_inquiry") {
        const allText = (allCallerText + " " + allAgentText).toLowerCase();
        if (allText.includes("book") || allText.includes("event space") || allText.includes("event room")) {
          row.intent = "event_space_booking";
        } else if (allText.includes("coworking") || allText.includes("desk") || allText.includes("day pass") || allText.includes("membership")) {
          row.intent = "coworking_inquiry";
        } else if (allText.includes("makerspace") || allText.includes("sewing") || allText.includes("woodwork")) {
          row.intent = "makerspace_inquiry";
        } else if (allText.includes("cafe") || allText.includes("coffee") || allText.includes("food")) {
          row.intent = "cafe_inquiry";
        }
      }

      // --- EVENT DETAILS ---
      // Search ALL agent text + caller text, not just confirmation line
      const searchText = allAgentText + " " + allCallerText;
      const searchLower = searchText.toLowerCase();

      if (row.intent === "event_space_booking") {
        // Event type — look for specific patterns, exclude generic words
        if (!row.event_type) {
          const typePatterns = [
            // "for a social tech meetup" — adjective(s) + event word
            /(?:for (?:a |an ))(\w+(?:\s+\w+)*?)\s+(meetup|meeting|party|workshop|photoshoot|gathering|celebration|reception|conference|seminar|retreat)\b/i,
            // "book our event space for a tech meetup"
            /(?:book|host|plan)(?:ing)?\s+(?:a |an |our |the )?\w*\s*(?:space |room )?(?:for (?:a |an )?)(\w+(?:\s+\w+)*?)\s+(meetup|meeting|party|workshop|photoshoot|gathering|celebration|reception|conference)\b/i,
          ];
          for (const p of typePatterns) {
            const m = searchText.match(p);
            if (m) {
              const desc = m[1].trim().toLowerCase();
              // Skip generic words like "this", "the", "our"
              if (!["this", "the", "our", "your", "that", "an", "a"].includes(desc)) {
                row.event_type = m[1].trim() + " " + m[2].trim();
                break;
              }
            }
          }
          // Broader fallback: caller says what type directly
          if (!row.event_type) {
            const callerType = allCallerText.match(
              /(\w+(?:\s+\w+)*?)\s+(meetup|meeting|party|workshop|photoshoot|gathering|celebration|reception|conference)\b/i
            );
            if (callerType) {
              const desc = callerType[1].trim().toLowerCase();
              if (!["this", "the", "our", "your", "that", "an", "a", "book", "for"].includes(desc)) {
                row.event_type = callerType[1].trim() + " " + callerType[2].trim();
              }
            }
          }
        }

        // Headcount — digits first, then word numbers
        if (!row.event_headcount) {
          const hcMatch = searchText.match(/(\d+)\s*(?:people|guests|attendees|persons|folks)/i);
          if (hcMatch) {
            row.event_headcount = hcMatch[1];
          } else {
            const wordNums: Record<string, string> = {
              five: "5", ten: "10", fifteen: "15", twenty: "20", "twenty-five": "25",
              thirty: "30", "thirty-five": "35", forty: "40", fifty: "50",
              sixty: "60", seventy: "70", eighty: "80", ninety: "90", hundred: "100",
            };
            for (const [word, num] of Object.entries(wordNums)) {
              if (searchLower.includes(word + " people") || searchLower.includes(word + " guests") || searchLower.includes(word + " attendees")) {
                row.event_headcount = num;
                break;
              }
            }
          }
        }

        // Date — search all text
        if (!row.event_date) {
          const dateMatch = searchText.match(
            /on\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:\d{1,2}(?:st|nd|rd|th)?|[\w-]+))(?:\s+from\s+(.+?)(?:\s+for\s+|\s+with\s+|\s*\.))?/i
          );
          if (dateMatch) {
            row.event_date = dateMatch[1] + (dateMatch[2] ? " from " + dateMatch[2].trim() : "");
          }
        }

        // Special requirements — "None" only if no other reqs found
        if (!row.special_requirements) {
          const reqs: string[] = [];
          if (searchLower.includes("av ") || searchLower.includes("a/v") || searchLower.includes("audio") || searchLower.includes("projector") || searchLower.match(/\bequipment\b/)) {
            reqs.push("AV equipment");
          }
          if (searchLower.includes("catering") || searchLower.includes("food service")) {
            reqs.push("Catering");
          }
          if (reqs.length === 0 && (searchLower.includes("no special") || searchLower.includes("no setup"))) {
            reqs.push("None");
          }
          if (reqs.length) row.special_requirements = reqs.join(", ");
        }
      }

      // Also extract coworking details
      if (row.intent === "coworking_inquiry" && !row.coworking_type) {
        if (searchLower.includes("day pass")) row.coworking_type = "Day pass";
        else if (searchLower.includes("membership")) row.coworking_type = "Membership";
        if (searchLower.includes("team")) row.coworking_type = (row.coworking_type || "") + " (Team)";
        else if (searchLower.includes("solo")) row.coworking_type = (row.coworking_type || "") + " (Solo)";
        if (row.coworking_type) row.coworking_type = row.coworking_type.trim();
      }

      console.log("Extracted row:", JSON.stringify({
        caller_name: row.caller_name,
        caller_phone: row.caller_phone,
        intent: row.intent,
        event_type: row.event_type,
        event_date: row.event_date,
        event_headcount: row.event_headcount,
        special_requirements: row.special_requirements,
        callback_preference: row.callback_preference,
      }));
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
