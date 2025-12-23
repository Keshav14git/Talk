import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser, isSidebarOpen } = useChatStore();

  return (
    <div className="h-full bg-transparent flex items-center justify-center pt-2 pb-4 px-4">
      <div className="bg-base-100/80 backdrop-blur-3xl rounded-[2rem] shadow-2xl w-full max-w-[95%] h-[calc(100vh-6rem)] overflow-hidden border border-white/40 ring-1 ring-white/20 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="flex h-full overflow-hidden relative z-10">
          <div className={`h-full shrink-0 border-r border-white/20 transition-all duration-300 ease-in-out
            ${selectedUser ? "hidden md:flex" : "flex w-full md:w-auto"}
            ${isSidebarOpen ? "md:w-80 lg:w-96" : "md:w-20"}
          `}>
            <Sidebar />
          </div>

          <div className={`flex-1 h-full flex flex-col bg-white/30 ${!selectedUser ? "hidden md:flex" : "flex"}`}>
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;