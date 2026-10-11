import { NextRequest, NextResponse } from "next/server";
import { verifyCookie, serializeCookie, processTurn } from "@/lib/shakuni/machine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.cookies.get("baazi_s")?.value;
    const state = verifyCookie(cookieHeader);

    const body = await req.json().catch(() => ({}));
    const { message, action } = body;
    const searchParams = req.nextUrl.searchParams;
    const isMercy = searchParams.get("mercy") === "1";

    const { state: newState, response } = processTurn(state, message, action, isMercy);
    const newCookieVal = serializeCookie(newState);

    const res = NextResponse.json(response);
    res.cookies.set({
      name: "baazi_s",
      value: newCookieVal,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7200
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Sabha sankat mein hai", details: err?.message }, { status: 500 });
  }
}
