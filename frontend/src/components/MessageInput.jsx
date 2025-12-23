import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="p-4 w-full bg-transparent relative z-20">
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-3 relative w-fit mx-auto"
          >
            <img src={imagePreview} className="h-40 rounded-2xl border border-white/40 shadow-xl" alt="Preview" />
            <button onClick={removeImage} className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error text-white shadow-md"><X size={12} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
        <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-[2rem] flex items-center px-2 py-1.5 shadow-lg border border-white/40 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
          <button
            type="button"
            className="btn btn-circle btn-sm btn-ghost text-base-content/50 hover:text-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} />
          </button>

          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-base text-base-content placeholder:text-base-content/40 px-2 h-10 w-full"
            placeholder="Type a message..."
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

          <button type="button" className="btn btn-circle btn-sm btn-ghost text-base-content/50 hover:text-secondary transition-colors">
            <Smile size={20} />
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className={`btn btn-circle h-12 w-12 min-h-0 bg-gradient-to-tr from-primary to-secondary text-white border-none shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none`}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} className="ml-0.5" />
        </motion.button>
      </form>
    </div>
  );
};
export default MessageInput;