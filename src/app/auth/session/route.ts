import { NextResponse, type NextRequest } from "next/server";
import {
  DIRTYFM_ACCESS_TOKEN_COOKIE,
  DIRTYFM_REFRESH_TOKEN_COOKIE,
  getAccessTokenMaxAge,
  getRefreshTokenMaxAge
} from "@/lib/authSession";
import { requireAdmin } from "@/lib/db/admin";
import { createSupabaseServerClient } from "@/lib/db/supabase";

type SessionPayload = {
  accessToken?: unknown;
  expiresIn?: unknown;
  refreshToken?: unknown;
};

const secureCookie = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  let payload: SessionPayload;

  try {
    payload = (await request.json()) as SessionPayload;
  } catch {
    return NextResponse.json({ error: "Bad session payload." }, { status: 400 });
  }

  if (typeof payload.accessToken !== "string" || payload.accessToken.length < 20) {
    return NextResponse.json({ error: "Missing Supabase access token." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient(payload.accessToken);
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(payload.accessToken);

  if (error || !user) {
    return NextResponse.json({ error: "Supabase session rejected." }, { status: 401 });
  }

  try {
    await requireAdmin(payload.accessToken);
  } catch {
    return NextResponse.json({ error: "Signal Control clearance rejected." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DIRTYFM_ACCESS_TOKEN_COOKIE, payload.accessToken, {
    httpOnly: true,
    maxAge: getAccessTokenMaxAge(payload.expiresIn),
    path: "/",
    sameSite: "lax",
    secure: secureCookie
  });

  if (typeof payload.refreshToken === "string" && payload.refreshToken.length > 20) {
    response.cookies.set(DIRTYFM_REFRESH_TOKEN_COOKIE, payload.refreshToken, {
      httpOnly: true,
      maxAge: getRefreshTokenMaxAge(),
      path: "/",
      sameSite: "lax",
      secure: secureCookie
    });
  }

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(DIRTYFM_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(DIRTYFM_REFRESH_TOKEN_COOKIE);
  return response;
}
