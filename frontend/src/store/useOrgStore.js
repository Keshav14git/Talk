import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useOrgStore = create((set, get) => ({
    orgs: [],
    currentOrg: null,
    orgMembers: [],
    orgProjects: [],
    isLoading: false, // General loading state for org list
    isLoadingOrg: false, // Specific org detail loading
    isCreatingOrg: false,
    isJoiningOrg: false,

    fetchOrgs: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/orgs/my-orgs");
            set({ orgs: res.data });
        } catch (error) {
            console.error("Error fetching orgs:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    switchOrg: async (orgId) => {
        // Optimistic switch if we have it in list
        const existingOrg = get().orgs.find(o => o._id === orgId);
        if (existingOrg) {
            set({ currentOrg: existingOrg });
        }

        // Fetch details
        await get().fetchOrgData();
    },

    fetchOrgData: async () => {
        set({ isLoadingOrg: true });
        try {
            const res = await axiosInstance.get("/orgs/data");
            set({
                currentOrg: res.data.org,
                orgMembers: res.data.members,
            });
            // Fetch projects separately to keep data clean
            get().fetchProjects();
        } catch (error) {
            console.error("Error fetching org data:", error);
            set({ currentOrg: null, orgMembers: [], orgProjects: [] });
        } finally {
            set({ isLoadingOrg: false });
        }
    },

    fetchProjects: async () => {
        try {
            const res = await axiosInstance.get("/projects");
            set({ orgProjects: res.data });
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    },

    createOrg: async (name) => {
        set({ isCreatingOrg: true });
        try {
            const res = await axiosInstance.post("/orgs/create", { name });
            set(state => ({
                orgs: [...state.orgs, res.data],
                currentOrg: res.data,
                orgMembers: [],
                orgProjects: []
            }));
            toast.success("Organization created successfully!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create organization");
            return false;
        } finally {
            set({ isCreatingOrg: false });
        }
    },

    joinOrg: async (data) => {
        set({ isJoiningOrg: true });
        try {
            const res = await axiosInstance.post("/orgs/join", data);
            set(state => ({
                orgs: [...state.orgs, res.data],
                currentOrg: res.data
            }));
            toast.success("Joined organization successfully!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to join organization");
            return false;
        } finally {
            set({ isJoiningOrg: false });
        }
    },

    setManager: async (orgId, managerEmployeeId) => {
        try {
            const res = await axiosInstance.post(`/orgs/${orgId}/set-manager`, { managerEmployeeId });
            toast.success("Manager assigned successfully!");
            // Refresh org data to update the current member's managerId
            await get().fetchOrgData();
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to set manager");
            return false;
        }
    },

    fetchMyTeam: async (orgId) => {
        try {
            const res = await axiosInstance.get(`/orgs/${orgId}/team`);
            return res.data;
        } catch (error) {
            console.error("Error fetching team:", error);
            return [];
        }
    },

    updateProjectStatus: async (projectId, status) => {
        try {
            await axiosInstance.patch(`/projects/${projectId}/status`, { status });
            set(state => ({
                orgProjects: state.orgProjects.map(p =>
                    p._id === projectId ? { ...p, status } : p
                )
            }));

            // Sync with ChatStore if selected
            const { selectedUser: project } = useChatStore.getState();
            if (project && project._id === projectId) {
                useChatStore.setState({ selectedUser: { ...project, status } });
            }

            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to update status");
        }
    },

    addProjectMember: async (projectId, userId) => {
        try {
            const res = await axiosInstance.post(`/projects/${projectId}/members`, { userId });

            // Update local state if this project is currently selected
            const { selectedUser: project } = useChatStore.getState();
            if (project && project._id === projectId) {
                useChatStore.setState({ selectedUser: res.data });
            }

            toast.success("Member added successfully");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add member");
            return false;
        }
    },

    updateMemberRole: async (projectId, userId, role) => {
        try {
            const res = await axiosInstance.post(`/projects/${projectId}/members/${userId}/role`, { role });
            
            // Update local state if this project is currently selected
            const { selectedUser: project } = useChatStore.getState();
            if (project && project._id === projectId) {
                useChatStore.setState({ selectedUser: res.data });
            }

            // Update in orgProjects list
            set(state => ({
                orgProjects: state.orgProjects.map(p => p._id === projectId ? res.data : p)
            }));

            toast.success("Role updated successfully");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update role");
            return false;
        }
    },

    deleteProject: async (projectId) => {
        try {
            await axiosInstance.delete(`/projects/${projectId}`);
            toast.success("Project deleted successfully");
            
            set(state => ({
                orgProjects: state.orgProjects.filter(p => p._id !== projectId)
            }));
            
            const { selectedUser: project } = useChatStore.getState();
            if (project && project._id === projectId) {
                useChatStore.setState({ selectedUser: null });
            }
            
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete project");
            return false;
        }
    },

    createProject: async (data) => {
        try {
            const res = await axiosInstance.post("/projects/create", data);
            toast.success("Project created");
            get().fetchProjects();
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create project");
            return false;
        }
    }

}));
