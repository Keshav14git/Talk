import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, Video, Info, ArrowLeft } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, toggleArchive, selectedType } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  return (
    <div className="px-4 py-3 border-b border-base-content/10 bg-base-100 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Back Button (Mobile Only) */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden btn btn-ghost btn-circle btn-sm -ml-2"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="relative">
          <img
            src={selectedUser.profilePic || selectedUser.image || "/avatar.png"}
            alt={selectedUser.fullName}
            className="size-10 rounded-full object-cover ring-2 ring-base-200"
          />
          {onlineUsers.includes(selectedUser._id) && (
            <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-base leading-tight">{selectedUser.fullName || selectedUser.name}</h3>
          <p className="text-xs text-base-content/60 font-medium">
            {onlineUsers.includes(selectedUser._id) ? "Active now" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button title="Voice Call" className="btn btn-circle btn-ghost btn-sm">
          <Phone className="size-5" />
        </button>
        <button title="Video Call" className="btn btn-circle btn-ghost btn-sm">
          <Video className="size-5" />
        </button>
        <button title="More Info" className="btn btn-circle btn-ghost btn-sm">
          <Info className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
