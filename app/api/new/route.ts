import { NextRequest, NextResponse } from "next/server";
import { createFreshSession, serializeCookie } from "@/lib/shakuni/machine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const fresh = createFreshSession();
  const cookieVal = serializeCookie(fresh);

  const res = NextResponse.json({ success: true, games_lost: fresh.games_lost });
  res.cookies.set({
    name: "baazi_s",
    value: cookieVal,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7200
  });

  return res;
}
