"use client";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DahboardPage() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p>Welcome, {user.email} </p>
      <button
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="mt-4 bg-red-500 text-white p-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
