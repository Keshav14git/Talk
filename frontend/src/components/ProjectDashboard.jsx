import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useOrgStore } from "../store/useOrgStore";
import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatContainer from "../components/ChatContainer";
import AddProjectMemberModal from "../components/AddProjectMemberModal";
import CreateTaskModal from "../components/CreateTaskModal";
import {
    Briefcase, Users, CheckCircle, Clock, MessageSquare,
    Plus, Filter, ChevronDown, ChevronRight, AlertCircle, Flag, Calendar, Hash, User
} from "lucide-react";
import toast from "react-hot-toast";

const ProjectDashboard = () => {
    const { selectedUser: project } = useChatStore();
    const { updateProjectStatus } = useOrgStore();
    const { authUser } = useAuthStore();
    const { tasks, fetchTasks, updateTaskStatus, addTaskComment } = useTaskStore();

    // UI State
    const [subTab, setSubTab] = useState("overview");
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [expandedTask, setExpandedTask] = useState(null);
    const [commentText, setCommentText] = useState("");

    // Chat State
    const [activeChatMode, setActiveChatMode] = useState('general'); // 'general' | 'dm'
    const [activeDmUser, setActiveDmUser] = useState(null);

    // Fetch tasks when project changes or tab opens
    useEffect(() => {
        if (project?._id) {
            fetchTasks(project._id);
        }
    }, [project?._id, fetchTasks]);

    if (!project) return null;

    // Derived State
    const myTasks = tasks.filter(t => t.assignee?._id === authUser?._id && t.status !== 'completed');
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const isLead = project.lead === authUser._id || project.lead?._id === authUser._id;

    const handleStatusChange = async (taskId, newStatus) => {
        await updateTaskStatus(taskId, newStatus);
    };

    const handleSendComment = async (taskId) => {
        if (!commentText.trim()) return;
        await addTaskComment(taskId, commentText);
        setCommentText("");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'in-progress': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            case 'blocked': return 'bg-red-500/20 text-red-500 border-red-500/30';
            case 'delayed': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
            default: return 'bg-gray-800 text-gray-400 border-gray-700';
        }
    };

    const getPriorityIcon = (priority) => {
        const color = priority === 'urgent' ? 'text-red-500' : priority === 'high' ? 'text-orange-500' : 'text-blue-400';
        return <Flag className={`size-3.5 ${color}`} strokeWidth={3} />;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#000] overflow-hidden">
            {/* Project Header */}
            <div className="h-16 border-b border-[#222] flex items-center justify-between px-6 bg-[#111] shrink-0">
                <div className="flex items-center gap-4">
                    <div className="size-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                        <Briefcase className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-tight">{project.name}</h1>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                            {project.members?.length} Members • Updated {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4">
                    {isLead && subTab === 'overview' && (
                        <button
                            onClick={() => setShowAddMember(true)}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#333] flex items-center gap-2 transition-colors"
                        >
                            <Users className="size-3.5" /> Add Member
                        </button>
                    )}

                    <div className="flex bg-[#000] p-1 rounded-lg border border-[#222]">
                        <button onClick={() => setSubTab("overview")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${subTab === 'overview' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                            Overview
                        </button>
                        <button onClick={() => setSubTab("chat")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${subTab === 'chat' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                            Chat
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-gradient-to-br from-[#050505] to-[#000]">

                {subTab === "overview" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <div className="max-w-6xl mx-auto space-y-8">

                            {/* Stats Banner */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Progress */}
                                <div className="bg-[#111] border border-[#222] rounded-2xl p-5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <CheckCircle className="size-20 text-green-500" />
                                    </div>
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Project Completion</h3>
                                    <div className="flex items-end gap-2 mb-3">
                                        <span className="text-3xl font-bold text-white">{progress}%</span>
                                        <span className="text-sm text-gray-500 mb-1">{completedTasks}/{tasks.length} tasks</span>
                                    </div>
                                    <div className="w-full bg-[#222] rounded-full h-1.5">
                                        <div className="bg-green-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                {/* My Tasks Count */}
                                <div className="bg-[#111] border border-[#222] rounded-2xl p-5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <AlertCircle className="size-20 text-indigo-500" />
                                    </div>
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">My Pending Tasks</h3>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-white">{myTasks.length}</span>
                                        <span className="text-sm text-indigo-400 mb-1 font-medium">Require attention</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="bg-[#111] border border-[#222] rounded-2xl p-5 flex flex-col justify-center gap-3">
                                    <button onClick={() => setShowCreateTask(true)} className="w-full py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-white/5">
                                        <Plus className="size-4" /> Create New Task
                                    </button>
                                </div>
                            </div>

                            {/* Main Task List */}
                            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden min-h-[400px]">
                                <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#161616]">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <div className="size-6 bg-indigo-500/10 rounded flex items-center justify-center">
                                            <Filter className="size-3.5 text-indigo-400" />
                                        </div>
                                        All Tasks
                                    </h3>
                                    <span className="text-xs text-gray-500">{tasks.length} tasks total</span>
                                </div>

                                <div className="divide-y divide-[#222]">
                                    {tasks.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500">
                                            <div className="size-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle className="size-8 text-gray-700" />
                                            </div>
                                            <p className="font-medium text-gray-400">No tasks created yet</p>
                                            <p className="text-sm mt-1">Get started by creating a task for the team.</p>
                                        </div>
                                    ) : (
                                        tasks.map(task => (
                                            <div key={task._id} className="group bg-[#111] hover:bg-[#161616] transition-colors">
                                                {/* Task Row ... (Kept same as before) */}
                                                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}>
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border appearance-none cursor-pointer focus:outline-none ${getStatusColor(task.status)}`}
                                                        >
                                                            <option value="todo">Todo</option>
                                                            <option value="in-progress">In Progress</option>
                                                            <option value="blocked">Blocked</option>
                                                            <option value="delayed">Delayed</option>
                                                            <option value="completed">Done</option>
                                                        </select>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                                                {task.title}
                                                            </span>
                                                            <div className="text-xs">{getPriorityIcon(task.priority)}</div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="size-3" />
                                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                                                            </span>
                                                            {task.assignee && (
                                                                <span className="flex items-center gap-1 text-gray-400">
                                                                    Assigned to <span className="text-indigo-400">{task.assignee.fullName}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {task.assignee ? (
                                                            <img src={task.assignee.profilePic || "/avatar.png"} className="size-8 rounded-full object-cover border border-[#333]" title={`Assigned to ${task.assignee.fullName}`} />
                                                        ) : (
                                                            <div className="size-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-gray-600">
                                                                <User className="size-4" />
                                                            </div>
                                                        )}

                                                        <button className="text-gray-600 hover:text-white transition-colors">
                                                            {expandedTask === task._id ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {expandedTask === task._id && (
                                                    <div className="px-4 pb-4 pl-14 animate-in slide-in-from-top-2 duration-200">
                                                        <div className="bg-[#0a0a0a] rounded-xl border border-[#222] p-4">
                                                            {task.description && (
                                                                <div className="mb-4 text-sm text-gray-400">
                                                                    <p className="font-semibold text-gray-500 text-xs uppercase mb-1">Description</p>
                                                                    {task.description}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-gray-500 text-xs uppercase mb-2">Activity & Comments</p>
                                                                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                                                                    {task.comments?.length === 0 && <p className="text-xs text-gray-600 italic">No comments yet.</p>}
                                                                    {task.comments?.map((comment, i) => (
                                                                        <div key={i} className="flex gap-2 text-sm">
                                                                            <img src={comment.user?.profilePic || "/avatar.png"} className="size-6 rounded-full object-cover mt-0.5" />
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-bold text-gray-300 text-xs">{comment.user?.fullName}</span>
                                                                                    <span className="text-[10px] text-gray-600">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                                                                </div>
                                                                                <p className="text-gray-400 text-xs">{comment.text}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Write a comment..."
                                                                        value={commentText}
                                                                        onChange={(e) => setCommentText(e.target.value)}
                                                                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment(task._id)}
                                                                        className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                                                    />
                                                                    <button onClick={() => handleSendComment(task._id)} className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200">
                                                                        Post
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PROJECT CHAT TAB - Split View */}
                {subTab === "chat" && (
                    <div className="flex flex-1 h-full overflow-hidden">
                        {/* 1. Sidebar Project Channels/Members */}
                        <div className="w-64 bg-[#0a0a0a] border-r border-[#222] flex flex-col pt-4">
                            <div className="px-4 mb-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Channels</h3>
                                <button
                                    onClick={() => { setActiveChatMode('general'); setActiveDmUser(null); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all 
                                    ${activeChatMode === 'general' ? 'bg-[#222] text-white' : 'text-gray-400 hover:bg-[#151515] hover:text-gray-300'}`}
                                >
                                    <Hash className="size-4 opacity-50" /> General
                                </button>
                            </div>

                            <div className="px-4 flex-1 overflow-y-auto custom-scrollbar">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Members</h3>
                                <div className="space-y-1">
                                    {project.members?.map(member => {
                                        const user = member.userId || member;
                                        // Don't list self if you want, or keep for self-storage. Usually exclude self from DMs.
                                        if (user._id === authUser._id) return null; // Exclude self
                                        // Also exclude if not an object
                                        if (typeof user !== 'object') return null;

                                        return (
                                            <button
                                                key={user._id}
                                                onClick={() => { setActiveChatMode('dm'); setActiveDmUser(user); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all 
                                                ${activeChatMode === 'dm' && activeDmUser?._id === user._id ? 'bg-[#222] text-white' : 'text-gray-400 hover:bg-[#151515] hover:text-gray-300'}`}
                                            >
                                                <div className="relative">
                                                    <img src={user.profilePic || "/avatar.png"} className="size-5 rounded-full object-cover" />
                                                    {/* Startus dot could go here if we tracked online status per member easily */}
                                                </div>
                                                <span className="truncate">{user.fullName}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 2. Main Chat Area */}
                        <div className="flex-1 flex flex-col h-full bg-[#000]">
                            {activeChatMode === 'general' ? (
                                <ChatContainer isProjectChat={true} overrideType="project" overrideUser={project} />
                            ) : (
                                <ChatContainer isProjectChat={false} overrideType="user" overrideUser={activeDmUser} />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showCreateTask && <CreateTaskModal project={project} onClose={() => setShowCreateTask(false)} />}
            {showAddMember && <AddProjectMemberModal project={project} onClose={() => setShowAddMember(false)} />}
        </div>
    );
};

export default ProjectDashboard;
