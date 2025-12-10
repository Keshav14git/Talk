import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Search, CheckCircle2 } from "lucide-react";

const CreateGroupModal = ({ onClose }) => {
    const { users, getUsers, createGroup } = useChatStore();
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (users.length === 0) getUsers();
    }, [getUsers, users.length]);

    const toggleMember = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim() || selectedMembers.length === 0) return;

        setIsCreating(true);
        const success = await createGroup({
            name: groupName,
            members: selectedMembers
        });

        setIsCreating(false);
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 p-6 rounded-lg w-full max-w-md shadow-xl relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost">
                    <X className="size-5" />
                </button>

                <h3 className="text-lg font-bold mb-4">Create New Group</h3>

                <div className="mb-4">
                    <label className="label">
                        <span className="label-text">Group Name</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g. Weekend Trip"
                    />
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 mb-4 border rounded-lg p-2">
                    <h4 className="font-medium text-sm mb-2 px-2 text-zinc-500">Select Members</h4>
                    {users.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => toggleMember(user._id)}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${selectedMembers.includes(user._id) ? "bg-base-300" : "hover:bg-base-200"}`}
                        >
                            <img
                                src={user.profilePic || "/avatar.png"}
                                alt={user.fullName}
                                className="size-10 rounded-full object-cover"
                            />
                            <div className="flex-1 font-medium">{user.fullName}</div>
                            {selectedMembers.includes(user._id) && (
                                <CheckCircle2 className="size-5 text-primary" />
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    className="btn btn-primary w-full"
                    disabled={isCreating || !groupName || selectedMembers.length === 0}
                >
                    {isCreating ? "Creating..." : "Create Group"}
                </button>
            </div>
        </div>
    );
};

export default CreateGroupModal;
