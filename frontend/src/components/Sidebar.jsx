import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  Users, UserPlus, CirclePlus, MessageSquare, Archive,
  Search, Bell, Menu, ListChecks, Check, Hash, User, Compass, Lock,
  Settings, LogOut, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Link } from "react-router-dom";
import AddFriendModal from "./AddFriendModal";
import FriendRequestsModal from "./FriendRequestsModal";
import CreateGroupModal from "./CreateGroupModal";
import ExploreChannelsModal from "./ExploreChannelsModal";
import CreateChannelModal from "./CreateChannelModal";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const {
    getUsers, users,
    getGroups, groups,
    selectedUser, setSelectedUser,
    isUsersLoading,
    viewType, setViewType,
    friendRequests, getFriendRequests,
    unfriendUser, deleteConversation,
    isSidebarOpen, toggleSidebar, setSidebarOpen
  } = useChatStore();

  const { logout, onlineUsers, authUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    getUsers();
    getGroups();
    getFriendRequests();
  }, [getUsers, getGroups, getFriendRequests]);

  const filterList = (list) => {
    return list.filter(item => {
      const name = item.fullName || item.name;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const filteredUsers = filterList(users.filter(u => !u.isArchived));
  const filteredGroups = filterList(groups);
  const filteredArchived = filterList(users.filter(u => u.isArchived));

  const handleNavClick = (type) => {
    if (viewType === type && isSidebarOpen) {
      // Optional toggle logic if desired
    } else {
      setViewType(type);
      setSidebarOpen(true);
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full flex overflow-hidden bg-gray-800">
      {/* 1. Navigation Rail (Leftmost strip) - Condensed & Dark */}
      <div className="w-[64px] flex flex-col items-center py-3 bg-gray-900 border-r border-gray-700 h-full flex-shrink-0 z-20">
        {/* Top: Brand/Logo */}
        <div className="mb-4 flex justify-center cursor-pointer" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-base hover:bg-primary/20 transition-colors">
            T
          </div>
        </div>

        {/* Nav Items - Condensed Gaps */}
        <div className="flex-1 flex flex-col gap-1 w-full items-center px-1.5">
          <NavIcon
            imgSrc="/chat.png"
            isActive={viewType === "chats" && isSidebarOpen}
            onClick={() => handleNavClick("chats")}
            title="Chats"
          />
          <NavIcon
            imgSrc="/group.png"
            isActive={viewType === "groups" && isSidebarOpen}
            onClick={() => handleNavClick("groups")}
            title="Groups"
          />
          <NavIcon
            imgSrc="/channel.png"
            isActive={viewType === "channels" && isSidebarOpen}
            onClick={() => handleNavClick("channels")}
            title="Channels"
          />
          <div className="h-px w-6 bg-gray-700 my-1.5" />
          <NavIcon
            imgSrc="/unarchieve.png"
            isActive={viewType === "archived" && isSidebarOpen}
            onClick={() => handleNavClick("archived")}
            title="Archived"
          />
        </div>

        {/* Bottom: Settings & User - Condensed */}
        <div className="mt-auto flex flex-col gap-1 w-full items-center mb-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('requests')}
            className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors flex items-center justify-center"
            title="Friend Requests"
          >
            <img src="/bell.png" alt="Requests" className="size-6 object-contain opacity-60 hover:opacity-100 invert-0 brightness-200 transition-all" />
            {friendRequests.length > 0 && <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-gray-900" />}
          </motion.button>

          <Link to="/settings" title="Settings">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              <img src="/setting.png" alt="Settings" className="size-6 object-contain opacity-60 hover:opacity-100 invert-0 brightness-200 transition-all" />
            </motion.div>
          </Link>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="p-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-rgba(255,0,0,0.1) transition-colors flex items-center justify-center"
            title="Logout"
          >
            <img src="/logout.png" alt="Logout" className="size-6 object-contain opacity-60 hover:opacity-100 invert-0 brightness-200 transition-all" />
          </motion.button>

          {/* Mini Profile Av */}
          <Link to="/profile" className="mt-1">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-8 rounded-full object-cover ring-2 ring-gray-700 shadow-md bg-gray-700"
            />
          </Link>
        </div>
      </div>

      {/* 2. Side Panel (List) - Collapsible with Framer Motion */}
      <motion.div
        initial={false}
        animate={{
          width: isSidebarOpen ? 300 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col bg-gray-800 h-full border-r border-gray-700 overflow-hidden relative shadow-xl shadow-black/20 z-10"
      >
        <div className="w-[300px] flex flex-col h-full"> {/* Inner wrapper to prevent content squishing */}
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 shrink-0 border-b border-gray-700/50">
            <h2 className="text-gray-100 font-bold text-xl tracking-tight">
              {viewType === 'chats' && 'Messages'}
              {viewType === 'groups' && 'Groups'}
              {viewType === 'channels' && 'Channels'}
              {viewType === 'archived' && 'Archived'}
            </h2>

            <div className="flex gap-1 items-center">
              {/* Action Buttons */}
              <div className="flex gap-0.5">
                {viewType === 'channels' ? (
                  <>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal('createChannel')} className="p-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-primary rounded-lg transition-colors"><CirclePlus className="size-5" /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal('explore')} className="p-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-primary rounded-lg transition-colors"><Compass className="size-5" /></motion.button>
                  </>
                ) : viewType === 'groups' ? (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal('createGroup')} className="p-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-primary rounded-lg transition-colors"><CirclePlus className="size-5" /></motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal('addFriend')} className="p-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-primary rounded-lg transition-colors"><UserPlus className="size-5" /></motion.button>
                )}
              </div>

              {/* Collapse Button */}
              <button onClick={toggleSidebar} className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all ml-0.5">
                <ChevronsLeft className="size-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 pb-3 pt-3 shrink-0">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/50 text-gray-200 placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-gray-700/50 ring-0 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 focus:bg-gray-900 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5 custom-scrollbar">
            {viewType === "groups" && filteredGroups.filter(g => g.type !== 'channel').map((group) => (
              <ListItem
                key={group._id}
                user={{ ...group, fullName: group.name, profilePic: group.image }}
                icon={Lock}
                isSelected={selectedUser?._id === group._id}
                onClick={() => setSelectedUser(group, 'group')}
                unreadCount={group.unreadCount}
              />
            ))}

            {viewType === "channels" && (
              <>
                {filteredGroups.filter(g => g.type === 'channel').map((channel) => (
                  <ListItem
                    key={channel._id}
                    user={{ ...channel, fullName: channel.name, profilePic: channel.image }}
                    icon={Hash}
                    isSelected={selectedUser?._id === channel._id}
                    onClick={() => setSelectedUser(channel, 'channel')}
                    unreadCount={channel.unreadCount}
                  />
                ))}
                {filteredGroups.filter(g => g.type === 'channel').length === 0 && (
                  <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-800/50 rounded-2xl mt-4 mx-2 border border-gray-700/30">
                    <div className="size-10 bg-gray-700/50 rounded-full flex items-center justify-center text-gray-500 mb-2">
                      <Compass className="size-5" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium mb-1">No channels yet</p>
                    <button onClick={() => setActiveModal('explore')} className="text-[10px] text-primary font-semibold hover:underline">Explore Public Channels</button>
                  </div>
                )}
              </>
            )}

            {viewType === "chats" && filteredUsers.map((user) => (
              <ListItem
                key={user._id}
                user={user}
                icon={User}
                isSelected={selectedUser?._id === user._id}
                isOnline={onlineUsers.includes(user._id)}
                onClick={() => setSelectedUser(user, 'user')}
                useAvatar
                unreadCount={user.unreadCount}
              />
            ))}

            {viewType === "archived" && filteredArchived.map((user) => (
              <ListItem
                key={user._id}
                user={user}
                icon={Archive}
                isSelected={selectedUser?._id === user._id}
                onClick={() => setSelectedUser(user, 'user')}
                useAvatar
                unreadCount={user.unreadCount}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modals - AnimatePresence wrapper for smoother unmount if we wrap them properly later, 
         but individual modals can handle their own entry for now */}
      <AnimatePresence mode="wait">
        {activeModal === 'addFriend' && <AddFriendModal key="addFriend" onClose={() => setActiveModal(null)} />}
        {activeModal === 'requests' && <FriendRequestsModal key="requests" onClose={() => setActiveModal(null)} />}
        {activeModal === 'createGroup' && <CreateGroupModal key="createGroup" onClose={() => setActiveModal(null)} />}
        {activeModal === 'createChannel' && <CreateChannelModal key="createChannel" onClose={() => setActiveModal(null)} />}
        {activeModal === 'explore' && <ExploreChannelsModal key="explore" onClose={() => setActiveModal(null)} onCreate={() => setActiveModal('createChannel')} />}
      </AnimatePresence>
    </aside>
  );
};

// --- Sub Components ---

const NavIcon = ({ icon: Icon, imgSrc, isActive, onClick, title, unreadCount }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`relative p-2.5 rounded-xl transition-all duration-200 group flex items-center justify-center
            ${isActive
        ? "bg-primary/10 shadow-[0_0_15px_rgba(255,86,54,0.1)]"
        : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
      }
        `}
    title={title}
  >
    {imgSrc ? (
      <img
        src={imgSrc}
        alt={title}
        className={`size-6 object-contain transition-all invert brightness-0 ${isActive ? "invert brightness-0 filter-none opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" : "opacity-70 hover:opacity-100 invert brightness-0 hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"}`}
        style={{ filter: isActive ? 'invert(1) brightness(2)' : 'invert(1)' }}
      />
    ) : (
      <Icon className={`size-6 transition-all ${isActive ? "text-primary fill-primary/20" : ""}`} strokeWidth={isActive ? 2 : 1.5} />
    )}

    {/* Active Indicator - Left Bar */}
    {isActive && (
      <motion.div
        layoutId="activeNav"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(255,86,54,0.5)]"
      />
    )}

    {/* Unread Dot */}
    {unreadCount > 0 && (
      <div className="absolute top-1.5 right-1.5 size-2.5 bg-primary rounded-full border-2 border-gray-900 ring-1 ring-gray-900" />
    )}
    {/* Tooltip */}
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2.5 py-1.5 bg-gray-900/90 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-sm backdrop-blur-sm translate-x-[-5px] group-hover:translate-x-0">
      {title}
    </div>
  </motion.button>
);


const ListItem = ({ user, icon: Icon, isSelected, isOnline, onClick, useAvatar, unreadCount }) => {
  // Helper to format time (e.g., "10:16" or "Yesterday")
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return "Yesterday";
  };

  const isMe = user.lastMessage?.senderId === "me" || user.lastMessage?.senderId === useAuthStore.getState().authUser?._id;

  // Status Logic
  // 1. Sent (1 Gray Tick) -> User Offline
  // 2. Delivered (2 Gray Ticks) -> User Online
  // 3. Read (2 Blue Ticks) -> (Not implemented fully on backend yet, but if unreadCount is 0 for us, maybe different logic? For now stick to delivery status).
  // Actually, for *my* sent message, 'unreadCount' on *their* end matters, which I don't see.
  // So: Offline = Check (Gray), Online = ListChecks (Gray).

  const StatusIcon = isOnline ? ListChecks : Check;
  const statusColor = "text-gray-500"; // Default to gray (sent/delivered)

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group border border-transparent
          ${isSelected
          ? "bg-primary/10 border-primary/5 shadow-sm ring-1 ring-primary/20" // Dark mode selected: subtle orange glow
          : "hover:bg-gray-700/50 bg-transparent text-gray-400 hover:text-gray-200"
        }
      `}
    >
      {useAvatar ? (
        <div className="relative shrink-0">
          <img src={user.profilePic || "/avatar.png"} alt="" className="size-10 rounded-full object-cover bg-gray-700 ring-2 ring-transparent group-hover:ring-gray-600 transition-all" />
          {isOnline && <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-[2px] border-gray-800" />}
        </div>
      ) : (
        <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-200'}`}>
          <Icon className="size-5" />
        </div>
      )}

      <div className="flex-1 text-left min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex justify-between items-baseline">
          <span className={`text-[14px] font-medium truncate ${isSelected ? "text-gray-100 font-semibold" : "text-gray-300 group-hover:text-gray-100"}`}>
            {user.fullName}
          </span>
          {user.lastMessage?.createdAt && (
            <span className={`text-[10px] font-medium ${unreadCount > 0 ? "text-primary drop-shadow-[0_0_8px_rgba(255,86,54,0.4)]" : "text-gray-500 group-hover:text-gray-400"}`}>
              {formatTime(user.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-[12px] h-4">
          <div className="flex items-center gap-1.5 truncate max-w-[85%] text-gray-500 group-hover:text-gray-400 transition-colors">
            {isMe && (
              <span className="flex items-center shrink-0">
                <StatusIcon className={`size-3.5 ${statusColor}`} />
              </span>
            )}
            <span className="truncate leading-tight opacity-90">
              {isMe && "You: "}
              {user.lastMessage?.text || (useAvatar ? "Click to chat" : "View messages")}
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[9px] font-bold h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(255,86,54,0.5)]">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default Sidebar;

