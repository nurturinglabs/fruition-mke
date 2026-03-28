import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { passcode } = await request.json();
  const correctPasscode = process.env.DASHBOARD_PASSCODE || "123456";

  if (passcode === correctPasscode) {
    const cookieStore = await cookies();
    cookieStore.set("fruition_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
}
