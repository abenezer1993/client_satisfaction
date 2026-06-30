import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function GET() {
  await signOut();
  return NextResponse.redirect(new URL("/signin", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}

export async function POST() {
  await signOut();
  return NextResponse.json({ success: true });
}
