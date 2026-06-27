import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/auth.types";

type AuthState = {
  user: User | null;
  hasHydrated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
