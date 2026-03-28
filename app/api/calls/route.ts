import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const intent = searchParams.get("intent");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = supabaseAdmin
    .from("call_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (intent) {
    query = query.eq("intent", intent);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (search) {
    query = query.or(
      `caller_name.ilike.%${search}%,caller_phone.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
