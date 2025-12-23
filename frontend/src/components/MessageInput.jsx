import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile, Paperclip, Mic } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

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
    e.preventDefault();
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
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full bg-white border-t border-gray-200">
      {imagePreview && (
        <div className="mb-3 relative w-fit">
          <img src={imagePreview} className="h-32 rounded-lg border border-gray-200 object-cover" alt="Preview" />
          <button onClick={removeImage} className="absolute -top-2 -right-2 p-1 bg-gray-900 rounded-full text-white hover:bg-gray-700 transition-colors"><X size={12} /></button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="border border-gray-300 rounded-xl bg-white shadow-sm focus-within:ring-1 focus-within:ring-[#FF5636] focus-within:border-[#FF5636] transition-all">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 rounded-t-xl">
          <button
            type="button"
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>
          <div className="h-4 w-px bg-gray-300 mx-1" />
          <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
            <span className="font-bold text-xs font-serif">B</span>
          </button>
          <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
            <span className="italic text-xs font-serif">I</span>
          </button>
          <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
            <span className="underline text-xs font-serif">U</span>
          </button>
        </div>

        {/* Text Area */}
        <div className="flex items-end gap-2 p-2">
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 px-2 min-h-[40px]"
            placeholder="Message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="submit"
            className={`p-2 rounded-lg transition-colors flex items-center justify-center
                    ${!text.trim() && !imagePreview ? "bg-gray-100 text-gray-400" : "bg-[#007a5a] text-white hover:bg-[#007a5a]/90"}
                `}
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
      <div className="text-[10px] text-gray-400 mt-2 text-center">
        <strong>Return</strong> to send, <strong>Shift + Return</strong> to add a new line
      </div>
    </div>
  );
};
export default MessageInput;