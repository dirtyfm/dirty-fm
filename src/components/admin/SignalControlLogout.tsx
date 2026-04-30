"use client";

export function SignalControlLogout() {
  async function handleLogout() {
    await fetch("/auth/session", { method: "DELETE" });
    window.location.assign("/signal-control");
  }

  return (
    <button className="button button-secondary" onClick={handleLogout} type="button">
      Kill Session
    </button>
  );
}
