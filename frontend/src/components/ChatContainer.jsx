import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
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
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent relative">
      <div className="relative z-10">
        <ChatHeader />

        {/* Selection Banner */}
        <AnimatePresence>
          {isSelectionMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute inset-x-0 top-[73px] bg-white/80 backdrop-blur-md z-10 flex items-center justify-between px-6 py-2 border-b border-white/20 shadow-sm"
            >
              <span className="font-bold text-sm text-primary">{selectedMessageIds.length} selected</span>
              <div className="flex gap-2">
                <button onClick={() => { setIsSelectionMode(false); setSelectedMessageIds([]); }} className="btn btn-xs btn-ghost text-base-content/60">Cancel</button>
                <button
                  onClick={handleBulkDelete}
                  className="btn btn-xs btn-error text-white shadow-md shadow-error/20"
                  disabled={selectedMessageIds.length === 0}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isSelectionMode && (
          <button
            onClick={() => setIsSelectionMode(true)}
            className="absolute right-4 top-[80px] btn btn-xs btn-ghost opacity-0 hover:opacity-100 transition-opacity z-0"
            title="Select Messages"
          >
            Select
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative z-0 scrollbar-hide">
        {messages.map((message, idx) => {
          const isMe = message.senderId === authUser._id;
          const isPrevSame = idx > 0 && messages[idx - 1].senderId === message.senderId;
          const isNextSame = idx < messages.length - 1 && messages[idx + 1].senderId === message.senderId;
          const isSelected = selectedMessageIds.includes(message._id);

          return (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              key={message._id}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-1 group relative items-end gap-2`}
              ref={messageEndRef}
              onClick={() => isSelectionMode && toggleSelection(message._id)}
            >
              {isSelectionMode && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(message._id)}
                  className="checkbox checkbox-xs checkbox-primary mr-2"
                />
              )}

              <div className={`
                  chat ${isMe ? "chat-end" : "chat-start"} max-w-[75%] flex items-end gap-2 
                  ${isSelectionMode ? "cursor-pointer" : ""}
              `}>
                {!isSelectionMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(message._id); }}
                    className={`btn btn-xs btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity self-center mb-2 ${isMe ? "order-first" : "order-last"}`}
                    title="Delete Message"
                  >
                    <Trash2 size={12} />
                  </button>
                )}

                {!isMe && (
                  <div className="chat-image avatar w-8 h-8 self-end mb-1 opacity-100 flex-shrink-0">
                    {!isNextSame ? (
                      <div className="size-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                        <img
                          src={selectedUser.profilePic || "/avatar.png"}
                          alt="profile"
                        />
                      </div>
                    ) : <div className="w-8" />}
                  </div>
                )}

                <div className={`
                        px-4 py-2.5 text-[15px] leading-relaxed shadow-sm relative min-w-[60px] pb-6 backdrop-blur-sm
                        ${isMe
                    ? "bg-gradient-to-br from-primary to-secondary text-white rounded-[22px] rounded-tr-sm shadow-primary/20"
                    : "bg-white/80 text-base-content rounded-[22px] rounded-tl-sm shadow-sm"
                  }
                    `}>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-[280px] rounded-xl mb-2 cursor-pointer hover:opacity-95 shadow-sm"
                      onClick={() => setSelectedImage(message.image)}
                    />
                  )}
                  {message.text && <p>{message.text}</p>}

                  <span className={`
                      text-[9px] absolute bottom-1.5 right-3 font-medium tracking-wide
                      ${isMe ? "text-white/70" : "text-base-content/40"}
                  `}>
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <MessageInput />

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm"
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 btn btn-circle btn-ghost text-white bg-white/10 hover:bg-white/20"
              >
                <X className="size-6" />
              </button>
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                src={selectedImage}
                alt="Full View"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
            <div
              className="absolute inset-0 -z-10"
              onClick={() => setSelectedImage(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ChatContainer;