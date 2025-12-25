import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState, useMemo } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, isSameDay } from "../lib/utils";
import { X, Trash2, Reply, ListChecks } from "lucide-react";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, selectedUser, deleteMessage, setReplyMessage, messageSearchQuery } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    // Subscription is now global in App.jsx
  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages && !isSelectionMode) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSelectionMode, messageSearchQuery]); // Scroll when search changes too? Maybe not, keep filtering.

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

  const handleReply = (message) => {
    setReplyMessage(message);
  };

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
  };

  // --- Search Filtering Logic ---
  const filteredMessages = messages.filter(msg => {
    if (!messageSearchQuery) return true;
    const lowerQuery = messageSearchQuery.toLowerCase();

    // 1. Text Match
    if (msg.text?.toLowerCase().includes(lowerQuery)) return true;

    // 2. Date Match (Naive but effective for "24", "Dec", "24 Dec")
    const msgDate = new Date(msg.createdAt);
    // Construct various string representations to check against
    const dateStr = msgDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase(); // "24 dec 2025"
    const dayStr = msgDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(); // "tuesday"

    if (dateStr.includes(lowerQuery)) return true;
    if (dayStr.includes(lowerQuery)) return true;

    // Check relative terms
    if (lowerQuery === 'today' && isSameDay(msgDate, new Date())) return true;
    if (lowerQuery === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      if (isSameDay(msgDate, y)) return true;
    }

    return false;
  });

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
        {filteredMessages.length === 0 && messageSearchQuery && (
          <div className="text-center mt-10 text-gray-500 text-sm">
            No messages found for <span className="font-bold">"{messageSearchQuery}"</span>
          </div>
        )}

        {filteredMessages.map((message, idx) => {
          const isMe = message.senderId === authUser._id;
          const isPrevSame = idx > 0 && filteredMessages[idx - 1].senderId === message.senderId;
          const isSelected = selectedMessageIds.includes(message._id);

          // Date Separator Check
          const currentDate = new Date(message.createdAt).toDateString();
          const prevDate = idx > 0 ? new Date(filteredMessages[idx - 1].createdAt).toDateString() : null;
          const showDateSeparator = currentDate !== prevDate;

          // Note: When filtering, gaps might appear that make "NextSame" logic weird visually, but acceptable.

          // Revised Logic for Grouping
          const effectiveIsPrevSame = showDateSeparator ? false : isPrevSame;

          const isNextSame = idx < filteredMessages.length - 1 && filteredMessages[idx + 1].senderId === message.senderId;
          const nextDate = idx < filteredMessages.length - 1 ? new Date(filteredMessages[idx + 1].createdAt).toDateString() : currentDate;
          const willShowSeparatorNext = nextDate !== currentDate;
          const effectiveIsNextSame = willShowSeparatorNext ? false : isNextSame;


          let borderRadiusClass = "rounded-2xl";
          if (isMe) {
            if (effectiveIsPrevSame && effectiveIsNextSame) borderRadiusClass = "rounded-r-sm rounded-l-2xl"; // Middle
            else if (effectiveIsPrevSame && !effectiveIsNextSame) borderRadiusClass = "rounded-tr-sm rounded-br-2xl rounded-l-2xl"; // Last
            else if (!effectiveIsPrevSame && effectiveIsNextSame) borderRadiusClass = "rounded-br-sm rounded-tr-2xl rounded-l-2xl"; // First
            else borderRadiusClass = "rounded-2xl rounded-tr-sm"; // Single
          } else {
            if (effectiveIsPrevSame && effectiveIsNextSame) borderRadiusClass = "rounded-l-sm rounded-r-2xl";
            else if (effectiveIsPrevSame && !effectiveIsNextSame) borderRadiusClass = "rounded-tl-sm rounded-bl-2xl rounded-r-2xl";
            else if (!effectiveIsPrevSame && effectiveIsNextSame) borderRadiusClass = "rounded-bl-sm rounded-tl-2xl rounded-r-2xl";
            else borderRadiusClass = "rounded-2xl rounded-tl-sm";
          }

          const marginTopClass = effectiveIsPrevSame ? "mt-[2px]" : "mt-4";


          return (
            <div key={message._id}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-gray-200">
                    {formatDateSeparator(message.createdAt)}
                  </span>
                </div>
              )}

              <div
                className={`group flex ${isMe ? "flex-row-reverse" : "flex-row"} gap-3 px-4 hover:bg-gray-50/50 transition-colors relative
                    ${isSelected ? "bg-[#FF5636]/5 hover:bg-[#FF5636]/10" : ""}
                    ${isMe ? "justify-start" : ""} 
                    ${marginTopClass}
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
                <div className="w-8 flex-shrink-0 flex flex-col items-end justify-end pb-1">
                  {!isMe && !effectiveIsNextSame && (
                    <img
                      src={selectedUser.profilePic || "/avatar.png"}
                      alt="avatar"
                      className="size-8 rounded-full object-cover shadow-sm"
                    />
                  )}
                </div>

                {/* Content Bubble */}
                <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`relative px-4 py-2 shadow-sm text-[15px] leading-relaxed break-words border border-transparent
                         ${isMe
                        ? `bg-gray-900 text-white ${borderRadiusClass}`
                        : `bg-white text-gray-800 border-gray-100 ${borderRadiusClass}`
                      }
                       `}
                  >
                    {/* Search Highlight?? For now just normal text */}
                    {/* Reply Context */}
                    {message.replyTo && (
                      <div className={`mb-2 p-2 rounded text-xs border-l-2 ${isMe ? "bg-gray-800 border-gray-600 text-gray-300" : "bg-gray-50 border-[#FF5636] text-gray-500"}`}>
                        <div className="font-semibold opacity-75 mb-0.5">Replying to</div>
                        <div className="truncate opacity-90">{message.replyTo.text || "Photo"}</div>
                      </div>
                    )}

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

                    <div className={`text-[10px] mt-1 text-right w-full flex items-center justify-end gap-1 ${isMe ? "text-gray-300" : "text-gray-400"}`}>
                      {formatMessageTime(message.createdAt)}
                      {isMe && <ListChecks className="size-3 text-blue-400" />}
                    </div>

                  </div>
                </div>

                {/* Hover Actions */}
                {!isSelectionMode && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center px-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReply(message); }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Reply"
                    >
                      <Reply size={14} />
                    </button>

                    {isMe && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(message._id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
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