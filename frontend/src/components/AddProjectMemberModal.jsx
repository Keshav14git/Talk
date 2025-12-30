import { useState } from "react";
import { useOrgStore } from "../store/useOrgStore";
import { useChatStore } from "../store/useChatStore"; // For getting connections/friends
import { X, UserPlus, Check, Search } from "lucide-react";

const AddProjectMemberModal = ({ project, onClose }) => {
    const { addProjectMember } = useOrgStore();
    const { users } = useChatStore(); // Friends list (or we could fetch all org members)
    // Actually, we should probably fetch org members because we can add ANYONE from org, not just friends.
    // So let's use `orgMembers` from `useOrgStore` which is already populated.
    const { orgMembers } = useOrgStore();

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Filter available users: 
    // 1. Must be in Org (orgMembers)
    // 2. Must NOT already be in Project (project.members)
    // 3. Match search term
    const availableUsers = orgMembers.filter(member => {
        const user = member.userId || member; // Handle populated
        const isAlreadyInProject = project.members.some(pm => (pm._id || pm) === user._id);
        const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        return !isAlreadyInProject && matchesSearch;
    });

    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedUsers(prev => [...prev, userId]);
        }
    };

    const handleSubmit = async () => {
        if (selectedUsers.length === 0) return;
        setIsLoading(true);

        // Add sequentially (could be parallel but safer sequentially for ordering/errors)
        for (const userId of selectedUsers) {
            await addProjectMember(project._id, userId);
        }

        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#161616] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
                            <UserPlus className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Add Team Members</h2>
                            <p className="text-xs text-gray-400">Expand your project team</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search colleagues..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>

                    {/* List */}
                    <div className="space-y-1">
                        {availableUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                {searchTerm ? "No matching users found" : "All eligible members are already in this project"}
                            </div>
                        ) : (
                            availableUsers.map(member => {
                                const user = member.userId || member;
                                const isSelected = selectedUsers.includes(user._id);
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUser(user._id)}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-transparent border-transparent hover:bg-[#1a1a1a]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={user.profilePic || "/avatar.png"} className="size-9 rounded-full object-cover bg-[#222]" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-200">{user.fullName}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className={`size-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600'}`}>
                                            {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[#222] bg-[#161616] rounded-b-2xl">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || selectedUsers.length === 0}
                        className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <span className="loading loading-spinner loading-sm" /> : `Add ${selectedUsers.length > 0 ? selectedUsers.length : ''} Members`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProjectMemberModal;
