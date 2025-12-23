import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Search, CheckCircle2, Hash, Users } from "lucide-react";

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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-900">Create New Group</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-[#FF5636] focus:ring-1 focus:ring-[#FF5636]"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g. Product Team"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-[#FF5636] focus:ring-1 focus:ring-[#FF5636]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this group for?"
                            />
                        </div>
                    </div>

                    {/* Member Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Add Members</label>
                            <span className="text-xs text-gray-500">{selectedMembers.length} selected</span>
                        </div>

                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF5636]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleMember(user._id)}
                                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${selectedMembers.includes(user._id) ? "bg-[#FF5636]/5" : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="relative">
                                            <img
                                                src={user.profilePic || "/avatar.png"}
                                                alt={user.fullName}
                                                className="size-9 rounded-full object-cover border border-gray-100"
                                            />
                                            {selectedMembers.includes(user._id) && (
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                                                    <CheckCircle2 className="size-4 text-[#FF5636] fill-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-900">{user.fullName}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-2.5 bg-[#FF5636] hover:bg-[#E04529] text-white rounded-xl font-medium shadow-sm shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}
                    >
                        {isCreating ? "Creating..." : "Create Group"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
