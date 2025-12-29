import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useOrgStore } from "../store/useOrgStore";
import ChatContainer from "../components/ChatContainer";
import ChatHeader from "../components/ChatHeader"; // We might reuse or custom
import MessageInput from "../components/MessageInput";
import { Briefcase, Users, CheckCircle, Clock, MessageSquare, Menu } from "lucide-react";

const ProjectDashboard = () => {
    const { selectedUser: project } = useChatStore(); // In this context, selectedUser IS the project object
    const { updateProjectStatus } = useOrgStore();
    const [subTab, setSubTab] = useState("overview"); // overview, chat
    const hasChat = !!project.chatId;

    if (!project) return null;

    return (
        <div className="flex-1 flex flex-col h-full bg-[#000] overflow-hidden">
            {/* Project Header */}
            <div className="h-16 border-b border-[#222] flex items-center justify-between px-6 bg-[#111]">
                <div className="flex items-center gap-4">
                    <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Briefcase className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">{project.name}</h1>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                            <span className={`size-2 rounded-full ${project.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            {project.status.toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#000] p-1 rounded-lg border border-[#222]">
                    <button
                        onClick={() => setSubTab("overview")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${subTab === 'overview' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setSubTab("chat")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${subTab === 'chat' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Chat <MessageSquare className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden flex flex-col relative">

                {subTab === "overview" && (
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Description Card */}
                            <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                                <h2 className="text-xl font-bold text-white mb-4">About Project</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    {project.description || "No description provided for this project."}
                                </p>
                            </div>

                            {/* Status & Members Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <CheckCircle className="size-5 text-primary" /> Status
                                    </h3>
                                    <div className="flex gap-2">
                                        {['active', 'on-hold', 'completed'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => updateProjectStatus(project._id, status)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalized
                                                    ${project.status === status
                                                        ? 'bg-primary/20 border-primary text-primary'
                                                        : 'bg-black/20 border-[#333] text-gray-500 hover:border-gray-500'
                                                    }`}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Users className="size-5 text-secondary" /> Team
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.members && project.members.map((member, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-[#222] pl-1 pr-3 py-1 rounded-full border border-[#333]">
                                                <img
                                                    src={(typeof member === 'object' ? member.profilePic : "/avatar.png") || "/avatar.png"}
                                                    className="size-6 rounded-full object-cover"
                                                    alt="Member"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-200">{(typeof member === 'object' ? member.fullName : "User")}</span>
                                                    {typeof member === 'object' && member.role && (
                                                        <span className="text-[9px] text-gray-500 leading-none capitalize">{member.role}</span>
                                                    )}
                                                </div>

                                                {project.lead === (member._id || member) && (
                                                    <span className="ml-1 text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 rounded uppercase font-bold tracking-wider">Lead</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {subTab === "chat" && (
                    <div className="flex-1 flex flex-col h-full">
                        {/* We reuse ChatContainer logic but we might need to adjust it if it expects a User object structure 
                            ChatContainer uses `selectedUser` from store. Since we set `selectedUser` to `project`, 
                            we need to ensure `ChatContainer` can handle `project` which has `chatId` (Channel ID).
                            
                            Actually, ChatContainer likely fetches messages based on selectedUser._id.
                            For PROJECT Chat, the messages are in the CHANNEL associated with the project.
                            So `ChatContainer` needs to use `project.chatId` NOT `project._id` for fetching messages.
                            
                            I should probably WRAP ChatContainer or modify it. 
                            If I modify ChatContainer to check `selectedUser.type === 'project'`, use `selectedUser.chatId`.
                        */}
                        <ChatContainer isProjectChat={true} />
                        <MessageInput isProjectChat={true} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProjectDashboard;
