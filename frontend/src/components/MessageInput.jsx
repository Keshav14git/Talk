import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
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
    <div className="p-4 bg-base-100 w-full">
      {imagePreview && (
        <div className="mb-3 relative w-fit">
          <img src={imagePreview} className="h-24 rounded-xl border border-base-300" alt="Preview" />
          <button onClick={removeImage} className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error text-white"><X size={12} /></button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 bg-base-200 rounded-full flex items-center px-4 h-11 border border-transparent focus-within:border-base-content/10 transition-colors">
          <button
            type="button"
            className="text-base-content/40 hover:text-primary transition-colors mr-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={24} strokeWidth={1.5} />
          </button>

          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-base-content/40 h-full w-full"
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

          <button type="button" className="text-base-content/40 hover:text-base-content transition-colors ml-2">
            <Smile size={24} strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="submit"
          className={`btn btn-circle btn-primary h-11 w-11 min-h-0 disabled:bg-base-200 disabled:text-base-content/20 transition-all scale-100 opacity-100`}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} className="ml-0.5" />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;