import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-white">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-24 h-24 bg-[#FF5636]/10 rounded-2xl flex items-center justify-center animate-bounce">
              <MessageSquare className="size-12 text-[#FF5636]" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to Talk Project
          </h2>
          <p className="text-gray-500 mt-2">
            Select a conversation from the sidebar to start chatting.
          </p>
        </div>
      </div>
    </div>
  );
};
export default NoChatSelected;
