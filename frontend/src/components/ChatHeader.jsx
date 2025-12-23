import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, Video, Info, ArrowLeft, MoreHorizontal, Search, Archive } from "lucide-react";
import { useState } from "react";
import GroupDetailsModal from "./GroupDetailsModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, selectedType, messageSearchQuery, setMessageSearchQuery, toggleArchive } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showDetails, setShowDetails] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isGroupOrChannel = selectedType === "group" || selectedType === "channel";

  const handleArchive = async () => {
    if (selectedUser) {
      await toggleArchive(selectedUser._id);
      // Optionally close chat or show feedback? Store handles toast.
      // If archived, maybe deselect? Or just stay.
      // Let's assume user stays in chat but it moves lists.
      setSelectedUser(null);
    }
  };

  return (
    <div className="h-16 min-h-[4rem] px-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shadow-sm/5">

      {/* Search Mode UI */}
      {showSearch ? (
        <div className="flex-1 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <button onClick={() => { setShowSearch(false); setMessageSearchQuery(""); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Search messages, date (e.g., '24 Dec')..."
              className="w-full bg-gray-100/50 border border-gray-200 focus:bg-white rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-[#FF5636]/20 focus:border-[#FF5636] text-sm transition-all shadow-sm"
              autoFocus
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
            />
            <Search className="size-4 text-gray-400 group-focus-within:text-[#FF5636] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            {/* Back Button (Mobile Only) */}
            <button
              onClick={() => setSelectedUser(null)}
              className="md:hidden p-2 -ml-2 text-gray-500"
            >
              <ArrowLeft className="size-5" />
            </button>

            <div className="relative">
              <img
                src={selectedUser.profilePic || selectedUser.image || "/avatar.png"}
                alt={selectedUser.fullName}
                className="size-10 rounded-lg object-cover border border-gray-100 shadow-sm"
              />
              {isOnline && !isGroupOrChannel && (
                <span className="absolute -bottom-1 -right-1 size-3 bg-green-500 rounded-full ring-2 ring-white" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-base text-gray-900 leading-none">
                {selectedUser.fullName || selectedUser.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                {isGroupOrChannel
                  ? (selectedUser.members?.length ? `${selectedUser.members.length} members` : "Members")
                  : (isOnline ? "Active now" : "Offline")
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className={`p-2 rounded-xl transition-all duration-200 ${messageSearchQuery ? "text-[#FF5636] bg-orange-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
              title="Search Messages"
            >
              <Search className="size-5" />
            </button>

            {/* Archive Option - Only for regular DMs generally? Or groups too? Store logic supports both if IDs valid. */}
            {!isGroupOrChannel && (
              <button
                onClick={handleArchive}
                className="p-2 text-gray-400 hover:text-[#FF5636] hover:bg-orange-50 rounded-xl transition-all duration-200"
                title={selectedUser.isArchived ? "Unarchive chat" : "Archive chat"}
              >
                <Archive className="size-5" />
              </button>
            )}

            {/* Only show info button for groups/channels for now, or all? Let's show for all but modal handles group */}
            {isGroupOrChannel && (
              <button
                onClick={() => setShowDetails(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Info className="size-5" />
              </button>
            )}
          </div>
        </>
      )}

      {showDetails && <GroupDetailsModal onClose={() => setShowDetails(false)} />}
    </div>
  );
};

export default ChatHeader;
