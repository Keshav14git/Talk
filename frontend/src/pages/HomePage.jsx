import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser, isSidebarOpen } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-0 px-0 md:pt-20 md:px-4 h-full">
        <div className="bg-base-100 rounded-none md:rounded-lg shadow-xl w-full max-w-[1700px] h-full md:h-[calc(100vh-6rem)] overflow-hidden">
          <div className="flex h-full overflow-hidden">
            <div className={`h-full w-full shrink-0 border-r border-base-200 transition-all duration-300
              ${selectedUser ? "hidden md:flex" : "flex"}
              ${isSidebarOpen ? "md:w-72 lg:w-80" : "md:w-20"}
            `}>
              <Sidebar />
            </div>

            <div className={`flex-1 h-full flex flex-col ${!selectedUser ? "hidden md:flex" : "flex"}`}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;