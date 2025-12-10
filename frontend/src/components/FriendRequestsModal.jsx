import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Check, CheckCircle2 } from "lucide-react";

const FriendRequestsModal = ({ onClose }) => {
    const { getFriendRequests, friendRequests, acceptFriendRequest } = useChatStore();

    useEffect(() => {
        getFriendRequests();
    }, [getFriendRequests]);

    const handleAccept = async (friendId) => {
        await acceptFriendRequest(friendId);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 p-6 rounded-lg w-full max-w-md shadow-xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost">
                    <X className="size-5" />
                </button>

                <h3 className="text-lg font-bold mb-4">Friend Requests</h3>

                <div className="space-y-4 max-h-60 overflow-y-auto">
                    {friendRequests.length === 0 ? (
                        <p className="text-center text-zinc-500 py-4">No pending requests</p>
                    ) : (
                        friendRequests.map((req) => (
                            <div key={req._id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={req.user.profilePic || "/avatar.png"}
                                        alt={req.user.fullName}
                                        className="size-10 rounded-full object-cover"
                                    />
                                    <div className="font-medium">{req.user.fullName}</div>
                                </div>
                                <button
                                    onClick={() => handleAccept(req.user._id)} // Pass the user ID, not the request ID if logic expects user ID
                                    className="btn btn-sm btn-success btn-circle text-white"
                                >
                                    <Check className="size-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendRequestsModal;
