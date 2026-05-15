import { create } from "zustand";

import { SessionUser, checkSession } from "@/service/auth/authService";

interface AuthState {
  sessionUser: SessionUser | null;
  loadingSession: boolean;
  getSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  sessionUser: null,
  loadingSession: true,
  getSession: async () => {
    try {
      set({
        loadingSession: true,
      });

      const res = await checkSession();

      if (res.status === "authenticated") {
        set({
          sessionUser: res.user ?? null,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      set({
        loadingSession: false,
      });
    }
  },
}));
