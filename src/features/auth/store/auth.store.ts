import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/auth.types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  tokenType: string;
  expiresAt: number | null;
  hasHydrated: boolean;
  
  setUser: (user: User) => void;
  setAuth: (user: User, accessToken?: string, tokenType?: string, expiresInSeconds?: number) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  isTokenExpired: () => boolean;
  getAccessToken: () => string | null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      tokenType: "Bearer",
      expiresAt: null,
      hasHydrated: false,

      setUser: (user) => set({ user }),

      setAuth: (user, accessToken, tokenType = "Bearer", expiresInSeconds = 86400) => {
        const expiresAt = Date.now() + expiresInSeconds * 1000;
        set({
          user,
          accessToken: accessToken || null,
          tokenType: tokenType || "Bearer",
          expiresAt: accessToken ? expiresAt : null,
        });
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          tokenType: "Bearer",
          expiresAt: null,
        }),

      setHasHydrated: (state) => set({ hasHydrated: state }),

      isTokenExpired: () => {
        const { expiresAt, accessToken } = get();
        if (!accessToken || !expiresAt) return false; // If no exp set, consider active
        return Date.now() >= expiresAt;
      },

      getAccessToken: () => {
        const { accessToken, isTokenExpired } = get();
        if (isTokenExpired()) {
          get().logout();
          return null;
        }
        return accessToken;
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
