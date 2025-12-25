import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, X, Paperclip, Reply } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const { sendMessage, selectedUser, replyMessage, setReplyMessage } = useChatStore();
  const { authUser } = useAuthStore();

  const isChannel = selectedUser?.type === 'channel';
  const adminId = selectedUser?.admin?._id || selectedUser?.admin || "";
  const isAdmin = adminId === authUser?._id;
  const isReadOnly = isChannel && !isAdmin;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Reset height
      if (textareaRef.current) textareaRef.current.style.height = 'auto';

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isReadOnly) {
    return (
      <div className="p-4 w-full bg-gray-900 border-t border-gray-800 text-center">
        <p className="text-sm text-gray-500 italic">
          Only admins can post in this channel.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 w-full bg-gray-900 border-t border-gray-800">
      {/* Reply Banner */}
      {replyMessage && (
        <div className="flex items-center justify-between bg-gray-800/80 p-3 mb-2 rounded-xl border-l-[3px] border-primary backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
              <Reply className="size-3.5" />
              <span>Replying to {replyMessage.senderId === authUser._id ? 'yourself' : 'sender'}</span>
            </div>
            <div className="text-sm text-gray-300 truncate font-medium">
              {replyMessage.image && <span className="italic mr-1 text-gray-500 font-normal">[Image]</span>}
              {replyMessage.text}
            </div>
          </div>
          <button onClick={() => setReplyMessage(null)} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {imagePreview && (
        <div className="mb-3 relative w-fit ml-4 group">
          <div className="relative">
            <img src={imagePreview} className="h-40 rounded-xl border border-gray-700 object-cover shadow-lg" alt="Preview" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors rounded-xl m-[1px]"></div>
          </div>
          <button onClick={removeImage} className="absolute -top-2 -right-2 p-1.5 bg-gray-800 rounded-full text-white border border-gray-700 hover:bg-red-500 hover:border-red-500 transition-all shadow-md"><X size={14} /></button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-gray-800 p-2 rounded-2xl border border-gray-700/50 focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/30 transition-all shadow-lg shadow-black/5">
        <button
          type="button"
          className="p-2.5 text-gray-400 hover:text-primary hover:bg-gray-700/50 rounded-xl transition-all shrink-0 h-[44px] flex items-center justify-center"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          <Paperclip size={20} className="stroke-[1.5]" />
        </button>

        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder:text-gray-500 px-2 py-3 min-h-[44px] max-h-[150px] resize-none overflow-y-auto w-full custom-scrollbar text-[15px] leading-relaxed font-medium"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        <button
          onClick={handleSendMessage}
          className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 h-[44px] w-[44px]
                        ${!text.trim() && !imagePreview
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-[#E04529] shadow-lg shadow-[#FF5636]/20 active:scale-95"}
                    `}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={18} className={(!text.trim() && !imagePreview) ? "" : "ml-0.5"} />
        </button>
      </div>
      <div className="text-[10px] text-gray-500 mt-2 text-center font-medium tracking-wide">
        <strong className="text-gray-400">Enter</strong> to send, <strong className="text-gray-400">Shift + Enter</strong> for new line
      </div>
    </div>
  );
};
export default MessageInput;