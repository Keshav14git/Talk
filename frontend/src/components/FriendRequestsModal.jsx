import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Check } from "lucide-react";

const FriendRequestsModal = ({ onClose }) => {
    const { getFriendRequests, friendRequests, acceptFriendRequest } = useChatStore();

    useEffect(() => {
        getFriendRequests();
    }, [getFriendRequests]);

    const handleAccept = async (friendId) => {
        await acceptFriendRequest(friendId);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">Friend Requests</h3>
                        {friendRequests.length > 0 && (
                            <span className="bg-[#FF5636] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {friendRequests.length}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* List */}
                <div className="p-4">
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {friendRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-300 mb-3">
                                    <Check className="size-12 mx-auto" />
                                </div>
                                <p className="text-gray-500">No pending requests</p>
                            </div>
                        ) : (
                            friendRequests.map((req) => (
                                <div key={req._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={req.user.profilePic || "/avatar.png"}
                                            alt={req.user.fullName}
                                            className="size-12 rounded-full object-cover border border-gray-100"
                                        />
                                        <div>
                                            <div className="font-semibold text-gray-900">{req.user.fullName}</div>
                                            <div className="text-xs text-gray-500">Wants to connect</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAccept(req.user._id)}
                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all transform active:scale-95 shadow-sm"
                                        title="Accept Request"
                                    >
                                        <Check className="size-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendRequestsModal;
