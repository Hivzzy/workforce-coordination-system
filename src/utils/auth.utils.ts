import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * Verify the current user has admin privileges before performing
 * a state-mutating action. Throws if unauthorized.
 *
 * Usage: Call at the start of any handler that modifies stores.
 */
export function verifyAdminAuth(): void {
  const user = useAuthStore.getState().user;
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized action");
  }
}
