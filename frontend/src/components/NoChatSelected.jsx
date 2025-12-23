import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-transparent relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md text-center space-y-6 relative z-10 p-8 rounded-3xl "
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mx-auto shadow-2xl shadow-primary/30"
        >
          <img src="/talkw.svg" alt="logo" className="w-[124px] h-[124px] " />
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
            Welcome to TALK!
          </h2>
          <p className="text-lg text-base-content/60 leading-relaxed">
            Select a conversation from the sidebar to start chatting globally with your friends.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NoChatSelected;
