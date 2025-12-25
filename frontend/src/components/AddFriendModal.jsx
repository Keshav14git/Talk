import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Search, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";

const AddFriendModal = ({ onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { searchUsers, sendFriendRequest } = useChatStore();

    // specific Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim()) {
                setIsSearching(true);
                try {
                    const results = await searchUsers(searchTerm);
                    setSearchResults(results);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchUsers]);

    const handleSendRequest = async (userId) => {
        await sendFriendRequest(userId);
        setSearchResults(searchResults.filter(u => u._id !== userId));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-700 ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
                    <h3 className="text-lg font-semibold text-white">Add Friend</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-700 text-gray-400 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-6">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Results List */}
                    <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {isSearching && (
                            <div className="text-center py-8 text-gray-400 text-sm animate-pulse">
                                Searching users...
                            </div>
                        )}

                        {!isSearching && searchResults.length === 0 && searchTerm && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No users found
                            </div>
                        )}

                        {!isSearching && !searchTerm && (
                            <div className="text-center py-12">
                                <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <UserPlus className="size-8 text-white" />
                                </div>
                                <p className="text-gray-500 text-sm">Type to search for people</p>
                            </div>
                        )}

                        {!isSearching && searchResults.map((user) => (
                            <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-xl transition-colors border border-transparent hover:border-gray-700 group">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user.profilePic || "/avatar.png"}
                                        alt={user.fullName}
                                        className="size-10 rounded-full object-cover border border-gray-600"
                                    />
                                    <div>
                                        <div className="font-medium text-white">{user.fullName}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSendRequest(user._id)}
                                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white hover:text-black transition-all transform active:scale-95"
                                    title="Send Friend Request"
                                >
                                    <UserPlus className="size-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFriendModal;
