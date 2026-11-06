import { create } from "zustand";
import API from "../api/axios";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),

  login: (accessToken) => {
    if (accessToken) {
      set({ accessToken, isAuthenticated: true });
    }
  },

  logout: async () => {
    try {
      await API.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  initializeAuth: async () => {
    try {
      const { data: res } = await API.get("/api/auth/refresh");
      get().login(res.access_token);
    } catch (error) {
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
}));