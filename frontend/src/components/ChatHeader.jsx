import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, Video, Info, ArrowLeft, MoreHorizontal, Search } from "lucide-react";
import { useState } from "react";
import GroupDetailsModal from "./GroupDetailsModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, selectedType, messageSearchQuery, setMessageSearchQuery } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showDetails, setShowDetails] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Local or using store directly? Using store directly for container access

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isGroupOrChannel = selectedType === "group" || selectedType === "channel";

  return (
    <div className="h-16 min-h-[4rem] px-4 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-20">

      {/* Search Mode UI */}
      {showSearch ? (
        <div className="flex-1 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search messages, date (e.g., '24 Dec')..."
              className="w-full bg-gray-100 border-none rounded-lg py-2 pl-10 pr-4 focus:ring-1 focus:ring-[#FF5636] text-sm"
              autoFocus
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
            />
            <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                className="size-10 rounded-lg object-cover border border-gray-200"
              />
              {isOnline && !isGroupOrChannel && (
                <span className="absolute -bottom-1 -right-1 size-3 bg-green-500 rounded-full ring-2 ring-white" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-base text-gray-900 leading-none">
                {selectedUser.fullName || selectedUser.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isGroupOrChannel
                  ? (selectedUser.members?.length ? `${selectedUser.members.length} members` : "Members")
                  : (isOnline ? "Active" : "Offline")
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(true)}
              className={`p-2 rounded-md transition-colors ${messageSearchQuery ? "text-[#FF5636] bg-orange-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
            >
              <Search className="size-5" />
            </button>
            {/* Only show info button for groups/channels for now, or all? Let's show for all but modal handles group */}
            {isGroupOrChannel && (
              <button
                onClick={() => setShowDetails(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
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
