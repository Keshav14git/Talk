import { useEffect } from "react";
import { Outlet, Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import OrgSidebar from "./OrgSidebar";
import Sidebar from "./Sidebar"; // Chat Sidebar
import ProfileMenu from "./ProfileMenu";
import DTPinReminder from "./DTPinReminder";
import ManagerMappingModal from "./ManagerMappingModal";
import { Loader } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const WorkspaceLayout = () => {
    const { orgId } = useParams();
    const { currentOrg, switchOrg, fetchOrgs, isLoading: isOrgLoading, orgs } = useOrgStore();
    const { authUser, isLoading: isAuthLoading, socket } = useAuthStore();
    const navigate = useNavigate();
    const [skipManagerModal, setSkipManagerModal] = useState(false);

    // Get current member info
    const myMember = currentOrg?.orgMembers?.find?.(m => (m.userId?._id || m._id) === authUser?._id) 
        || useOrgStore.getState().orgMembers?.find(m => (m.userId?._id || m._id) === authUser?._id);
    
    // Check if user is a top-level executive
    const userDesignation = authUser?.role?.toLowerCase() || "";
    const isTopLevel = ["founder", "ceo", "cto", "cfo", "coo", "president", "director"].some(title => userDesignation.includes(title));
    
    const needsManager = myMember && !myMember.managerId && myMember.accessLevel !== "owner" && !isTopLevel && !skipManagerModal;

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

    // Socket listeners for Ghost Notifications
    useEffect(() => {
        if (!socket) return;
        
        const handleRequestDeleted = (data) => {
            toast.error(`A pending request from ${data.requesterName} was deleted.`, {
                icon: '🗑️',
                style: {
                    borderRadius: '10px',
                    background: '#171717',
                    color: '#fff',
                    border: '1px solid #2f2f2f'
                },
            });
        };

        socket.on("request_deleted", handleRequestDeleted);
        socket.on("request_deleted_admin", handleRequestDeleted);

        return () => {
            socket.off("request_deleted", handleRequestDeleted);
            socket.off("request_deleted_admin", handleRequestDeleted);
        };
    }, [socket]);

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
            <main className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d] relative">
                <Outlet />
            </main>

            {/* DTPin Reminder Popup */}
            <DTPinReminder />

            {/* Manager Mapping Popup */}
            {needsManager && (
                <ManagerMappingModal onClose={() => setSkipManagerModal(true)} />
            )}
        </div>
    );
};

export default WorkspaceLayout;
