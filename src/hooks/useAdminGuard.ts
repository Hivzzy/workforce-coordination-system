"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * Reusable admin route guard hook.
 * Redirects unauthenticated users to /login and staff users to /portal.
 * Returns `isReady` (true when auth check passed) and `user`.
 */
export function useAdminGuard() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/portal");
    }
  }, [user, hasHydrated, router]);

  const isReady = hasHydrated && !!user && user.role === "admin";

  return { isReady, user: isReady ? user : null };
}
