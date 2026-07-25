import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useApprovalStore = create((set, get) => ({
    inbox: [],
    sentRequests: [],
    history: [],
    leaveBalance: null,
    isLoading: false,

    fetchInbox: async (orgId) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/orgs/${orgId}/approvals/inbox`);
            set({ inbox: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch inbox");
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSentRequests: async (orgId) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/orgs/${orgId}/approvals/sent`);
            if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
                throw new Error("API returned HTML. Backend server might not have the latest routes.");
            }
            set({ sentRequests: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch sent requests");
        } finally {
            set({ isLoading: false });
        }
    },

    fetchHistory: async (orgId) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/orgs/${orgId}/approvals/history`);
            set({ history: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch history");
        } finally {
            set({ isLoading: false });
        }
    },

    fetchLeaveBalance: async (orgId) => {
        try {
            const res = await axiosInstance.get(`/orgs/${orgId}/approvals/leave-balance`);
            if (typeof res.data === 'string' && res.data.toLowerCase().includes('<!doctype html>')) {
                throw new Error("API returned HTML. Backend server might not have the latest routes.");
            }
            set({ leaveBalance: res.data });
        } catch (error) {
            console.error("Failed to fetch leave balance", error);
            toast.error("Failed to load leave balances. Ensure backend is restarted.");
        }
    },

    submitRequest: async (orgId, requestData) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post(`/orgs/${orgId}/approvals`, requestData);
            set({ sentRequests: [res.data, ...get().sentRequests] });
            toast.success("Request submitted successfully");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit request");
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    updateRequestStatus: async (orgId, requestId, status, reviewNotes = "") => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.put(`/orgs/${orgId}/approvals/${requestId}`, { status, reviewNotes });
            
            // Update inbox to remove or update the status
            set({
                inbox: get().inbox.map(req => req._id === requestId ? res.data : req)
            });
            
            toast.success(`Request ${status}`);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update request");
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteRequest: async (orgId, requestId) => {
        try {
            await axiosInstance.delete(`/orgs/${orgId}/approvals/${requestId}`);
            set(state => ({
                sentRequests: state.sentRequests.filter(req => req._id !== requestId)
            }));
            toast.success("Request deleted successfully");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete request");
            return false;
        }
    }
}));
