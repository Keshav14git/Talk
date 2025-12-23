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
            className="absolute inset-x-0 top-[64px] bg-blue-50 z-10 flex items-center justify-between px-6 py-2 border-b border-blue-100"
          >
            <span className="font-bold text-sm text-blue-900">{selectedMessageIds.length} selected</span>
            <div className="flex gap-2">
              <button onClick={() => { setIsSelectionMode(false); setSelectedMessageIds([]); }} className="text-xs text-blue-600 hover:underline px-2">Cancel</button>
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
              className={`group flex gap-3 py-1 px-4 hover:bg-gray-50 transition-colors relative
                ${isSelected ? "bg-blue-50 hover:bg-blue-50/80" : ""}
                ${!isPrevSame ? "mt-4" : ""}
              `}
              onClick={() => isSelectionMode && toggleSelection(message._id)}
            >
              {/* Selection Checkbox */}
              {isSelectionMode && (
                <div className="flex items-center justify-center mr-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(message._id)}
                    className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Avatar Column */}
              <div className="w-9 flex-shrink-0">
                {!isPrevSame ? (
                  <img
                    src={(isMe ? authUser.profilePic : selectedUser.profilePic) || "/avatar.png"}
                    alt="avatar"
                    className="size-9 rounded-md object-cover bg-gray-200"
                  />
                ) : (
                  <div className="w-9 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 text-right pr-1 pt-1 font-mono">
                    {formatMessageTime(message.createdAt).split(' ')[0]}
                  </div>
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 min-w-0">
                {!isPrevSame && (
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-bold text-gray-900 text-[15px]">
                      {isMe ? "You" : selectedUser.fullName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                )}

                <div className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </div>

                {message.image && (
                  <div className="mt-2">
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-sm max-h-60 rounded-lg border border-gray-200 cursor-zoom-in"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(message.image); }}
                    />
                  </div>
                )}
              </div>

              {/* Delete Hover Action */}
              {!isSelectionMode && isMe && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(message._id); }}
                  className="absolute top-2 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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