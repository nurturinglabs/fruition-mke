import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Booking } from "@/types/booking";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const roomId = searchParams.get("room_id");

  let query = supabaseAdmin
    .from("bookings")
    .select("*, room:rooms(*)")
    .neq("status", "cancelled")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  if (roomId) query = query.eq("room_id", roomId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ bookings: data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const required = ["room_id", "booker_name", "date", "start_time", "end_time", "headcount"];
    for (const field of required) {
      if (body[field] == null) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const row: Partial<Booking> = {
      room_id: body.room_id,
      booker_name: body.booker_name,
      booker_phone: body.booker_phone || null,
      event_type: body.event_type || null,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      headcount: typeof body.headcount === "string" ? parseInt(body.headcount, 10) : body.headcount,
      special_requirements: body.special_requirements || null,
      status: body.status || "confirmed",
      source: body.source || "manual",
      call_log_id: body.call_log_id || null,
      notes: body.notes || null,
    };

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert(row)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ booking: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
