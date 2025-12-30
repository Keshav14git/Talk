import { useState, useEffect } from "react";
import { useOrgStore } from "../store/useOrgStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { X, Briefcase, Check } from "lucide-react";
import toast from "react-hot-toast";

const CreateProjectModal = ({ onClose }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { createProject, orgMembers } = useOrgStore();
    const { authUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    // Filter out current user and ensure we have valid user objects
    const availableUsers = orgMembers
        .map(member => member.userId || member) // Handle populated/unpopulated structure
        .filter(user => user._id !== authUser?._id);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Project name is required");

        setIsLoading(true);
        try {
            const success = await createProject({
                name,
                description,
                assignedMembers: selectedMembers
            });
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMember = (userId) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Briefcase className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Create Project</h2>
                            <p className="text-xs text-gray-400">Collaborate with your team</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300 ml-1">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Website Redesign"
                            className="w-full h-11 bg-black/20 border border-gray-700 rounded-xl px-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300 ml-1">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this project about?"
                            className="w-full h-24 bg-black/20 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Add Members</label>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar bg-black/20 border border-gray-700 rounded-xl divide-y divide-gray-800">
                            {availableUsers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No other members found in this organization yet.</div>
                            ) : (
                                availableUsers.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleMember(user._id)}
                                        className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="size-8 rounded-full object-cover" />
                                            <span className="text-sm text-gray-300 font-medium">{user.fullName}</span>
                                        </div>
                                        <div className={`size-5 rounded border flex items-center justify-center transition-all ${selectedMembers.includes(user._id) ? "bg-primary border-primary text-black" : "border-gray-600"}`}>
                                            {selectedMembers.includes(user._id) && <Check className="size-3.5" strokeWidth={3} />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <span className="loading loading-spinner loading-sm" /> : "Create Project"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectModal;
