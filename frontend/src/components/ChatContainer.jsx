import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { X, Trash2 } from "lucide-react";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, selectedUser, selectedType, deleteMessage } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
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
      // Ideally use a bulk delete endpoint, but loop is fine for MVP
      for (const id of selectedMessageIds) {
        await deleteMessage(id);
      }
      setSelectedMessageIds([]);
      setIsSelectionMode(false);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Basic confirmation for single delete
  const handleDelete = (id) => {
    if (confirm("Delete this message?")) {
      deleteMessage(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base-100">
      {/* Custom Header Wrapper to inject Selection Controls if needed, or just use ChatHeader and overlay */}
      <div className="relative">
        <ChatHeader />
        {isSelectionMode && (
          <div className="absolute inset-0 bg-base-100 z-10 flex items-center justify-between px-4 border-b border-base-300">
            <span className="font-bold">{selectedMessageIds.length} selected</span>
            <div className="flex gap-2">
              <button onClick={() => { setIsSelectionMode(false); setSelectedMessageIds([]); }} className="btn btn-sm btn-ghost">Cancel</button>
              <button
                onClick={handleBulkDelete}
                className="btn btn-sm btn-error text-white"
                disabled={selectedMessageIds.length === 0}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
        {!isSelectionMode && (
          <button
            onClick={() => setIsSelectionMode(true)}
            className="absolute right-16 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost opacity-50 hover:opacity-100 z-10"
            title="Select Messages"
          >
            Select
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => {
          const isMe = message.senderId === authUser._id;
          const isPrevSame = idx > 0 && messages[idx - 1].senderId === message.senderId;
          const isNextSame = idx < messages.length - 1 && messages[idx + 1].senderId === message.senderId;
          const isSelected = selectedMessageIds.includes(message._id);

          return (
            <div
              key={message._id}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-1 group relative items-center gap-2`}
              ref={messageEndRef}
              onClick={() => isSelectionMode && toggleSelection(message._id)}
            >
              {/* Checkbox for Selection Mode (Left for everyone) */}
              {isSelectionMode && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(message._id)}
                  className="checkbox checkbox-sm checkbox-primary"
                />
              )}

              <div className={`
                  chat ${isMe ? "chat-end" : "chat-start"} max-w-[70%] flex items-end gap-2 
                  ${isSelectionMode ? "cursor-pointer" : ""}
              `}>

                {/* Delete Button (Hover) - Only show if NOT in selection mode */}
                {!isSelectionMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(message._id); }}
                    className={`btn btn-xs btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity self-center mb-2 ${isMe ? "order-first" : "order-last"}`}
                    title="Delete Message"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                {/* Only show avatar for received messages at the end of a group */}
                {!isMe && (
                  <div className="chat-image avatar w-7 h-7 self-end mb-1 mr-2 opacity-100">
                    {!isNextSame ? (
                      <div className="size-7 rounded-full overflow-hidden">
                        <img
                          src={selectedUser.profilePic || "/avatar.png"}
                          alt="profile"
                        />
                      </div>
                    ) : <div className="w-7" />}
                  </div>
                )}

                <div className={`
                        px-4 py-2 text-[15px] leading-snug shadow-sm relative min-w-[100px] pb-5
                        ${isMe
                    ? "bg-[#374151] text-white rounded-[20px]"  /* Instagram-ish Dark Gray/Blue for sender */
                    : "bg-base-200 text-base-content rounded-[20px]" /* Light gray for receiver */
                  }
                        ${isMe && !isNextSame ? "rounded-br-md" : ""}
                        ${!isMe && !isNextSame ? "rounded-bl-md" : ""}
                    `}>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-[280px] rounded-xl mb-2 cursor-pointer hover:opacity-95"
                      onClick={() => setSelectedImage(message.image)}
                    />
                  )}
                  {message.text && <p>{message.text}</p>}

                  <span className={`
                      text-[10px] absolute bottom-1.5 right-3
                      ${isMe ? "text-white/70" : "text-base-content/60"}
                  `}>
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 btn btn-circle btn-ghost text-white"
            >
              <X className="size-8" />
            </button>
            <img
              src={selectedImage}
              alt="Full View"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setSelectedImage(null)}
          />
        </div>
      )}
    </div>
  );
};
export default ChatContainer;