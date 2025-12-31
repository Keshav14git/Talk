import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected"; // Can remove if unused, but keeping just in case
import ChatContainer from "../components/ChatContainer";
import ProjectDashboard from "../components/ProjectDashboard";
import HomeDashboard from "../components/HomeDashboard"; // Added Import

const HomePage = () => {
  const { selectedUser, selectedType } = useChatStore();

  return (
    <div className="h-full w-full bg-gray-900 overflow-hidden flex flex-col">
      <div className={`flex-1 h-full flex flex-col ${!selectedUser ? "hidden md:flex" : "flex"}`}>
        {!selectedUser ? (
          <HomeDashboard /> // Replaced NoChatSelected
        ) : selectedType === 'project' ? (
          <ProjectDashboard project={selectedUser} />
        ) : (
          <ChatContainer />
        )}
      </div>
    </div>
  );
};
export default HomePage;