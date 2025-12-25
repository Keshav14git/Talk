import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-black">
      <div className="max-w-md text-center space-y-8 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all duration-700"></div>
            <div className="w-20 h-20 bg-gray-900/50 rounded-2xl flex items-center justify-center border border-gray-800 shadow-2xl backdrop-blur-sm relative z-10 group-hover:scale-105 transition-transform duration-500">
              <MessageSquare className="size-8 text-white stroke-[1.5]" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-medium text-white tracking-widest uppercase">
            Talk Project
          </h2>
          <p className="text-gray-500 text-sm font-light tracking-wide">
            Select a conversation to begin.
          </p>
        </div>
      </div>
    </div>
  );
};
export default NoChatSelected;
