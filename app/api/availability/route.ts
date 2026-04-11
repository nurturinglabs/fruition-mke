import { NextRequest, NextResponse } from "next/server";
import { checkAvailability } from "@/lib/availability";

// Called by Zara (Retell custom function) during a call, and by the dashboard.
// Accepts both GET (query params) and POST (json body) so Retell's function tool
// can invoke it either way.
async function handle(params: {
  date?: string;
  start_time?: string;
  end_time?: string;
  headcount?: string | number;
}) {
  if (!params.date || !params.start_time || !params.end_time || params.headcount == null) {
    return NextResponse.json(
      { error: "Missing required params: date, start_time, end_time, headcount" },
      { status: 400 }
    );
  }

  const headcount = typeof params.headcount === "string" ? parseInt(params.headcount, 10) : params.headcount;
  if (Number.isNaN(headcount) || headcount <= 0) {
    return NextResponse.json({ error: "headcount must be a positive integer" }, { status: 400 });
  }

  try {
    const result = await checkAvailability({
      date: params.date,
      start_time: params.start_time,
      end_time: params.end_time,
      headcount,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Availability check error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return handle({
    date: searchParams.get("date") || undefined,
    start_time: searchParams.get("start_time") || undefined,
    end_time: searchParams.get("end_time") || undefined,
    headcount: searchParams.get("headcount") || undefined,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Retell wraps custom function args under `args` sometimes
    const params = body.args || body;
    return handle(params);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body", details: String(err) }, { status: 400 });
  }
}
