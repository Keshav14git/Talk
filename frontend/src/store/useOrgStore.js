import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useOrgStore = create((set, get) => ({
    orgs: [],
    currentOrg: null,
    isLoading: false,

    fetchOrgs: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/orgs/my-orgs");
            set({ orgs: res.data });

            // Auto-select first org if none selected (or restore from localStorage if we implemented persistence)
            if (res.data.length > 0 && !get().currentOrg) {
                set({ currentOrg: res.data[0] });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch organizations");
        } finally {
            set({ isLoading: false });
        }
    },

    createOrg: async (name) => {
        try {
            const res = await axiosInstance.post("/orgs/create", { name });
            set({
                orgs: [...get().orgs, res.data.org],
                currentOrg: res.data.org
            });
            toast.success("Workspace created!");
            return res.data.org;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create workspace");
        }
    },

    setCurrentOrg: (org) => {
        set({ currentOrg: org });
        // Ideally we also navigate here or let the UI handle it via Link
    },

    // Specific Org Details (for switching)
    switchOrg: async (orgId) => {
        try {
            const res = await axiosInstance.get(`/orgs/${orgId}`);
            set({ currentOrg: res.data.org });
            // We might also want to fetch channels for this org here or in ChatStore
            return res.data;
        } catch (error) {
            console.error("Failed to switch org", error);
        }
    }
}));
