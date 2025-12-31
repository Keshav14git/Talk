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
            // Assume backend returns sorted list
            const notifications = res.data;
            const unreadCount = notifications.filter(n => !n.isRead).length;
            set({ notifications, unreadCount });
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
                const updated = state.notifications.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                );
                return {
                    notifications: updated,
                    unreadCount: updated.filter(n => !n.isRead).length
                };
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    markAllAsRead: async () => {
        try {
            await axiosInstance.put("/notifications/read-all");
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all read:", error);
            toast.error("Failed to mark all as read");
        }
    }
}));
