import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, Video, Info, ArrowLeft, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-4 border-b border-white/20 bg-white/40 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shadow-sm"
    >
      <div className="flex items-center gap-4">
        {/* Back Button (Mobile Only) */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden btn btn-ghost btn-circle btn-sm -ml-2"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="relative group cursor-pointer">
          <img
            src={selectedUser.profilePic || selectedUser.image || "/avatar.png"}
            alt={selectedUser.fullName}
            className="size-12 rounded-full object-cover ring-2 ring-white shadow-md transition-transform group-hover:scale-105"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full ring-2 ring-white shadow-sm" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight text-base-content">{selectedUser.fullName || selectedUser.name}</h3>
          <p className={`text-xs font-medium ${isOnline ? "text-primary" : "text-base-content/50"}`}>
            {isOnline ? "Active now" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {["Voice Call", "Video Call", "Info"].map((title, idx) => (
          <button key={idx} title={title} className="btn btn-circle btn-ghost btn-sm hover:bg-white/50 text-base-content/70">
            {title === "Voice Call" && <Phone className="size-5" />}
            {title === "Video Call" && <Video className="size-5" />}
            {title === "Info" && <MoreVertical className="size-5" />}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default ChatHeader;
