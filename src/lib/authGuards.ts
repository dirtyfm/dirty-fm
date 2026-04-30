import type { AdminRole } from "./db/types";

export type AdminProfile = {
  user_id: string;
  role: AdminRole;
};

export class AdminAuthorizationError extends Error {
  constructor(message = "Admin access requires authenticated Signal Control clearance.") {
    super(message);
    this.name = "AdminAuthorizationError";
  }
}

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return role === "admin" || role === "editor";
}

export function assertAdminProfile(
  profile: AdminProfile | null | undefined
): AdminProfile {
  if (!profile || !isAdminRole(profile.role)) {
    throw new AdminAuthorizationError();
  }

  return profile;
}
