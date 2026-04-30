export type PublicInputKind = "comment" | "contact" | "dirty-news";

type RateLimitRule = {
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rules = {
  comment: { limit: 6, windowMs: 60_000 },
  contact: { limit: 3, windowMs: 10 * 60_000 },
  "dirty-news": { limit: 3, windowMs: 10 * 60_000 }
} satisfies Record<PublicInputKind, RateLimitRule>;

const buckets = new Map<string, RateLimitEntry>();

export function checkHoneypot(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getClientIp(headersList: Headers) {
  const forwarded = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headersList.get("x-real-ip")?.trim();

  return forwarded || realIp || "unknown";
}

export function checkPublicRateLimit(kind: PublicInputKind, identifier: string, now = Date.now()) {
  const rule = rules[kind];
  const key = `${kind}:${identifier || "unknown"}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { ok: true as const };
  }

  if (current.count >= rule.limit) {
    return {
      ok: false as const,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000)
    };
  }

  current.count += 1;
  return { ok: true as const };
}

export function resetPublicRateLimitForTests() {
  buckets.clear();
}
