import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState, useMemo } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, isSameDay } from "../lib/utils";
import { X, Trash2, Reply, ListChecks, Check } from "lucide-react";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, selectedUser, deleteMessage, setReplyMessage, messageSearchQuery } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
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
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-900 relative">
      <div className="relative z-10 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
        <ChatHeader />

        {/* Selection Banner */}
        {isSelectionMode && (
          <div
            className="absolute inset-x-0 top-[64px] bg-white z-10 flex items-center justify-between px-6 py-3 border-b border-gray-100 shadow-lg"
          >
            <span className="font-bold text-sm text-black tracking-wide">{selectedMessageIds.length} SELECTED</span>
            <div className="flex gap-4">
              <button onClick={() => { setIsSelectionMode(false); setSelectedMessageIds([]); }} className="text-xs text-gray-500 hover:text-black font-medium tracking-wide transition-colors uppercase">Cancel</button>
              <button
                onClick={handleBulkDelete}
                className="text-xs text-red-600 hover:text-red-700 font-medium tracking-wide transition-colors uppercase"
                disabled={selectedMessageIds.length === 0}
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {!isSelectionMode && (
          <button
            onClick={() => setIsSelectionMode(true)}
            className="absolute right-6 top-[76px] text-[10px] text-gray-600 hover:text-white uppercase tracking-wider font-semibold z-0 bg-transparent hover:bg-white/10 px-3 py-1 rounded-full border border-gray-800 transition-all"
            title="Select Messages"
          >
            Select
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative z-0 custom-scrollbar">
        {filteredMessages.length === 0 && messageSearchQuery && (
          <div className="text-center mt-10 text-gray-500 text-sm">
            No messages found for <span className="font-bold text-gray-300">"{messageSearchQuery}"</span>
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
                <div className="flex justify-center my-6">
                  <span className="bg-gray-800/80 text-gray-400 text-[10px] font-bold tracking-wide uppercase px-3 py-1 rounded-full border border-gray-700/50 backdrop-blur-sm">
                    {formatDateSeparator(message.createdAt)}
                  </span>
                </div>
              )}

              <div
                className={`group flex ${isMe ? "flex-row-reverse" : "flex-row"} gap-3 px-4 hover:bg-white/[0.02] transition-colors relative
                    ${isSelected ? "bg-primary/5 hover:bg-primary/5" : ""}
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
                      className="size-4 rounded border-gray-600 bg-black text-white focus:ring-white focus:ring-offset-black"
                    />
                  </div>
                )}

                {/* Avatar */}
                <div className="w-8 flex-shrink-0 flex flex-col items-end justify-end pb-1">
                  {!isMe && !effectiveIsNextSame && (
                    <img
                      src={selectedUser.profilePic || "/avatar.png"}
                      alt="avatar"
                      className="size-8 rounded-full object-cover shadow-sm bg-gray-800 ring-2 ring-gray-900"
                    />
                  )}
                </div>

                {/* Content Bubble */}
                <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`relative px-4 py-3 text-[14px] leading-relaxed break-words shadow-sm
                         ${isMe
                        ? `bg-white text-black border border-white ${borderRadiusClass}`
                        : `bg-[#111] text-gray-200 border border-gray-800 ${borderRadiusClass}`
                      }
                       `}
                  >
                    {/* Reply Context */}
                    {message.replyTo && (
                      <div className={`mb-2 p-2 rounded text-xs border-l-2 ${isMe ? "bg-gray-100 border-gray-400 text-gray-600" : "bg-black border-gray-600 text-gray-400"}`}>
                        <div className="font-semibold opacity-75 mb-0.5">Replying to</div>
                        <div className="truncate opacity-90">{message.replyTo.text || "Photo"}</div>
                      </div>
                    )}

                    {message.image && (
                      <div className="mb-2">
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="max-w-[200px] max-h-60 rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity border border-white/5"
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(message.image); }}
                        />
                      </div>
                    )}
                    {message.text}

                    <div className={`text-[10px] mt-1.5 text-right w-full flex items-center justify-end gap-1 ${isMe ? "text-gray-400" : "text-gray-600"}`}>
                      {formatMessageTime(message.createdAt)}
                      {isMe && (
                        // Logic: If selected user is online -> Delivered (Double Check), else Sent (Single Check)
                        // Note: Ideally message.status from backend needs to drive this.
                        selectedUser && onlineUsers.includes(selectedUser._id) ?
                          <ListChecks className="size-3 text-black" /> :
                          <Check className="size-3 text-gray-400" />
                      )}
                    </div>

                  </div>
                </div>

                {/* Hover Actions */}
                {!isSelectionMode && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center px-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReply(message); }}
                      className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded bg-gray-900/50 border border-gray-800"
                      title="Reply"
                    >
                      <Reply size={14} />
                    </button>

                    {isMe && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(message._id); }}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded bg-gray-900/50 border border-gray-800"
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
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl max-h-full">
            <button className="absolute -top-10 right-0 p-2 text-white/60 hover:text-white"><X /></button>
            <img src={selectedImage} alt="Full View" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl ring-1 ring-white/10" />
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatContainer;