import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Error in logout route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
