import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Hash } from "lucide-react";

const CreateChannelModal = ({ onClose }) => {
    const { createGroup } = useChatStore();
    const [channelName, setChannelName] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation: Channel needs name.
        if (!channelName.trim()) return;

        setIsCreating(true);
        // Channels are created with empty members initially (admin only)
        // Backend handles appending admin to members list automatically
        const success = await createGroup({
            name: channelName,
            description,
            type: "channel",
            members: []
        });

        setIsCreating(false);
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-100 p-1.5 rounded-lg">
                            <Hash className="size-5 text-[#FF5636]" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Create Channel</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-[#FF5636] focus:ring-1 focus:ring-[#FF5636]"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                placeholder="e.g. Announcements"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-[#FF5636] focus:ring-1 focus:ring-[#FF5636]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this channel about?"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                            Channels are valid for broadcasting updates. Only you (the admin) can post messages, but anyone can join and read.
                        </p>
                    </div>

                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-2.5 bg-[#FF5636] hover:bg-[#E04529] text-white rounded-xl font-medium shadow-sm shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={isCreating || !channelName.trim()}
                    >
                        {isCreating ? "Creating..." : "Create Channel"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateChannelModal;
