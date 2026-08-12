"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * Reusable production admin route guard hook.
 * Redirects unauthenticated users to /login and staff users to /portal.
 * Checks Redis session expiration automatically.
 */
export function useAdminGuard() {
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
    } else if (user.role !== "admin") {
      router.push("/portal");
    }
  }, [user, hasHydrated, isTokenExpired, logout, router]);

  const isReady = hasHydrated && !!user && user.role === "admin" && !isTokenExpired();

  return { isReady, user: isReady ? user : null };
}
