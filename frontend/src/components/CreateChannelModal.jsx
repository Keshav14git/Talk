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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-700 ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/10 p-1.5 rounded-lg">
                            <Hash className="size-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Create Channel</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-700 text-gray-400 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Channel Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                placeholder="e.g. Announcements"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Description <span className="text-gray-500 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this channel about?"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <p className="text-xs text-gray-300">
                            Channels are valid for broadcasting updates. Only you (the admin) can post messages, but anyone can join and read.
                        </p>
                    </div>

                </div>

                <div className="p-6 border-t border-gray-700 bg-gray-900/50">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-2.5 bg-white hover:bg-gray-200 text-black rounded-xl font-medium shadow-sm shadow-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
