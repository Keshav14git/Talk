import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Hash, UserPlus, Compass } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const ExploreChannelsModal = ({ onClose, onCreate }) => {
    const { getPublicChannels, publicChannels, joinGroup, isJoiningGroup } = useChatStore();

    useEffect(() => {
        getPublicChannels();
    }, [getPublicChannels]);

    const handleJoin = async (groupId) => {
        await joinGroup(groupId);
        // toast.success("Joined channel successfully"); // Moved to store usually, or kept here.
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col h-[600px]"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Compass className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-none">Explore Channels</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Discover public communities</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* List */}
                <div className="p-4 bg-white flex-1 overflow-y-auto custom-scrollbar">
                    {publicChannels.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center h-full justify-center">
                            <div className="size-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
                                <Hash className="size-10 text-gray-300" />
                            </div>
                            <h4 className="text-gray-900 font-bold mb-2">No channels to explore</h4>
                            <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
                                There are no public channels you haven't joined yet. Why not create one?
                            </p>
                            {onCreate && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { onClose(); onCreate(); }}
                                    className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                                >
                                    Create a Channel
                                </motion.button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {publicChannels.map((channel, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={channel._id}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 rounded-2xl transition-all shadow-sm hover:shadow-md group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors font-bold text-lg border border-gray-50 group-hover:border-gray-100">
                                            #
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-[15px]">{channel.name}</div>
                                            {channel.description && (
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[200px]">{channel.description}</div>
                                            )}
                                            <div className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wide font-bold flex items-center gap-1">
                                                <span>{channel.members?.length || 0} Members</span>
                                                <span>•</span>
                                                <span className="truncate max-w-[100px]">By {channel.admin?.fullName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleJoin(channel._id)}
                                        disabled={isJoiningGroup}
                                        className="btn btn-sm bg-gray-900 text-white hover:bg-primary border-none px-5 h-10 rounded-xl gap-2 transition-all disabled:opacity-50 shadow-md group-hover:shadow-lg"
                                    >
                                        <UserPlus className="size-4" />
                                        Join
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ExploreChannelsModal;
