import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useOrgStore } from "../store/useOrgStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Search, CheckCircle2, Users } from "lucide-react";
import { motion } from "framer-motion";

const CreateGroupModal = ({ onClose }) => {
    const { createGroup } = useChatStore();
    const { orgMembers } = useOrgStore();
    const { authUser } = useAuthStore();
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Process org members to get usable user objects, excluding self
    const users = orgMembers
        .map(member => member.userId || member)
        .filter(user => user._id !== authUser?._id);

    const toggleMember = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation: Group needs name and members.
        if (!groupName.trim() || selectedMembers.length === 0) return;

        setIsCreating(true);
        const success = await createGroup({
            name: groupName,
            description,
            type: "group",
            members: selectedMembers
        });

        setIsCreating(false);
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-gray-800 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden ring-1 ring-white/5 flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl text-white">
                            <Users className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight leading-none">Create Group</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Start a new conversation</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-1.5 ml-1">Group Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all font-medium"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g. Product Team"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-1.5 ml-1">Description <span className="text-gray-500 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this group for?"
                            />
                        </div>
                    </div>

                    {/* Member Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <label className="block text-sm font-bold text-gray-300">Add Members</label>
                            <span className="bg-white/10 text-white px-2 py-0.5 rounded-lg text-xs font-bold">{selectedMembers.length} selected</span>
                        </div>

                        <div className="relative mb-3 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="border border-gray-700 rounded-2xl overflow-hidden max-h-[220px] overflow-y-auto custom-scrollbar bg-gray-900/30">
                            {filteredUsers.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                                    <div className="size-10 bg-gray-800 rounded-full flex items-center justify-center mb-2">
                                        <Search className="size-5 text-gray-600" />
                                    </div>
                                    No users found
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-700">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => toggleMember(user._id)}
                                            className={`flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-gray-800 ${selectedMembers.includes(user._id) ? "bg-white/5 hover:bg-white/10" : ""
                                                }`}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={user.profilePic || "/avatar.png"}
                                                    alt={user.fullName}
                                                    className={`size-10 rounded-full object-cover transition-all ${selectedMembers.includes(user._id) ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800" : "border border-gray-600"}`}
                                                />
                                                {selectedMembers.includes(user._id) && (
                                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full shadow-sm">
                                                        <CheckCircle2 className="size-4 text-black fill-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold text-sm ${selectedMembers.includes(user._id) ? "text-white" : "text-gray-300"}`}>{user.fullName}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="w-full py-3.5 bg-white hover:bg-gray-200 text-gray-900 rounded-xl font-bold shadow-lg shadow-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                        disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}
                    >
                        {isCreating ? (
                            <>
                                <div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Group"
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateGroupModal;
