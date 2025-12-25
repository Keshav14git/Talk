import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gray-900/50 backdrop-blur-3xl">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(255,86,54,0.2)]">
              <MessageSquare className="size-12 text-primary drop-shadow-[0_0_10px_rgba(255,86,54,0.5)]" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-100 tracking-tight">
            Welcome to Talk Project
          </h2>
          <p className="text-gray-400 mt-3 text-lg font-medium">
            Select a conversation from the sidebar to start chatting.
          </p>
        </div>
      </div>
    </div>
  );
};
export default NoChatSelected;
