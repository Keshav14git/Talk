import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    isLoading: false,
    unreadCount: 0,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/notifications");
            // Only keep unread notifications
            const unreadNotifications = res.data.filter(n => !n.isRead);
            set({
                notifications: unreadNotifications,
                unreadCount: unreadNotifications.length
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
            set(state => {
                // Remove the read notification from the list
                const updated = state.notifications.filter(n => n._id !== id);
                return {
                    notifications: updated,
                    unreadCount: updated.length
                };
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    markAllAsRead: async () => {
        try {
            await axiosInstance.put("/notifications/read-all");
            set({
                notifications: [],
                unreadCount: 0
            });
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all read:", error);
            toast.error("Failed to mark all as read");
        }
    }
}));
