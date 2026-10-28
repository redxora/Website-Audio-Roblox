import { NextResponse } from "next/server";
import { destroyUserSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

async function handleLogout(request) {
  await destroyUserSession();
  const next = request.nextUrl.searchParams.get("next") || "/";
  const acceptsJson = request.headers.get("accept")?.includes("application/json");

  const response = acceptsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL(next, request.url));

  response.cookies.set("cilaaa_session", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}

export async function POST(request) {
  return handleLogout(request);
}

export async function GET(request) {
  return handleLogout(request);
}
