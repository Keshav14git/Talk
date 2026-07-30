import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useOrgStore } from "../store/useOrgStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, User, Clock, ChevronRight, Menu } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const TeamDashboard = () => {
    const { orgId } = useParams();
    const { fetchMyTeam } = useOrgStore();
    const { onlineUsers } = useAuthStore();
    const { setSidebarOpen } = useChatStore();
    const [team, setTeam] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTeam = async () => {
            setIsLoading(true);
            const data = await fetchMyTeam(orgId);
            setTeam(data);
            setIsLoading(false);
        };
        
        if (orgId) {
            loadTeam();
        }
    }, [orgId, fetchMyTeam]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col h-full bg-[#0d0d0d]">
                <div className="h-16 border-b border-[#2f2f2f] flex items-center px-4 md:px-6 shrink-0 gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors shrink-0">
                        <Menu className="size-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-200 flex items-center gap-2.5">
                        <Users className="w-5 h-5 text-indigo-400" />
                        My Team
                    </h1>
                </div>
                <div className="flex-1 p-4 md:p-8 text-gray-500">Loading team data...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0d0d0d]">
            <div className="h-16 border-b border-[#2f2f2f] flex items-center px-4 md:px-6 shrink-0 gap-3">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors shrink-0">
                    <Menu className="size-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-200 flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-indigo-400" />
                    My Team
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto w-full">
                    
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-200">Direct Reports</h2>
                        <p className="text-[14px] text-gray-400 mt-1">
                            Employees mapped under you in the organizational hierarchy.
                        </p>
                    </div>

                    {team.length === 0 ? (
                        <div className="bg-[#171717] border border-[#2f2f2f] rounded-xl p-12 text-center">
                            <div className="w-16 h-16 bg-[#2a2a2a] rounded-full mx-auto flex items-center justify-center mb-4">
                                <User className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">No direct reports</h3>
                            <p className="text-gray-500 text-[14px] max-w-md mx-auto">
                                You currently do not have any employees mapped under you. When new members join and enter your Employee ID, they will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {team.map(member => (
                                <div key={member._id} className="bg-[#171717] border border-[#2f2f2f] hover:border-gray-600 transition-colors rounded-xl p-6 group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img 
                                                    src={member.profilePic || "/avatar.png"} 
                                                    alt={member.fullName} 
                                                    className="w-10 h-10 rounded-lg object-cover bg-gray-800"
                                                />
                                                {onlineUsers.includes(member._id) && (
                                                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#171717] rounded-full" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-[15px] font-semibold text-gray-200 leading-tight">{member.fullName}</h3>
                                                <span className="text-[12px] text-gray-400 capitalize">{member.designation || member.accessLevel}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 pt-4 border-t border-[#2f2f2f]">
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-gray-500">Employee ID</span>
                                            <span className="text-gray-300 font-medium">{member.employeeId || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-gray-500">Email</span>
                                            <span className="text-gray-300 truncate max-w-[150px]" title={member.email}>{member.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-gray-500">Joined</span>
                                            <span className="text-gray-300">{new Date(member.joinedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-6 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 py-2.5 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2 group-hover:text-white">
                                        <Clock className="w-4 h-4" />
                                        View Recent Activity
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;
