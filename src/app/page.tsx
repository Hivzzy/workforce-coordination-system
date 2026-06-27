"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Box, CircularProgress } from "@mui/material";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;

    if (user) {
      if (user.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/portal");
      }
    } else {
      router.push("/login");
    }
  }, [user, hasHydrated, router]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
      }}
    >
      <CircularProgress size={40} thickness={4} />
    </Box>
  );
}
