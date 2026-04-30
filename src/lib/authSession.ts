export const DIRTYFM_ACCESS_TOKEN_COOKIE = "dirtyfm_access_token";
export const DIRTYFM_REFRESH_TOKEN_COOKIE = "dirtyfm_refresh_token";

const MINUTE = 60;
const DAY = 24 * 60 * MINUTE;

export function getAccessTokenMaxAge(expiresIn: unknown) {
  if (typeof expiresIn !== "number" || !Number.isFinite(expiresIn)) {
    return 60 * MINUTE;
  }

  return Math.max(MINUTE, Math.floor(expiresIn));
}

export function getRefreshTokenMaxAge() {
  return 30 * DAY;
}
