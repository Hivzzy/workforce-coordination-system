"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * Reusable production staff route guard hook.
 * Redirects unauthenticated users to /login and admin users to /dashboard.
 * Checks JWT expiration automatically.
 */
export function useStaffGuard() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isTokenExpired = useAuthStore((s) => s.isTokenExpired);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user || isTokenExpired()) {
      logout();
      router.push("/login?expired=true");
    } else if (user.role === "admin") {
      router.push("/dashboard");
    }
  }, [user, hasHydrated, isTokenExpired, logout, router]);

  const isReady = hasHydrated && !!user && user.role === "staff" && !isTokenExpired();

  return { isReady, user: isReady ? user : null };
}
