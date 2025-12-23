import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { X, Trash2 } from "lucide-react";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, selectedUser, deleteMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages && !isSelectionMode) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSelectionMode]);

  const toggleSelection = (id) => {
    if (selectedMessageIds.includes(id)) {
      setSelectedMessageIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedMessageIds(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedMessageIds.length} messages?`)) {
      for (const id of selectedMessageIds) {
        await deleteMessage(id);
      }
      setSelectedMessageIds([]);
      setIsSelectionMode(false);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const handleDelete = (id) => {
    if (confirm("Delete this message?")) {
      deleteMessage(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
      <div className="relative z-10">
        <ChatHeader />

        {/* Selection Banner */}
        {isSelectionMode && (
          <div
            className="absolute inset-x-0 top-[64px] bg-[#FF5636]/5 z-10 flex items-center justify-between px-6 py-2 border-b border-[#FF5636]/20"
          >
            <span className="font-bold text-sm text-[#FF5636]">{selectedMessageIds.length} selected</span>
            <div className="flex gap-2">
              <button onClick={() => { setIsSelectionMode(false); setSelectedMessageIds([]); }} className="text-xs text-[#FF5636] hover:underline px-2">Cancel</button>
              <button
                onClick={handleBulkDelete}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2"
                disabled={selectedMessageIds.length === 0}
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {!isSelectionMode && (
          <button
            onClick={() => setIsSelectionMode(true)}
            className="absolute right-4 top-[72px] text-xs text-gray-400 hover:text-gray-600 z-0 bg-white/50 px-2 rounded"
            title="Select Messages"
          >
            Select
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative z-0 custom-scrollbar">
        {messages.map((message, idx) => {
          const isMe = message.senderId === authUser._id;
          const isPrevSame = idx > 0 && messages[idx - 1].senderId === message.senderId;
          const isSelected = selectedMessageIds.includes(message._id);

          // Timestamp check (only show if gap is large or if specific logic) - for now just always show time on hover or in line?
          // Notion/Slack style: Grouped messages often share one avatar, but here we'll keep it simple: Avatar always for first in group.

          return (
            <div
              key={message._id}
              className={`group flex ${isMe ? "flex-row-reverse" : "flex-row"} gap-3 py-1 px-4 hover:bg-gray-50/50 transition-colors relative
                ${isSelected ? "bg-[#FF5636]/5 hover:bg-[#FF5636]/10" : ""}
                ${!isPrevSame ? "mt-4" : "mt-0.5"}
              `}
              onClick={() => isSelectionMode && toggleSelection(message._id)}
            >
              {/* Selection Checkbox */}
              {isSelectionMode && (
                <div className="flex items-center justify-center mx-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(message._id)}
                    className="size-4 rounded border-gray-300 text-[#FF5636] focus:ring-[#FF5636]"
                  />
                </div>
              )}

              {/* Avatar */}
              <div className="w-8 flex-shrink-0 flex flex-col items-center">
                {!isPrevSame && !isMe && (
                  <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt="avatar"
                    className="size-8 rounded-full object-cover shadow-sm"
                  />
                )}
                {/* No avatar for "Me" to keep it clean, or could add it. Let's hide "Me" avatar for typical bubble feel, looking cleaner. */}
                {!isPrevSame && isMe && (
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt="avatar"
                    className="size-8 rounded-full object-cover shadow-sm"
                  />
                )}
                {isPrevSame && <div className="w-8" />}
              </div>

              {/* Content Bubble */}
              <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>

                {/* Name/Time Header (Only for first in group) */}
                {!isPrevSame && (
                  <div className={`flex items-baseline gap-2 mb-1 text-xs text-gray-400 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="font-medium text-gray-600">
                      {isMe ? "You" : selectedUser.fullName}
                    </span>
                    <span>
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`relative px-4 py-2 shadow-sm text-[15px] leading-relaxed break-words
                     ${isMe
                      ? "bg-gray-900 text-white rounded-2xl rounded-tr-sm"
                      : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
                    }
                   `}
                >
                  {message.image && (
                    <div className="mb-2">
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-[200px] max-h-60 rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(message.image); }}
                      />
                    </div>
                  )}
                  {message.text}
                </div>
              </div>

              {/* Delete Hover Action */}
              {!isSelectionMode && isMe && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(message._id); }}
                  className="self-center p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Message"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl max-h-full">
            <img src={selectedImage} alt="Full View" className="max-w-full max-h-[90vh] rounded-md shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatContainer;