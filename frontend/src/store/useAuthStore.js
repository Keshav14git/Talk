import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === "development" ? "http://localhost:5001" : "/");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      // Don't log 401 errors, they are expected when not logged in
      if (error.response?.status !== 401) {
        console.log("Error in checkAuth:", error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  googleLogin: async (token) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/google", { token });
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Google Login failed");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  sendOtp: async (email) => {
    set({ isLoggingIn: true }); // Reuse loading state or add specific one if needed
    try {
      const res = await axiosInstance.post("/auth/send-otp", { email });
      toast.success(res.data.message || "OTP sent successfully");
      return true; // Indicate success to component
    } catch (error) {
      console.error("OTP SEND ERROR:", error);
      console.error("OTP ERROR RESPONSE:", error.response);
      console.error("OTP ERROR DATA:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to send OTP");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  verifyOtp: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      return res.data; // Return full user object (including isNewUser flag)
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  requestEmailChange: async (newEmail) => {
    try {
      set({ isUpdatingProfile: true }); // Reuse updating state
      const res = await axiosInstance.post("/auth/request-email-change", { newEmail });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request email change");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  verifyEmailChange: async (otp) => {
    try {
      set({ isUpdatingProfile: true });
      const res = await axiosInstance.post("/auth/verify-email-change", { otp });
      set({ authUser: res.data }); // Update user with new email
      toast.success("Email updated successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify email change");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));