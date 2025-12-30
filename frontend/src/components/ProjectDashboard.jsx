import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useOrgStore } from "../store/useOrgStore";
import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatContainer from "../components/ChatContainer";
import AddProjectMemberModal from "../components/AddProjectMemberModal";
import CreateTaskModal from "../components/CreateTaskModal";
import {
    Briefcase, Users, CheckCircle, Clock, MessageSquare,
    Plus, Filter, ChevronDown, ChevronRight, AlertCircle, Flag, Calendar, Hash, User, Settings, Layout, Activity, ArrowUpRight
} from "lucide-react";
import toast from "react-hot-toast";

const ProjectDashboard = ({ project }) => {
    const { authUser } = useAuthStore();
    const { users } = useChatStore();
    const { tasks, fetchTasks, updateTaskStatus, addTaskComment } = useTaskStore();

    // UI State
    const [subTab, setSubTab] = useState("overview");
    const [taskView, setTaskView] = useState("all"); // all, my, overdue, completed, blocked
    const [groupBy, setGroupBy] = useState("status"); // status, assignee, priority, none
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [expandedTask, setExpandedTask] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [mentionQuery, setMentionQuery] = useState("");
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);

    const { orgMembers } = useOrgStore(); // Ensure we have org members for mentions

    // Mention Filtering
    const filteredMembers = orgMembers.filter(member =>
        member.fullName.toLowerCase().includes(mentionQuery.toLowerCase()) &&
        member._id !== authUser._id
    );

    const handleCommentChange = (e) => {
        const val = e.target.value;
        setCommentText(val);

        const lastAt = val.lastIndexOf('@');
        if (lastAt !== -1 && lastAt >= val.length - 15) { // Simple check: @ recently typed
            const query = val.slice(lastAt + 1);
            if (!query.includes(" ")) { // Only if no space after @ yet
                setMentionQuery(query);
                setShowMentionDropdown(true);
                return;
            }
        }
        setShowMentionDropdown(false);
    };

    const insertMention = (member) => {
        const lastAt = commentText.lastIndexOf('@');
        const newText = commentText.slice(0, lastAt) + "@" + member.fullName + " " + commentText.slice(lastAt + 1 + mentionQuery.length);
        setCommentText(newText);
        setShowMentionDropdown(false);
    };

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

    // Recent Activity (Derived)
    const recentActivity = [...tasks]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);

    // Filter Tasks based on View
    const getFilteredTasks = () => {
        let filtered = tasks;
        if (taskView === 'my') {
            filtered = tasks.filter(t => t.assignee?._id === authUser?._id);
        } else if (taskView === 'overdue') {
            filtered = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');
        } else if (taskView === 'completed') {
            filtered = tasks.filter(t => t.status === 'completed');
        } else if (taskView === 'blocked') {
            filtered = tasks.filter(t => t.status === 'blocked');
        }
        return filtered;
    };

    const filteredTaskList = getFilteredTasks();

    // Grouping Logic
    const groupedTasks = () => {
        const groups = {};
        const list = filteredTaskList;

        if (groupBy === 'status') {
            ['todo', 'in-progress', 'blocked', 'completed'].forEach(s => groups[s] = []);
            list.forEach(t => {
                const s = t.status || 'todo';
                if (!groups[s]) groups[s] = [];
                groups[s].push(t);
            });
        } else if (groupBy === 'assignee') {
            list.forEach(t => {
                const key = t.assignee?.fullName || 'Unassigned';
                if (!groups[key]) groups[key] = [];
                groups[key].push(t);
            });
        }
        else if (groupBy === 'priority') {
            ['urgent', 'high', 'medium', 'low'].forEach(p => groups[p] = []);
            list.forEach(t => {
                const p = t.priority || 'medium';
                if (!groups[p]) groups[p] = [];
                groups[p].push(t);
            });
        } else {
            groups['All Tasks'] = list;
        }
        return groups;
    };

    const taskGroups = groupedTasks();

    const handleStatusChange = async (taskId, newStatus) => {
        await updateTaskStatus(taskId, newStatus);
    };

    const handleSendComment = async (taskId) => {
        if (!commentText.trim()) return;

        // Extract mentions
        const mentions = orgMembers
            .filter(m => commentText.includes("@" + m.fullName))
            .map(m => m._id);

        await addTaskComment(taskId, commentText, mentions);
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
            {/* Project Header - Control Strip */}
            <div className="h-16 border-b border-[#222] flex items-center justify-between px-6 bg-[#111] shrink-0">
                <div className="flex items-center gap-6">
                    {/* Identity */}
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 ring-1 ring-inset ring-indigo-500/20">
                            <Briefcase className="size-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-xl font-bold text-white leading-none tracking-tight">{project.name}</h1>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${project.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    project.status === 'archived' ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' :
                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                    {project.status || 'Active'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5 hover:text-gray-300 transition-colors cursor-default">
                                    <Clock className="size-3.5" /> Updated {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                                {project.lead && (
                                    <div className="flex items-center gap-1.5 pl-4 border-l border-[#333]">
                                        <span className="text-gray-600">Lead:</span>
                                        <div className="flex items-center gap-1.5">
                                            <img src={(project.lead.profilePic || project.lead?.profilePic) || "/avatar.png"} className="size-4 rounded-full" />
                                            <span className="text-gray-300">{project.lead.fullName || project.lead?.fullName}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {isLead && subTab === 'overview' && (
                        <button
                            onClick={() => setShowAddMember(true)}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold px-3 py-2 rounded-lg border border-[#333] flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Users className="size-3.5" />
                            <span>Add Member</span>
                        </button>
                    )}

                    <div className="h-8 w-[1px] bg-[#333] mx-2"></div>

                    {/* Tabs */}
                    <div className="flex bg-[#000] p-1 rounded-lg border border-[#222]">
                        <button onClick={() => setSubTab("overview")} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${subTab === 'overview' ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                            Overview
                        </button>
                        <button onClick={() => setSubTab("chat")} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${subTab === 'chat' ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                            Chat
                        </button>
                    </div>

                    <button className="p-2 text-gray-500 hover:text-white hover:bg-[#222] rounded-lg transition-colors">
                        <Settings className="size-5" />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-gradient-to-br from-[#050505] to-[#000]">

                {subTab === "overview" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <div className="max-w-7xl mx-auto space-y-8">

                            {/* Stats Banner - Enterprise Grade */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Project Health / Completion */}
                                <div className="bg-[#111] border border-[#222] rounded-2xl p-6 relative overflow-hidden group hover:border-[#333] transition-colors">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <CheckCircle className="size-24 text-white" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Project Health</h3>
                                        <div className="flex items-baseline gap-3 mb-2">
                                            <span className="text-4xl font-black text-white">{progress}%</span>
                                            <span className="text-sm font-medium text-gray-400">Complete</span>
                                        </div>

                                        <div className="w-full bg-[#222] rounded-full h-2 mb-3 overflow-hidden">
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 font-medium">
                                            {completedTasks} tasks completed out of {tasks.length}
                                        </p>
                                    </div>
                                </div>

                                {/* Pending Attention */}
                                <div className="bg-[#111] border border-[#222] rounded-2xl p-6 relative overflow-hidden group hover:border-[#333] transition-colors">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <AlertCircle className="size-24 text-indigo-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Your Focus</h3>
                                        <div className="flex items-baseline gap-3 mb-2">
                                            <span className="text-4xl font-black text-white">{myTasks.length}</span>
                                            <span className="text-sm font-medium text-indigo-400">Pending Tasks</span>
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            {myTasks.slice(0, 2).map(t => (
                                                <div key={t._id} className="flex items-center gap-2 text-xs text-gray-300">
                                                    <div className={`size-1.5 rounded-full ${t.priority === 'urgent' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                                                    <span className="truncate max-w-[180px]">{t.title}</span>
                                                </div>
                                            ))}
                                            {myTasks.length === 0 && (
                                                <p className="text-xs text-gray-500 italic">You're all caught up!</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions & Team Status */}
                                <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Team Status</h3>
                                        <div className="flex -space-x-2 overflow-hidden mb-4">
                                            {project.members?.slice(0, 5).map((m, i) => (
                                                <img
                                                    key={i}
                                                    className="inline-block size-8 rounded-full ring-2 ring-[#111] object-cover"
                                                    src={(m.userId?.profilePic || m.profilePic) || "/avatar.png"}
                                                    alt=""
                                                />
                                            ))}
                                            {(project.members?.length > 5) && (
                                                <div className="flex items-center justify-center size-8 rounded-full ring-2 ring-[#111] bg-[#222] text-[10px] font-bold text-gray-400">
                                                    +{project.members.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => setShowCreateTask(true)} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-white/5 active:translate-y-0.5">
                                        <Plus className="size-4" strokeWidth={3} /> Create New Task
                                    </button>
                                </div>
                            </div>

                            {/* 2. Enhanced Task Area + Activity Feed Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                                {/* MAIN TASK BOARD (3 Cols) */}
                                <div className="lg:col-span-3 space-y-4">
                                    {/* Task Views & Filters */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex bg-[#111] p-1 rounded-lg border border-[#222]">
                                            {['all', 'my', 'overdue', 'blocked', 'completed'].map(view => (
                                                <button
                                                    key={view}
                                                    onClick={() => setTaskView(view)}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${taskView === view ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                                                        }`}
                                                >
                                                    {view === 'my' ? 'My Tasks' : view}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 font-medium">Group by:</span>
                                            <div className="relative">
                                                <select
                                                    value={groupBy}
                                                    onChange={(e) => setGroupBy(e.target.value)}
                                                    className="bg-[#111] text-gray-300 text-xs font-bold border border-[#222] rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500/50 appearance-none pr-8 cursor-pointer"
                                                >
                                                    <option value="status">Status</option>
                                                    <option value="assignee">Assignee</option>
                                                    <option value="priority">Priority</option>
                                                    <option value="none">None</option>
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Task List Groups */}
                                    <div className="space-y-6">
                                        {Object.entries(taskGroups).map(([groupName, groupTasks]) => {
                                            if (groupTasks.length === 0 && groupBy !== 'none') return null; // Hide empty groups (optional)

                                            return (
                                                <div key={groupName} className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
                                                    <div className="p-3 bg-[#161616] border-b border-[#222] flex items-between">
                                                        <h3 className="font-bold text-white text-sm flex items-center gap-2 capitalize">
                                                            {groupBy === 'priority' && getPriorityIcon(groupName)}
                                                            {groupName === 'my' ? 'My Tasks' : groupName.replace('-', ' ')}
                                                            <span className="text-gray-500 text-xs font-normal">({groupTasks.length})</span>
                                                        </h3>
                                                    </div>

                                                    <div className="divide-y divide-[#222]">
                                                        {groupTasks.length === 0 ? (
                                                            <div className="p-8 text-center text-gray-500 text-xs">No tasks in this group</div>
                                                        ) : (
                                                            groupTasks.map(task => (
                                                                <div key={task._id} className="group bg-[#111] hover:bg-[#161616] transition-colors">
                                                                    {/* Task Summary Row */}
                                                                    <div className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}>
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
                                                                                {groupBy !== 'priority' && <div className="text-xs">{getPriorityIcon(task.priority)}</div>}
                                                                            </div>
                                                                            <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                                                                <span className={`flex items-center gap-1 ${task.dueDate && new Date(task.dueDate) < new Date() ? 'text-red-400 font-bold' : ''}`}>
                                                                                    <Calendar className="size-3" />
                                                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                                                                                </span>
                                                                                {task.assignee && groupBy !== 'assignee' && (
                                                                                    <span className="flex items-center gap-1 text-gray-400">
                                                                                        Assigned to <span className="text-indigo-400">{task.assignee.fullName}</span>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className={`flex items-center gap-3 transition-opacity ${task.comments?.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                                            {task.comments?.length > 0 && (
                                                                                <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                                                                                    <MessageSquare className="size-3 text-indigo-400" />
                                                                                    <span className="text-gray-400">{task.comments.length}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <button className="text-gray-600 hover:text-white transition-colors">
                                                                            {expandedTask === task._id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                                                        </button>
                                                                    </div>

                                                                    {/* Expanded Details */}
                                                                    {expandedTask === task._id && (
                                                                        <div className="px-4 pb-4 pl-12 animate-in slide-in-from-top-2 duration-200">
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
                                                                                    <div className="flex gap-2 relative">
                                                                                        {/* Mention Dropdown */}
                                                                                        {showMentionDropdown && filteredMembers.length > 0 && (
                                                                                            <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#1f1f1f] border border-[#333] rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                                                                                                <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-[#111]">Suggested Members</div>
                                                                                                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                                                                    {filteredMembers.map(member => (
                                                                                                        <button
                                                                                                            key={member._id}
                                                                                                            onClick={() => insertMention(member)}
                                                                                                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2a2a] transition-colors text-left group"
                                                                                                        >
                                                                                                            <img src={member.profilePic || "/avatar.png"} className="size-6 rounded-full object-cover" />
                                                                                                            <div>
                                                                                                                <p className="text-sm text-gray-200 font-medium group-hover:text-white">{member.fullName}</p>
                                                                                                                <p className="text-[10px] text-gray-500 capitalize">{member.role}</p>
                                                                                                            </div>
                                                                                                        </button>
                                                                                                    ))}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        <input
                                                                                            type="text"
                                                                                            placeholder="Write a comment... (Type @ to mention)"
                                                                                            value={commentText}
                                                                                            onChange={handleCommentChange}
                                                                                            onKeyDown={(e) => {
                                                                                                if (e.key === 'Enter') handleSendComment(task._id);
                                                                                                if (e.key === 'Escape') setShowMentionDropdown(false);
                                                                                            }}
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
                                            );
                                        })}
                                        {filteredTaskList.length === 0 && (
                                            <div className="p-12 text-center text-gray-500 border border-dashed border-[#222] rounded-2xl">
                                                <div className="size-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Filter className="size-8 text-gray-700" />
                                                </div>
                                                <p className="font-medium text-gray-400">No tasks found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters or create a new task.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SIDEBAR - ACTIVITY FEED (1 Col) */}
                                <div className="space-y-6">
                                    <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden sticky top-6">
                                        <div className="p-4 border-b border-[#222] flex items-center gap-2">
                                            <Activity className="size-4 text-indigo-400" />
                                            <h3 className="font-bold text-white text-sm">Recent Activity</h3>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {recentActivity.length === 0 ? (
                                                <p className="text-xs text-gray-500 italic">No recent updates.</p>
                                            ) : (
                                                recentActivity.map(task => (
                                                    <div key={task._id} className="relative pl-4 border-l border-[#222]">
                                                        <div className="absolute -left-[3px] top-1.5 size-1.5 rounded-full bg-indigo-500"></div>
                                                        <p className="text-xs text-start text-gray-300 line-clamp-2">
                                                            <span className="font-bold text-white">{task.createdBy?.fullName || 'User'}</span> updated task <span className="text-indigo-400">"{task.title}"</span>
                                                        </p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-[10px] text-gray-600">{new Date(task.updatedAt).toLocaleDateString()}</span>
                                                            <span className={`text-[10px] px-1.5 rounded uppercase font-bold ${getStatusColor(task.status).replace('border-gray-700', 'border-transparent')}`}>
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-[#222] bg-[#161616]">
                                            <button className="w-full text-xs text-center text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                                                View all activity <ArrowUpRight className="size-3" />
                                            </button>
                                        </div>
                                    </div>
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
