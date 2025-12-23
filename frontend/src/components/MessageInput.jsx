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
      <div className="p-4 w-full bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500 italic">
          Only admins can post in this channel.
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 w-full bg-white border-t border-gray-200">
      {/* Reply Banner */}
      {replyMessage && (
        <div className="flex items-center justify-between bg-gray-50 p-2 mb-2 rounded-lg border-l-4 border-[#FF5636]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FF5636] mb-0.5">
              <Reply className="size-3" />
              <span>Replying to {replyMessage.senderId === authUser._id ? 'yourself' : 'sender'}</span>
            </div>
            <div className="text-sm text-gray-600 truncate">
              {replyMessage.image && <span className="italic mr-1">[Image]</span>}
              {replyMessage.text}
            </div>
          </div>
          <button onClick={() => setReplyMessage(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X size={14} />
          </button>
        </div>
      )}

      {imagePreview && (
        <div className="mb-3 relative w-fit ml-4">
          <img src={imagePreview} className="h-32 rounded-lg border border-gray-200 object-cover" alt="Preview" />
          <button onClick={removeImage} className="absolute -top-2 -right-2 p-1 bg-gray-900 rounded-full text-white hover:bg-gray-700 transition-colors"><X size={12} /></button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-[#FF5636]/10 focus-within:border-[#FF5636]/50 transition-all shadow-sm">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-[#FF5636] hover:bg-[#FF5636]/10 rounded-xl transition-all shrink-0"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400/80 px-2 py-3 min-h-[44px] max-h-[150px] resize-none overflow-y-auto w-full custom-scrollbar text-sm leading-relaxed font-medium"
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
          className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
                        ${!text.trim() && !imagePreview ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#FF5636] text-white hover:bg-[#E04529] shadow-md shadow-[#FF5636]/20"}
                    `}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={18} className={(!text.trim() && !imagePreview) ? "" : "ml-0.5"} />
        </button>
      </div>
      <div className="text-[10px] text-gray-300 mt-1 text-center opacity-60">
        <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
      </div>
    </div>
  );
};
export default MessageInput;