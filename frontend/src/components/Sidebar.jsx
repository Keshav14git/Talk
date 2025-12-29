import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  Users, CirclePlus, MessageSquare, Archive,
  Search, Bell, Settings, LogOut, Briefcase, Hash, ChevronDown, ChevronRight, Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import AddFriendModal from "./AddFriendModal";
import FriendRequestsModal from "./FriendRequestsModal";
import CreateGroupModal from "./CreateGroupModal";
import CreateProjectModal from "./CreateProjectModal";
import ExploreChannelsModal from "./ExploreChannelsModal";
import CreateChannelModal from "./CreateChannelModal";
import { useOrgStore } from "../store/useOrgStore";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const {
    selectedUser, setSelectedUser,
    isUsersLoading,
    deleteConversation,
    isSidebarOpen, toggleSidebar, setSidebarOpen
  } = useChatStore();

  const { logout, onlineUsers, authUser } = useAuthStore();
  const { orgMembers, orgProjects, currentOrg, fetchOrgData } = useOrgStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Section Toggle States
  const [sections, setSections] = useState({
    projects: true,
    channels: true,
    directMessages: true
  });

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure org data is loaded (redundant if Layout does it, but safe)
  useEffect(() => {
    if (currentOrg && orgMembers.length === 0) {
      fetchOrgData();
    }
  }, [currentOrg, fetchOrgData, orgMembers.length]);


  const filterList = (list) => {
    if (!list) return [];
    return list.filter(item => {
      const name = item.fullName || item.name || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  // Derived Lists
  const filteredProjects = filterList(orgProjects);
  // Separate Channels (public/private) from general groups if needed. 
  // For now assuming orgProjects covers projects. 
  // We need a specific call for Channels if they are stored in `groups` or separate.
  // The backend supports `getOrgChannels`. We need to use `useChatStore` or `useOrgStore` to fetch them.
  // Actually, currently `useChatStore` fetches `groups`. We should probably migrate Channels to `useOrgStore` or filter `groups`.
  // Let's use `groups` from `useChatStore` for now but filter by type='channel'.
  const { groups, getGroups } = useChatStore();
  useEffect(() => { getGroups(); }, [getGroups]);

  const filteredChannels = filterList(groups.filter(g => g.type === 'channel'));
  const filteredMembers = filterList(orgMembers.filter(m => m._id !== authUser?._id)); // Exclude self

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full flex flex-col w-full md:w-[300px] border-r border-gray-800 bg-[#0a0a0a] flex-shrink-0 relative z-20">
      {/* Workspace Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {currentOrg?.name?.substring(0, 2).toUpperCase() || "W"}
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-bold text-gray-200 truncate leading-tight">{currentOrg?.name || "Workspace"}</h1>
            <span className="text-[10px] text-gray-500 truncate">{authUser?.email}</span>
          </div>
        </div>
        {/* Settings / Menu */}
        <div className="flex items-center">
          <button onClick={() => setActiveModal('requests')} title="Invites" className="p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="size-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Jump to..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-gray-800/50 text-gray-300 text-sm rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-gray-600"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar space-y-6 py-2">

        {/* PROJECTS SECTION */}
        <div className="space-y-0.5">
          <div className="group flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 cursor-pointer" onClick={() => toggleSection('projects')}>
            <div className="flex items-center gap-1">
              {sections.projects ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              Projects
            </div>
            <button onClick={(e) => { e.stopPropagation(); setActiveModal('createProject'); }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-all">
              <CirclePlus className="size-3.5" />
            </button>
          </div>

          {sections.projects && (
            <div className="space-y-0.5">
              {filteredProjects.map(project => (
                <ListItem
                  key={project._id}
                  item={project}
                  type="project"
                  icon={Briefcase}
                  isSelected={selectedUser?._id === project._id}
                  onClick={() => setSelectedUser(project, 'project')}
                />
              ))}
              {filteredProjects.length === 0 && (
                <div className="px-4 py-2 text-xs text-gray-600 italic">No projects yet</div>
              )}
            </div>
          )}
        </div>

        {/* CHANNELS SECTION */}
        <div className="space-y-0.5">
          <div className="group flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 cursor-pointer" onClick={() => toggleSection('channels')}>
            <div className="flex items-center gap-1">
              {sections.channels ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              Channels
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
              <button onClick={(e) => { e.stopPropagation(); setActiveModal('explore'); }} className="p-0.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-all" title="Browse">
                <Search className="size-3.5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveModal('createChannel'); }} className="p-0.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-all" title="Create">
                <CirclePlus className="size-3.5" />
              </button>
            </div>
          </div>

          {sections.channels && (
            <div className="space-y-0.5">
              {filteredChannels.map(channel => (
                <ListItem
                  key={channel._id}
                  item={{ ...channel, fullName: channel.name }}
                  type="channel"
                  icon={Hash}
                  isSelected={selectedUser?._id === channel._id}
                  onClick={() => setSelectedUser(channel, 'channel')}
                />
              ))}
              {filteredChannels.length === 0 && (
                <div className="px-4 py-2 text-xs text-gray-600 italic">No channels joined</div>
              )}
            </div>
          )}
        </div>

        {/* DIRECT MESSAGES (Org Members) */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSection('directMessages')}>
            <div className="flex items-center gap-1">
              {sections.directMessages ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              People
            </div>
          </div>

          {sections.directMessages && (
            <div className="space-y-0.5">
              {filteredMembers.map(member => {
                // Member object usually has { _id, userId: {fullName...}, role } if populated from OrgMembers
                // Or if it's the raw user object?
                // Standardize: useOrgStore.orgMembers stores populated members.
                // Structure: { _id, userId: { _id, fullName, ... }, role }
                // The `item` passed to ListItem should be the User part with Role merged ideally
                const userObj = member.userId || member;
                const role = member.role;

                return (
                  <ListItem
                    key={userObj._id}
                    item={{ ...userObj, role }} // Merge role for display
                    type="user"
                    isOnline={onlineUsers.includes(userObj._id)}
                    isSelected={selectedUser?._id === userObj._id}
                    onClick={() => setSelectedUser(userObj, 'user')}
                    useAvatar={true}
                  />
                );
              })}
              {filteredMembers.length === 0 && (
                <div className="px-4 py-2 text-xs text-gray-600 italic">No other members</div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-gray-800 bg-[#0f0f0f]">
        <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
          <img src={authUser?.profilePic || "/avatar.png"} className="size-8 rounded-lg object-cover" alt="Me" />
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="font-medium text-gray-200 text-sm truncate">{authUser?.fullName}</div>
            <div className="text-[10px] text-gray-500 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              Online
            </div>
          </div>
          <button onClick={logout} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'requests' && <FriendRequestsModal key="requests" onClose={() => setActiveModal(null)} />}
        {activeModal === 'createGroup' && <CreateGroupModal key="createGroup" onClose={() => setActiveModal(null)} />}
        {activeModal === 'createProject' && <CreateProjectModal key="createProject" onClose={() => setActiveModal(null)} />}
        {activeModal === 'createChannel' && <CreateChannelModal key="createChannel" onClose={() => setActiveModal(null)} />}
        {activeModal === 'explore' && <ExploreChannelsModal key="explore" onClose={() => setActiveModal(null)} onCreate={() => setActiveModal('createChannel')} />}
      </AnimatePresence>
    </aside>
  );
};

// Reusable List Item
const ListItem = ({ item, type, icon: Icon, isSelected, isOnline, onClick, useAvatar }) => {
  return (
    <div
      onClick={onClick}
      className={`
                group flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-all
                ${isSelected ? "bg-indigo-500/10 text-indigo-300" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}
            `}
    >
      {useAvatar ? (
        <div className="relative shrink-0">
          <img src={item.profilePic || "/avatar.png"} alt={item.fullName} className="size-6 rounded-md object-cover" />
          {isOnline && <span className="absolute -bottom-0.5 -right-0.5 size-2 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />}
        </div>
      ) : (
        <Icon className={`size-4 shrink-0 ${isSelected ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-400"}`} />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate ${isSelected ? "font-medium" : "font-normal"}`}>
            {item.fullName || item.name}
          </span>
          {/* Unread badge/dot logic could go here */}
        </div>

        {/* Role or Recent Message snippet (Enterprise usually prefers Role, or snippet if active chat) */}
        {item.role && (
          <span className="text-[10px] text-gray-600 truncate capitalize">{item.role}</span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;


