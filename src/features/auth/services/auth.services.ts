import { User, LoginResponseData } from "../types/auth.types";
import { useAuthStore } from "../store/auth.store";
import { apiFetch } from "@/utils/api-client";

export const login = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    const data = await apiFetch<LoginResponseData>("/auth/login", {
      method: "POST",
      data: { email: email.trim(), password },
    });

    if (data && data.email) {
      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as "admin" | "staff",
        staffId: data.staffId,
      };

      useAuthStore
        .getState()
        .setAuth(user, data.accessToken, data.tokenType, data.expiresIn);

      return user;
    }
    return null;
  } catch (error) {
    console.error("Auth login request failed:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    }
  } catch (error) {
    console.warn("Server logout notification skipped or failed:", error);
  } finally {
    useAuthStore.getState().logout();
  }
};
