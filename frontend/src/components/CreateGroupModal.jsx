import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Search, CheckCircle2, Users } from "lucide-react";
import { motion } from "framer-motion";

const CreateGroupModal = ({ onClose }) => {
    const { users, getUsers, createGroup } = useChatStore();
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (users.length === 0) getUsers();
    }, [getUsers, users.length]);

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
                className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Users className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-none">Create Group</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Start a new conversation</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Group Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g. Product Team"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this group for?"
                            />
                        </div>
                    </div>

                    {/* Member Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <label className="block text-sm font-bold text-gray-700">Add Members</label>
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-bold">{selectedMembers.length} selected</span>
                        </div>

                        <div className="relative mb-3 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[220px] overflow-y-auto custom-scrollbar bg-gray-50/30">
                            {filteredUsers.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                                    <div className="size-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                        <Search className="size-5 text-gray-300" />
                                    </div>
                                    No users found
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => toggleMember(user._id)}
                                            className={`flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-white ${selectedMembers.includes(user._id) ? "bg-primary/5 hover:bg-primary/10" : ""
                                                }`}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={user.profilePic || "/avatar.png"}
                                                    alt={user.fullName}
                                                    className={`size-10 rounded-full object-cover transition-all ${selectedMembers.includes(user._id) ? "ring-2 ring-primary ring-offset-2" : "border border-gray-200"}`}
                                                />
                                                {selectedMembers.includes(user._id) && (
                                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full shadow-sm">
                                                        <CheckCircle2 className="size-4 text-primary fill-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold text-sm ${selectedMembers.includes(user._id) ? "text-primary" : "text-gray-900"}`}>{user.fullName}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                        disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}
                    >
                        {isCreating ? (
                            <>
                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
