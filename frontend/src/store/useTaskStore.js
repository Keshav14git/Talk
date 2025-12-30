import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useTaskStore = create((set, get) => ({
    tasks: [],
    isLoading: false,

    fetchTasks: async (projectId) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`projects/${projectId}/tasks`);
            set({ tasks: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch tasks");
        } finally {
            set({ isLoading: false });
        }
    },

    createTask: async (projectId, taskData) => {
        try {
            const res = await axiosInstance.post(`projects/${projectId}/tasks`, taskData);
            set({ tasks: [res.data, ...get().tasks] });
            toast.success("Task created successfully");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create task");
            return false;
        }
    },

    updateTaskStatus: async (taskId, status) => {
        try {
            const res = await axiosInstance.patch(`projects/tasks/${taskId}/status`, { status });
            // Update local state
            set({
                tasks: get().tasks.map((task) =>
                    task._id === taskId ? res.data : task
                ),
            });
            toast.success("Task status updated");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    },

    addTaskComment: async (taskId, text) => {
        try {
            const res = await axiosInstance.post(`projects/tasks/${taskId}/comments`, { text });
            // Update local state - the backend returns the full updated task
            set({
                tasks: get().tasks.map((task) =>
                    task._id === taskId ? res.data : task
                ),
            });
            toast.success("Comment added");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add comment");
        }
    },
}));
