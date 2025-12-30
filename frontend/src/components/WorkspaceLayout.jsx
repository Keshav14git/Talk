import { useEffect } from "react";
import { Outlet, Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import OrgSidebar from "./OrgSidebar";
import Sidebar from "./Sidebar"; // Chat Sidebar
import ProfileMenu from "./ProfileMenu";
import { Loader } from "lucide-react";

const WorkspaceLayout = () => {
    const { orgId } = useParams();
    const { currentOrg, switchOrg, fetchOrgs, isLoading: isOrgLoading, orgs } = useOrgStore();
    const { authUser, isLoading: isAuthLoading } = useAuthStore();
    const navigate = useNavigate();

    // Fetch Orgs on Mount
    useEffect(() => {
        if (authUser && orgs.length === 0) {
            fetchOrgs();
        }
    }, [authUser, fetchOrgs, orgs.length]);

    // Handle Org Switch based on URL
    useEffect(() => {
        if (orgId && (!currentOrg || currentOrg._id !== orgId)) {
            switchOrg(orgId);
        }
    }, [orgId, currentOrg, switchOrg]);

    // Redirect to last active org if at root /workspace
    useEffect(() => {
        if (!orgId && authUser?.lastActiveOrgId && !currentOrg) {
            navigate(`/workspace/${authUser.lastActiveOrgId}/chat`);
        } else if (!orgId && orgs.length > 0 && !currentOrg) {
            navigate(`/workspace/${orgs[0]._id}/chat`);
        }
    }, [orgId, authUser, navigate, currentOrg, orgs]);

    if (isAuthLoading || (isOrgLoading && orgs.length === 0)) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <Loader className="size-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!authUser) return <Navigate to="/login" />;

    return (
        <div className="flex h-screen bg-gray-900 overflow-hidden font-sans text-white">
            {/* 2. App Sidebar (Contextual: Chat/Calendar/Tasks) */}
            <Sidebar />

            {/* 3. Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#000] relative">
                {/* Top Right Profile Button */}
                <div className="absolute top-4 right-6 z-50">
                    <ProfileMenu />
                </div>
                <Outlet />
            </main>
        </div>
    );
};

export default WorkspaceLayout;
