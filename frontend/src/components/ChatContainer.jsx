import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState, useMemo } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, isSameDay } from "../lib/utils";
import { X, Trash2, Reply, ListChecks, Check } from "lucide-react";

const ChatContainer = ({ overrideUser, overrideType }) => {
  const { messages, getMessages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, selectedUser: storeSelectedUser, selectedType: storeSelectedType, deleteMessage, setReplyMessage, messageSearchQuery } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const messageEndRef = useRef(null);

  // Use overrides if provided, otherwise fallback to store
  const selectedUser = overrideUser || storeSelectedUser;
  const selectedType = overrideType || storeSelectedType;

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      // For overrides (like DMs in project), we fetch standard user messages
      // logic inside getMessages handles types, but if we pass `overrideType="user"` it fetches `/messages/:id`
      // Only issue: getMessages inside store reads `selectedType` from GET().
      // So to support overrides, `getMessages` needs refactoring OR we manual fetch.
      // Refactoring `getMessages` to accept optional type arg is best.
      // But assuming getMessages(activeId) READS Store state...
      // We should refactor getMessages in store first? Or just trick it?

      // Actually `getMessages` in store:
      // const { selectedType } = get();
      // So it strictly uses store state.

      // workaround: If override is present, we might fail to fetch correct endpoint if types differ.
      // However, `ProjectDashboard` won't update global store for DMs to avoid page switch.

      // Better solution: Pass `type` to `getMessages` in store.
      // Let's rely on the store having `getMessages(id, type)`.
      // I need to update store first? 
      // Let's try passing type to getMessages and see if JS allows it even if not def.
      // `getMessages: async (id) => ...` uses `get()`.

      // I must update useChatStore.js `getMessages` signature to `getMessages: async (id, typeOverride)`.
      getMessages(selectedUser._id, selectedType);
    }
  }, [selectedUser?._id, getMessages, selectedType]);

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
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
        <ChatHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-48 h-0.5 bg-gray-800 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-white/50 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" style={{ animation: 'slide 1.5s ease-in-out infinite' }} />
            {/* Fallback animation style if 'slide' isn't defined in config, using inline style for simple keyframes usually requires style tag or pre-defined class. 
                  I'll use a simpler 'animate-pulse' on a moving bar width if unsure of config, OR just 'animate-pulse' on the whole bar.
                  But user asked for "linear line loading". 
                  Let's assume standard 'animate-pulse' on a filled bar looks "loading" enough or use a standard trick.
              */}
            <div className="h-full bg-white animate-pulse w-full origin-left" />
          </div>
          <p className="text-gray-500 text-xs font-medium tracking-wide animate-pulse lowercase">chats are loading, wait few seconds</p>
        </div>
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
        <ChatHeader isSelectionMode={isSelectionMode} setIsSelectionMode={setIsSelectionMode} />

        {/* Selection Banner */}
        {isSelectionMode && (
          <div
            className="absolute inset-x-0 top-[64px] bg-gray-800 z-10 flex items-center justify-between px-6 py-3 border-b border-gray-700 shadow-lg"
          >
            <span className="font-bold text-sm text-white tracking-wide">{selectedMessageIds.length} SELECTED</span>
            <div className="flex gap-4">
              <button onClick={() => { setIsSelectionMode(false); setSelectedMessageIds([]); }} className="text-xs text-gray-400 hover:text-white font-medium tracking-wide transition-colors uppercase">Cancel</button>
              <button
                onClick={handleBulkDelete}
                className="text-xs text-red-500 hover:text-red-400 font-medium tracking-wide transition-colors uppercase"
                disabled={selectedMessageIds.length === 0}
              >
                Delete
              </button>
            </div>
          </div>
        )}


      </div>

      <div className="flex-1 overflow-y-auto p-4 relative z-0 custom-scrollbar">
        {filteredMessages.length === 0 && messageSearchQuery && (
          <div className="text-center mt-10 text-gray-500 text-sm">
            No messages found for <span className="font-bold text-gray-300">"{messageSearchQuery}"</span>
          </div>
        )}

        {filteredMessages.map((message, idx) => {
          const isMe = message.senderId?._id
            ? message.senderId._id === authUser._id
            : message.senderId === authUser._id;

          const isPrevSame = idx > 0 && (filteredMessages[idx - 1].senderId?._id || filteredMessages[idx - 1].senderId) === (message.senderId?._id || message.senderId);
          const isSelected = selectedMessageIds.includes(message._id);

          // Date Separator Check
          const currentDate = new Date(message.createdAt).toDateString();
          const prevDate = idx > 0 ? new Date(filteredMessages[idx - 1].createdAt).toDateString() : null;
          const showDateSeparator = currentDate !== prevDate;

          // Note: When filtering, gaps might appear that make "NextSame" logic weird visually, but acceptable.

          // Revised visual grouping logic
          const effectiveIsPrevSame = showDateSeparator ? false : isPrevSame;
          const isNextSame = idx < filteredMessages.length - 1 && (filteredMessages[idx + 1].senderId?._id || filteredMessages[idx + 1].senderId) === (message.senderId?._id || message.senderId);
          const nextDate = idx < filteredMessages.length - 1 ? new Date(filteredMessages[idx + 1].createdAt).toDateString() : currentDate;
          const willShowSeparatorNext = nextDate !== currentDate;
          const effectiveIsNextSame = willShowSeparatorNext ? false : isNextSame;

          // Standard WhatsApp-like Bubbles: Sharp top-right for Sender, Sharp top-left for Receiver
          let borderRadiusClass = "rounded-lg";
          if (isMe) {
            borderRadiusClass = "rounded-lg rounded-tr-none";
          } else {
            borderRadiusClass = "rounded-lg rounded-tl-none";
          }

          const marginTopClass = effectiveIsPrevSame ? "mt-1.5" : "mt-3";

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
                className={`group flex ${isMe ? "flex-row-reverse" : "flex-row"} gap-2 px-2 md:px-4 hover:bg-white/[0.02] transition-colors relative
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

                {/* Avatar - Only for Groups/Channels or if explicitly desired. WhatsApp DMs hide it. */}
                {/* Logic: IF not me AND is group/channel AND (is last of group OR forcing for variety) -> Show */}
                {/* For strict WhatsApp mobile DMs: No avatar. */}
                {(selectedType === "group" || selectedType === "channel") && (
                  <div className="w-8 flex-shrink-0 flex flex-col items-end justify-end pb-1">
                    {!isMe && !effectiveIsNextSame && (
                      <img
                        src={selectedUser.profilePic || "/avatar.png"}
                        alt="avatar"
                        className="size-8 rounded-full object-cover shadow-sm bg-gray-800 ring-2 ring-gray-900"
                      />
                    )}
                  </div>
                )}

                {/* Content Bubble */}
                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>

                  {/* Sender Name & Role - Only for Groups/Channels, Not Me, and First in Block */}
                  {!isMe && (selectedType === "group" || selectedType === "channel") && !effectiveIsPrevSame && (
                    <div className="ml-1 mb-1 flex items-baseline gap-2">
                      <span className="text-xs font-bold text-gray-300">
                        {message.senderId?.fullName || "Unknown"}
                      </span>
                      {message.senderId?.role && (
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider font-semibold">
                          {message.senderId.role}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`relative text-[14px] leading-relaxed break-words shadow-sm
                         ${isMe
                        ? `bg-gray-700 text-white border border-gray-600 ${borderRadiusClass}`
                        : `bg-[#111] text-gray-200 border border-gray-800 ${borderRadiusClass}`
                      }
                      ${message.image ? "p-1" : "px-4 py-2"}
                       `}
                  >
                    {/* Reply Context */}
                    {message.replyTo && (
                      <div className={`mb-2 p-2 rounded text-xs border-l-2 ${isMe ? "bg-gray-800/50 border-gray-500 text-gray-300" : "bg-black border-gray-600 text-gray-400"}`}>
                        <div className="font-semibold opacity-75 mb-0.5">Replying to</div>
                        <div className="truncate opacity-90">{message.replyTo.text || "Photo"}</div>
                      </div>
                    )}

                    {message.image && (
                      <div className="mb-1 overflow-hidden rounded-lg">
                        <img
                          src={message.image}
                          alt="Attachment"
                          className={`cursor-zoom-in hover:opacity-90 transition-opacity border border-white/5 w-auto h-auto max-w-full sm:max-w-[330px] max-h-[400px] block`}
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(message.image); }}
                        />
                      </div>
                    )}

                    {message.text && (
                      <span className={`align-middle ${message.image ? "block px-1" : ""}`}>
                        {message.text}
                      </span>
                    )}

                    {/* Inline Timestamp */}
                    <span className={`inline-flex items-center align-bottom ml-2 gap-1 text-[10px] float-right mt-1 ${isMe ? "text-gray-400" : "text-gray-500"} ${message.image && !message.text ? "absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/40 rounded-full text-white backdrop-blur-sm" : ""}`}>
                      {formatMessageTime(message.createdAt)}
                      {isMe && (
                        selectedUser && onlineUsers.includes(selectedUser._id) ?
                          <ListChecks className={`size-3 ${message.image && !message.text ? "text-white" : "text-blue-400"}`} /> :
                          <Check className={`size-3 ${message.image && !message.text ? "text-white" : "text-gray-400"}`} />
                      )}
                    </span>
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