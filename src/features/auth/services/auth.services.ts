import { User } from "../types/auth.types";

export const login = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Auth login request failed:", error);
    return null;
  }
};
