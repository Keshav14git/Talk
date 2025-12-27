import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, X, Paperclip, Reply, Smile, Image as ImageIcon, Gift } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
// Categories for quick search
const GIF_CATEGORIES = ["Trending", "Happy", "Sad", "Love", "Reaction", "Work", "Code"];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Feature Toggles
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);

  // Fetch GIFs
  useEffect(() => {
    if (!showGifs) return;

    const fetchGifs = async () => {
      setIsLoadingGifs(true);
      try {
        const apiKey = import.meta.env.VITE_GIPHY_API_KEY;
        if (!apiKey) {
          toast.error("Giphy API Key missing");
          setGifs([]);
          return;
        }

        const endpoint = gifSearch
          ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${gifSearch}&limit=20&rating=g`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (data.data) {
          setGifs(data.data.map(g => g.images.fixed_height.url));
        }
      } catch (error) {
        console.error("Failed to fetch GIFs", error);
        toast.error("Failed to load GIFs");
      } finally {
        setIsLoadingGifs(false);
      }
    };

    const timeoutId = setTimeout(fetchGifs, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [showGifs, gifSearch]);


  const { sendMessage, selectedUser, replyMessage, setReplyMessage } = useChatStore();
  const { authUser } = useAuthStore();

  const isChannel = selectedUser?.type === 'channel';
  const adminId = selectedUser?.admin?._id || selectedUser?.admin || "";
  const isAdmin = adminId === authUser?._id;
  const isReadOnly = isChannel && !isAdmin;

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  // Image Handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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

  // GIF Handling
  const handleGifSelect = async (url) => {
    try {
      setShowGifs(false);
      // Fetch the GIF and convert to Base64 to treat it like an uploaded image
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      toast.error("Failed to load GIF");
    }
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
      setShowEmoji(false);
      setShowGifs(false);

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

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    // Don't close picker for multiple emojis
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
    <div className="p-3 w-full bg-gray-900 border-t border-gray-800 relative z-20">

      {/* Popups Layer - Absolute positioned above input */}
      {showEmoji && (
        <div className="absolute bottom-[80px] left-4 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-[#111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative">
            {/* Close Button Mobile Friendly */}
            <div className="flex items-center justify-between p-2 bg-[#18181b] border-b border-gray-800">
              <span className="text-xs text-gray-400 font-medium ml-2">Emojis</span>
              <button onClick={() => setShowEmoji(false)} className="p-1 hover:bg-gray-800 rounded-full text-gray-400"><X size={14} /></button>
            </div>
            <EmojiPicker
              theme="dark"
              onEmojiClick={onEmojiClick}
              width={320}
              height={400}
              searchDisabled
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}

      {showGifs && (
        <div className="absolute bottom-[80px] left-16 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-[#111] border border-gray-800 rounded-2xl shadow-2xl p-3 w-[320px]">
            {/* Header & Search */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 focus-within:border-gray-600 transition-colors">
                <input
                  type="text"
                  placeholder="Search GIFs..."
                  className="w-full bg-transparent text-sm text-gray-200 px-3 py-1.5 focus:outline-none placeholder:text-gray-600"
                  value={gifSearch}
                  onChange={(e) => setGifSearch(e.target.value)}
                />
              </div>
              <button onClick={() => setShowGifs(false)} className="p-1.5 hover:bg-gray-800 rounded-full text-gray-400"><X size={14} /></button>
            </div>

            {/* Categories Tags */}
            {!gifSearch && (
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2 mb-1">
                {GIF_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setGifSearch(cat)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide transition-colors whitespace-nowrap bg-gray-800 text-gray-400 hover:bg-gray-700`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto custom-scrollbar p-1">
              {isLoadingGifs ? (
                <div className="col-span-3 flex justify-center py-10"><div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : gifs.length > 0 ? (
                gifs.map((gif, i) => (
                  <button
                    key={i}
                    onClick={() => handleGifSelect(gif)}
                    className="rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all aspect-square relative group bg-gray-800"
                  >
                    <img src={gif} alt="GIF" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500 py-4 text-xs">No GIFs found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reply Banner */}
      {replyMessage && (
        <div className="flex items-center justify-between bg-black p-3 mb-2 rounded-xl border-l-[3px] border-white backdrop-blur-sm border border-gray-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
              <Reply className="size-3.5" />
              <span>Replying to {replyMessage.senderId === authUser._id ? 'yourself' : 'sender'}</span>
            </div>
            <div className="text-sm text-gray-400 truncate font-medium">
              {replyMessage.image && <span className="italic mr-1 text-gray-500 font-normal">[Image]</span>}
              {replyMessage.text}
            </div>
          </div>
          <button onClick={() => setReplyMessage(null)} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative w-fit ml-4 group">
          <div className="relative">
            <img src={imagePreview} className="h-40 rounded-xl border border-gray-700 object-cover shadow-lg" alt="Preview" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors rounded-xl m-[1px]"></div>
          </div>
          <button onClick={removeImage} className="absolute -top-2 -right-2 p-1.5 bg-gray-800 rounded-full text-white border border-gray-700 hover:bg-red-500 hover:border-red-500 transition-all shadow-md"><X size={14} /></button>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-end gap-2 bg-gray-800 p-2 rounded-2xl border border-gray-700/50 focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/30 transition-all shadow-lg shadow-black/5">

        {/* Actions Group */}
        <div className="flex items-center gap-0.5 self-end mb-0.5">
          <button
            type="button"
            className={`p-2 rounded-xl transition-all shrink-0 flex items-center justify-center hover:bg-gray-700/50 ${showEmoji ? 'text-primary' : 'text-gray-400'}`}
            onClick={() => { setShowEmoji(!showEmoji); setShowGifs(false); }}
            title="Emoji"
          >
            <Smile size={20} className="stroke-[1.5]" />
          </button>

          <button
            type="button"
            className={`p-2 rounded-xl transition-all shrink-0 flex items-center justify-center hover:bg-gray-700/50 ${showGifs ? 'text-primary' : 'text-gray-400'}`}
            onClick={() => { setShowGifs(!showGifs); setShowEmoji(false); }}
            title="GIFs"
          >
            <Gift size={20} className="stroke-[1.5]" />
          </button>

          <button
            type="button"
            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-700/50 rounded-xl transition-all shrink-0 flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image"
          >
            <Paperclip size={20} className="stroke-[1.5]" />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder:text-gray-500 px-2 py-3 min-h-[44px] max-h-[150px] resize-none overflow-y-auto w-full custom-scrollbar text-[15px] leading-relaxed font-medium"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={() => { setShowEmoji(false); setShowGifs(false); }} // Close popovers when typing
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
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-200 shadow-md shadow-white/10 active:scale-95"}
                    `}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={18} className={(!text.trim() && !imagePreview) ? "" : "ml-0.5"} />
        </button>
      </div>

      <div className="text-[10px] text-gray-500 mt-2 text-center font-medium tracking-wide">
        <strong className="text-gray-400">Enter</strong> to send
      </div>
    </div>
  );
};
export default MessageInput;