import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Search, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";

const AddFriendModal = ({ onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { searchUsers, sendFriendRequest } = useChatStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            const results = await searchUsers(searchTerm);
            setSearchResults(results);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendRequest = async (userId) => {
        await sendFriendRequest(userId);
        setSearchResults(searchResults.filter(u => u._id !== userId));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 p-6 rounded-lg w-full max-w-md shadow-xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost">
                    <X className="size-5" />
                </button>

                <h3 className="text-lg font-bold mb-4">Add Friend</h3> {/* Corrected title */}

                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="input input-bordered w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isSearching}>
                        <Search className="size-5" />
                    </button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded">
                            <div className="flex items-center gap-3">
                                <img
                                    src={user.profilePic || "/avatar.png"}
                                    alt={user.fullName}
                                    className="size-10 rounded-full object-cover"
                                />
                                <div className="font-medium">{user.fullName}</div>
                            </div>
                            <button
                                onClick={() => handleSendRequest(user._id)}
                                className="btn btn-sm btn-ghost"
                            >
                                <UserPlus className="size-5 text-primary" />
                            </button>
                        </div>
                    ))}
                    {searchResults.length === 0 && !isSearching && searchTerm && (
                        <p className="text-center text-zinc-500">No users found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFriendModal;
