import { useEffect } from "react";
import { Outlet, Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import OrgSidebar from "./OrgSidebar";
import Sidebar from "./Sidebar"; // Chat Sidebar
import { Loader } from "lucide-react";

const WorkspaceLayout = () => {
    const { orgId } = useParams();
    const { currentOrg, switchOrg, isLoading: isOrgLoading } = useOrgStore();
    const { authUser, isLoading: isAuthLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (orgId && (!currentOrg || currentOrg._id !== orgId)) {
            switchOrg(orgId);
        }
    }, [orgId, currentOrg, switchOrg]);

    // Redirect to last active org if at root /workspace
    useEffect(() => {
        if (!orgId && authUser?.lastActiveOrgId) {
            navigate(`/workspace/${authUser.lastActiveOrgId}/chat`);
        }
    }, [orgId, authUser, navigate]);

    if (isAuthLoading || isOrgLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <Loader className="size-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!authUser) return <Navigate to="/login" />;

    return (
        <div className="flex h-screen bg-gray-900 overflow-hidden font-sans text-white">
            {/* 1. Rail Sidebar (Organizations) */}
            <OrgSidebar />

            {/* 2. App Sidebar (Contextual: Chat/Calendar/Tasks) */}
            {/* For now, we only have Chat Sidebar, let's conditionally show it based on route */}
            {/* But since Sidebar handles its own viewType state internally, we might need to lift that up or control it via URL */}
            <div className="h-full shrink-0 border-r border-[#222] hidden md:flex">
                <Sidebar />
            </div>

            {/* 3. Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#000]">
                <Outlet />
            </main>
        </div>
    );
};

export default WorkspaceLayout;
