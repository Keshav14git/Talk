import { X, User } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { motion } from "framer-motion";

const GroupDetailsModal = ({ onClose }) => {
    const { selectedUser } = useChatStore(); // selectedUser is the group object
    const { authUser } = useAuthStore();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!selectedUser?._id) return;

            try {
                const { users } = useChatStore.getState();
                const memberIds = selectedUser.members || [];

                const foundMembers = users.filter(u => memberIds.includes(u._id));
                // Add self
                if (memberIds.includes(authUser._id) && !foundMembers.find(m => m._id === authUser._id)) {
                    foundMembers.push(authUser);
                }

                setMembers(foundMembers);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMembers();
    }, [selectedUser, authUser]);

    if (!selectedUser) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                        {selectedUser.type === 'channel' ? 'Channel Info' : 'Group Info'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col items-center mb-8">
                        <div className="size-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4 text-4xl font-bold shadow-sm">
                            {selectedUser.name.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 text-center">{selectedUser.name}</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{selectedUser.type === 'channel' ? 'Public Channel' : 'Private Group'}</p>
                    </div>

                    {selectedUser.description && (
                        <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{selectedUser.description}</p>
                        </div>
                    )}

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex justify-between items-center">
                            Members
                            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold">{selectedUser.members?.length}</span>
                        </h4>

                        <div className="space-y-2">
                            {/* Admin display if we have it */}
                            {selectedUser.admin && (
                                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                                    <div className="relative">
                                        <img
                                            src={selectedUser.admin.profilePic || "/avatar.png"}
                                            className="size-10 rounded-full object-cover border-2 border-white shadow-sm"
                                            alt={selectedUser.admin.fullName}
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[8px] px-1.5 py-0.5 rounded-full border-2 border-white font-black shadow-sm text-yellow-900">ADM</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{selectedUser.admin.fullName || "Admin"}</div>
                                        <div className="text-xs text-primary font-medium">Administrator</div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Other Members (Available from local state) */}
                            {members.map(member => (
                                (selectedUser.admin?._id !== member._id) && (
                                    <div key={member._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                                        <img
                                            src={member.profilePic || "/avatar.png"}
                                            className="size-10 rounded-full object-cover border-2 border-white shadow-sm"
                                            alt={member.fullName}
                                        />
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">{member.fullName}</div>
                                            {member._id === authUser._id && <div className="text-xs text-gray-400">You</div>}
                                        </div>
                                    </div>
                                )
                            ))}

                            {members.length < (selectedUser.members?.length || 0) && (
                                <div className="text-center py-4 text-xs text-gray-400 italic bg-gray-50/30 rounded-xl mt-2 border border-dashed border-gray-200">
                                    + {(selectedUser.members?.length || 0) - members.length} more members not in your friends list
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default GroupDetailsModal;
