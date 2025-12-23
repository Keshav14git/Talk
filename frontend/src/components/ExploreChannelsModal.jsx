import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Hash, UserPlus, Compass } from "lucide-react";
import toast from "react-hot-toast";

const ExploreChannelsModal = ({ onClose, onCreate }) => {
    const { getPublicChannels, publicChannels, joinGroup, isJoiningGroup } = useChatStore();

    useEffect(() => {
        getPublicChannels();
    }, [getPublicChannels]);

    const handleJoin = async (groupId) => {
        await joinGroup(groupId);
        toast.success("Joined channel successfully");
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <Compass className="size-5 text-[#FF5636]" />
                        <h3 className="text-lg font-semibold text-gray-900">Explore Channels</h3>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* List */}
                <div className="p-4 bg-white min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar">
                    {publicChannels.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Hash className="size-8 text-gray-300" />
                            </div>
                            <h4 className="text-gray-900 font-medium mb-1">No channels to explore</h4>
                            <p className="text-gray-500 text-sm max-w-xs mb-4">
                                There are no public channels you haven't joined yet.
                            </p>
                            {onCreate && (
                                <button
                                    onClick={() => { onClose(); onCreate(); }}
                                    className="px-4 py-2 bg-[#FF5636] text-white text-sm font-medium rounded-lg hover:bg-[#E04529] transition-colors"
                                >
                                    Create a Channel
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {publicChannels.map((channel) => (
                                <div key={channel._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition-all shadow-sm hover:shadow-md group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-lg bg-[#FF5636]/10 flex items-center justify-center text-[#FF5636]">
                                            <Hash className="size-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{channel.name}</div>
                                            {channel.description && (
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{channel.description}</div>
                                            )}
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide font-medium">
                                                {channel.members?.length || 0} Members • By {channel.admin?.fullName}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleJoin(channel._id)}
                                        disabled={isJoiningGroup}
                                        className="btn btn-sm bg-gray-900 text-white hover:bg-[#FF5636] border-none px-4 gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <UserPlus className="size-4" />
                                        Join
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExploreChannelsModal;
