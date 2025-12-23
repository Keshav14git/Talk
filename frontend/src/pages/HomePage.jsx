import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser, isSidebarOpen } = useChatStore();

  return (
    <div className="h-screen bg-white overflow-hidden flex">
      <div className={`h-full shrink-0 border-r border-gray-200 transition-all duration-300 ease-in-out
        ${selectedUser ? "hidden md:flex" : "flex w-full md:w-auto"}
        ${isSidebarOpen ? "md:w-80 lg:w-96" : "md:w-20"}
      `}>
        <Sidebar />
      </div>

      <div className={`flex-1 h-full flex flex-col ${!selectedUser ? "hidden md:flex" : "flex"}`}>
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};
export default HomePage;