import { useEffect, useState } from "react";
import { useApprovalStore } from "../store/useApprovalStore";
import { useAuthStore } from "../store/useAuthStore";
import { useParams } from "react-router-dom";
import { useOrgStore } from "../store/useOrgStore";
import { CheckCircle, XCircle, Clock, Inbox, Send, FileText, ChevronRight, Trash2, History, CalendarDays, Menu } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import RequestForms from "./forms/RequestForms";

const ApprovalCenter = () => {
    const { orgId } = useParams();
    const { authUser } = useAuthStore();
    const { orgMembers } = useOrgStore();
    const { setSidebarOpen } = useChatStore();
    const { inbox, sentRequests, history, leaveBalance, fetchInbox, fetchSentRequests, fetchHistory, fetchLeaveBalance, updateRequestStatus, deleteRequest, isLoading } = useApprovalStore();
    
    // Check if user is an admin/owner
    const myMember = orgMembers.find(m => (m.userId?._id || m._id) === authUser?._id);
    const isAdmin = myMember?.role === "admin" || myMember?.role === "owner";

    const [activeTab, setActiveTab] = useState("my-requests"); // 'my-requests', 'inbox', 'new'
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        if (orgId) {
            fetchSentRequests(orgId);
            fetchInbox(orgId);
            fetchHistory(orgId);
            fetchLeaveBalance(orgId);
        }
    }, [orgId, fetchInbox, fetchSentRequests, fetchHistory, fetchLeaveBalance]);

    const handleApprove = (id) => updateRequestStatus(orgId, id, "approved");
    const handleDeny = (id) => updateRequestStatus(orgId, id, "denied");
    const handleDelete = (id) => deleteRequest(orgId, id);

    const getStatusIcon = (status) => {
        switch(status) {
            case "approved": return <CheckCircle className="text-emerald-500 w-5 h-5" />;
            case "denied": return <XCircle className="text-rose-500 w-5 h-5" />;
            default: return <Clock className="text-amber-500 w-5 h-5" />;
        }
    };

    const renderList = (requests, isInbox = false, isHistory = false) => {
        if (!Array.isArray(requests)) {
            console.error("Expected array but got:", requests);
            return <div className="p-8 text-center text-red-500">Error loading requests. Please try again.</div>;
        }
        if (requests.length === 0) return <div className="p-8 text-center text-gray-500">No requests found.</div>;
        
        return (
            <div className="space-y-4 p-4 md:p-8 lg:p-12 pt-4 md:pt-6">
                {requests.map(req => (
                    <div key={req._id} className="bg-[#171717] border border-[#2f2f2f] hover:border-gray-600 transition-colors rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="flex-1 w-full max-w-3xl">
                            <div className="flex items-center gap-3 mb-3">
                                {getStatusIcon(req.status)}
                                <span className="text-gray-200 font-semibold text-[15px] capitalize">{req.type.replace(/_/g, ' ')}</span>
                                <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-1 rounded-md bg-[#2a2a2a] text-gray-400 border border-[#3f3f3f]">
                                    {req.category.replace(/_/g, ' ')}
                                </span>
                            </div>
                            
                            {(isInbox || isHistory) && (
                                <div className="text-[13px] text-gray-400 mb-4 flex items-center gap-2">
                                    <span>Requested by:</span>
                                    <div className="flex items-center gap-1.5 text-gray-200">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold uppercase">
                                            {req.requesterId?.fullName?.[0] || "?"}
                                        </div>
                                        {req.requesterId?.fullName || "Unknown"}
                                    </div>
                                </div>
                            )}

                            <div className="bg-[#0d0d0d] rounded-lg p-4 text-[13px] text-gray-300 border border-[#2f2f2f]">
                                {Object.entries(req.formPayload).map(([key, value]) => (
                                    <div key={key} className="flex gap-4 mb-2 last:mb-0">
                                        <span className="text-gray-500 capitalize min-w-[120px] font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                        <span className="text-gray-300">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isInbox && req.status === "pending" && (
                            <div className="flex flex-row md:flex-col gap-2 md:ml-6 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                                <button onClick={() => handleApprove(req._id)} className="flex-1 md:flex-none px-5 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors text-[13px] font-medium border border-emerald-500/20 hover:border-emerald-500 min-w-[100px]">
                                    Approve
                                </button>
                                <button onClick={() => handleDeny(req._id)} className="flex-1 md:flex-none px-5 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors text-[13px] font-medium border border-rose-500/20 hover:border-rose-500 min-w-[100px]">
                                    Deny
                                </button>
                            </div>
                        )}
                        
                        {!isInbox && !isHistory && req.status === "pending" && (
                            <div className="flex flex-col gap-2 md:ml-6 shrink-0 justify-center absolute md:static top-4 right-4">
                                <button onClick={() => handleDelete(req._id)} className="p-2 text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20" title="Delete Request">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {(!isInbox || isHistory) && req.status !== "pending" && req.reviewedBy && (
                            <div className="text-[12px] text-gray-500 text-right ml-6 shrink-0 flex flex-col justify-center">
                                <div className="mb-1">Reviewed by</div>
                                <div className="font-medium text-gray-400">{req.reviewedBy.fullName}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0d0d0d]">
            <div className="h-16 border-b border-[#2f2f2f] bg-[#0d0d0d] flex items-center px-4 md:px-6 shrink-0 gap-3">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors shrink-0">
                    <Menu className="size-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-200 flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Approval Center
                </h1>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#2f2f2f] bg-[#171717] p-2 md:p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto hide-scrollbar">
                    <button 
                        onClick={() => setActiveTab("new")}
                        className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-2.5 rounded-lg transition-all text-[13px] md:text-[14px] shrink-0 ${activeTab === "new" ? "bg-indigo-500/10 text-indigo-400 font-medium" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"}`}
                    >
                        <Send className="w-4 h-4" />
                        <span className="whitespace-nowrap">Submit Request</span>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab("my-requests")}
                        className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-2.5 rounded-lg transition-all text-[13px] md:text-[14px] shrink-0 ${activeTab === "my-requests" ? "bg-[#2a2a2a] text-gray-200 font-medium" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"}`}
                    >
                        <Clock className="w-4 h-4" />
                        <span className="whitespace-nowrap">My Requests</span>
                    </button>

                    {(isAdmin || inbox.length > 0 || history?.length > 0) && (
                        <>
                            <button 
                                onClick={() => setActiveTab("inbox")}
                                className={`flex items-center justify-between gap-4 px-4 py-2 md:py-2.5 rounded-lg transition-all text-[13px] md:text-[14px] shrink-0 ${activeTab === "inbox" ? "bg-[#2a2a2a] text-gray-200 font-medium" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"}`}
                            >
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Inbox className="w-4 h-4" />
                                    <span className="whitespace-nowrap">Approvals Inbox</span>
                                </div>
                                {inbox.length > 0 && (
                                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {inbox.length}
                                    </span>
                                )}
                            </button>

                            <button 
                                onClick={() => setActiveTab("history")}
                                className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-2.5 rounded-lg transition-all text-[13px] md:text-[14px] shrink-0 ${activeTab === "history" ? "bg-[#2a2a2a] text-gray-200 font-medium" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"}`}
                            >
                                <History className="w-4 h-4" />
                                <span className="whitespace-nowrap">History</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-[#0d0d0d]/50 flex items-center justify-center z-10">
                            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                    
                    {activeTab === "new" && (
                        <div className="p-8 lg:p-12">
                            <RequestForms orgId={orgId} onSuccess={() => setActiveTab("my-requests")} />
                        </div>
                    )}

                    {activeTab === "my-requests" && (
                        <div className="flex flex-col h-full">
                            {leaveBalance && (
                                <div className="px-8 lg:px-12 pt-8 pb-4 shrink-0">
                                    <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4" /> Leave Balance
                                    </h2>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-[#171717] border border-[#2f2f2f] rounded-xl p-4">
                                            <div className="text-gray-500 text-[12px] font-medium mb-1">Total Leaves</div>
                                            <div className="text-2xl font-bold text-gray-200">{leaveBalance.totalLeaves}</div>
                                        </div>
                                        <div className="bg-[#171717] border border-[#2f2f2f] rounded-xl p-4 flex justify-between items-end">
                                            <div>
                                                <div className="text-gray-500 text-[12px] font-medium mb-1">Taken</div>
                                                <div className="text-2xl font-bold text-rose-400">{leaveBalance.takenLeaves}</div>
                                            </div>
                                            <div className="text-right text-[11px] text-gray-500">
                                                <span className="text-gray-300 font-medium block">{leaveBalance.leavesThisMonth}</span>
                                                this month
                                            </div>
                                        </div>
                                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                                            <div className="text-indigo-400/80 text-[12px] font-medium mb-1">Remaining</div>
                                            <div className="text-2xl font-bold text-indigo-400">{leaveBalance.leavesLeft}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="max-w-6xl mx-auto w-full">
                                <div className="p-8 lg:p-12 pb-6 border-b border-[#2f2f2f]">
                                    <h2 className="text-xl font-semibold text-gray-200">My Sent Requests</h2>
                                    <p className="text-[14px] text-gray-400 mt-1">Track the status of your submissions.</p>
                                </div>
                                {isLoading ? <div className="p-8 lg:p-12 text-gray-500">Loading...</div> : renderList(sentRequests, false, false)}
                            </div>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="max-w-6xl mx-auto w-full">
                            <div className="p-8 lg:p-12 pb-6 border-b border-[#2f2f2f]">
                                <h2 className="text-xl font-semibold text-gray-200">Approval History</h2>
                                <p className="text-[14px] text-gray-400 mt-1">Past approved or denied requests.</p>
                            </div>
                            {isLoading ? <div className="p-8 lg:p-12 text-gray-500">Loading...</div> : renderList(history, false, true)}
                        </div>
                    )}

                    {activeTab === "inbox" && (isAdmin || inbox.length > 0) && (
                        <div className="max-w-6xl mx-auto w-full">
                            <div className="p-8 lg:p-12 pb-6 border-b border-[#2f2f2f]">
                                <h2 className="text-xl font-semibold text-gray-200">Pending Approvals</h2>
                                <p className="text-[14px] text-gray-400 mt-1">Review requests from your team members.</p>
                            </div>
                            {isLoading ? <div className="p-8 lg:p-12 text-gray-500">Loading...</div> : renderList(inbox, true)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovalCenter;
