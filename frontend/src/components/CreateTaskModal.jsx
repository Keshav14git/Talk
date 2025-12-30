import { useState } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { X, Check, Calendar, Flag, User } from "lucide-react";
import toast from "react-hot-toast";

const CreateTaskModal = ({ project, onClose }) => {
    const { createTask } = useTaskStore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignee, setAssignee] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return toast.error("Task title is required");

        setIsLoading(true);
        const success = await createTask(project._id, {
            title,
            description,
            assignee: assignee || null,
            priority,
            dueDate: dueDate || null
        });
        setIsLoading(false);

        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-[#111] border border-[#222] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#161616] rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">New Task</h2>
                        <p className="text-xs text-gray-500">Add a task to {project.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300 ml-1">Task Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Design Homepage Hero"
                            className="w-full p-3 bg-black/40 border border-[#333] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300 ml-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                            className="w-full h-24 p-3 bg-black/40 border border-[#333] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Assignee */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-2">
                                <User className="size-3.5" /> Assignee
                            </label>
                            <select
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                className="w-full p-2.5 bg-black/40 border border-[#333] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50"
                            >
                                <option value="">Unassigned</option>
                                {project.members?.map(member => {
                                    const user = member.userId || member; // Handle populated vs raw
                                    // Check if user is an object to prevent crash if backend didn't populate correctly
                                    if (typeof user !== 'object') return null;
                                    return (
                                        <option key={user._id} value={user._id}>
                                            {user.fullName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-2">
                                <Flag className="size-3.5" /> Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full p-2.5 bg-black/40 border border-[#333] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-2">
                            <Calendar className="size-3.5" /> Due Date
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-2.5 bg-black/40 border border-[#333] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                        />
                    </div>

                </form>

                {/* Footer */}
                <div className="p-5 border-t border-[#222] bg-[#161616] rounded-b-2xl">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                    >
                        {isLoading ? <span className="loading loading-spinner loading-sm" /> : "Create Task"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal;
