"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase public environment is not configured.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false
    }
  });
}

export function SignalControlLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError || !data.session) {
        throw new Error(loginError?.message ?? "Signal Control rejected that login.");
      }

      const response = await fetch("/auth/session", {
        body: JSON.stringify({
          accessToken: data.session.access_token,
          expiresIn: data.session.expires_in,
          refreshToken: data.session.refresh_token
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Signal Control could not lock in the session.");
      }

      window.location.assign("/signal-control");
    } catch (sessionError) {
      setError(
        sessionError instanceof Error
          ? sessionError.message
          : "Signal Control coughed up static. Try again."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-4 border border-dirty-yellow bg-dirty-coal/85 p-5 shadow-signal min-[760px]:p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-2">
        <label className="font-utility text-xs font-black uppercase text-dirty-yellow" htmlFor="email">
          Operator Email
        </label>
        <input
          autoComplete="email"
          className="min-h-12 border border-[rgba(183,178,168,0.28)] bg-dirty-black px-3 text-dirty-ash outline-none focus:border-dirty-yellow"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>
      <div className="grid gap-2">
        <label
          className="font-utility text-xs font-black uppercase text-dirty-yellow"
          htmlFor="password"
        >
          Passphrase
        </label>
        <input
          autoComplete="current-password"
          className="min-h-12 border border-[rgba(183,178,168,0.28)] bg-dirty-black px-3 text-dirty-ash outline-none focus:border-dirty-yellow"
          id="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      {error ? (
        <p className="border border-dirty-red bg-dirty-red/15 p-3 font-utility text-xs font-bold uppercase text-dirty-yellow">
          {error}
        </p>
      ) : null}
      <button className="button button-primary w-full disabled:cursor-not-allowed disabled:opacity-55" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Checking Clearance" : "Enter Signal Control"}
      </button>
    </form>
  );
}
