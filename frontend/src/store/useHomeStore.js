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
                    end: new Date(event.end),
                    // Specific fields mapping if necessary, assuming backend sends them flat or we map them here
                    // If backend sends 'type' as 'online'/'offline', we might want to differentiate from 'meeting'/'task' event.type
                    // The backend sends normalized events? No, looking at calendar.controller.js it sends normalized events.
                    // We need to update calendar.controller.js to send these fields too.
                }))
            });
        } catch (error) {
            console.error("Error fetching home dashboard data:", error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
