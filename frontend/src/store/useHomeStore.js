import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useHomeStore = create((set) => ({
    userTasks: [],
    userEvents: [],
    isLoading: false,

    fetchUserDashboardData: async () => {
        set({ isLoading: true });
        try {
            const [tasksRes, eventsRes] = await Promise.all([
                axiosInstance.get("/projects/tasks/me"),
                axiosInstance.get("/calendar/my-events")
            ]);

            set({
                userTasks: tasksRes.data,
                userEvents: eventsRes.data.map(event => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end)
                }))
            });
        } catch (error) {
            console.error("Error fetching home dashboard data:", error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
