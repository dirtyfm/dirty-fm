import { NextResponse, type NextRequest } from "next/server";
import {
  DIRTYFM_ACCESS_TOKEN_COOKIE,
  DIRTYFM_REFRESH_TOKEN_COOKIE,
  getAccessTokenMaxAge,
  getRefreshTokenMaxAge
} from "@/lib/authSession";
import { isLocalAuthMode } from "@/lib/authMode";
import { requireAdmin } from "@/lib/db/admin";
import { createSupabaseServerClient } from "@/lib/db/supabase";
import { authenticateLocalOperator, getLocalSessionMaxAge } from "@/lib/localAuth";

type SessionPayload = {
  accessToken?: unknown;
  email?: unknown;
  expiresIn?: unknown;
  passphrase?: unknown;
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

  if (isLocalAuthMode()) {
    if (typeof payload.email !== "string" || typeof payload.passphrase !== "string") {
      return NextResponse.json({ error: "Missing Signal Control credentials." }, { status: 400 });
    }

    const token = await authenticateLocalOperator(payload.email, payload.passphrase);

    if (!token) {
      return NextResponse.json({ error: "Signal Control rejected that login." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(DIRTYFM_ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      maxAge: getLocalSessionMaxAge(),
      path: "/",
      sameSite: "lax",
      secure: secureCookie
    });
    response.cookies.delete(DIRTYFM_REFRESH_TOKEN_COOKIE);
    return response;
  }

  if (
    typeof payload.accessToken !== "string" &&
    typeof payload.email === "string" &&
    typeof payload.passphrase === "string"
  ) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.passphrase
    });

    if (error || !data.session) {
      return NextResponse.json({ error: "Signal Control rejected that login." }, { status: 401 });
    }

    payload = {
      accessToken: data.session.access_token,
      expiresIn: data.session.expires_in,
      refreshToken: data.session.refresh_token
    };
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
