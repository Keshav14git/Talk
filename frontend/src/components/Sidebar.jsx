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

  const { logout, onlineUsers } = useAuthStore();
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
    <aside className="h-full flex overflow-hidden">
      {/* 1. Navigation Rail (Leftmost strip) */}
      <div className="w-[70px] flex flex-col items-center py-4 bg-gray-50 border-r border-gray-100 h-full flex-shrink-0 z-20">
        {/* Top: Brand/Logo */}
        <div className="mb-6 flex justify-center cursor-pointer" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg">
            T
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-1.5 w-full items-center px-2">
          <NavIcon
            icon={MessageSquare}
            isActive={viewType === "chats" && isSidebarOpen}
            onClick={() => handleNavClick("chats")}
            title="Chats"
          />
          <NavIcon
            icon={Lock}
            isActive={viewType === "groups" && isSidebarOpen}
            onClick={() => handleNavClick("groups")}
            title="Groups"
          />
          <NavIcon
            icon={Hash}
            isActive={viewType === "channels" && isSidebarOpen}
            onClick={() => handleNavClick("channels")}
            title="Channels"
          />
          <div className="h-px w-8 bg-gray-200 my-2" />
          <NavIcon
            icon={Archive}
            isActive={viewType === "archived" && isSidebarOpen}
            onClick={() => handleNavClick("archived")}
            title="Archived"
          />
        </div>

        {/* Bottom: Settings & User */}
        <div className="mt-auto flex flex-col gap-2 w-full items-center mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('requests')}
            className="relative p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Friend Requests"
          >
            <Bell className="size-5" />
            {friendRequests.length > 0 && <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />}
          </motion.button>

          <Link to="/settings" title="Settings">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Settings className="size-5" />
            </motion.div>
          </Link>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="size-5" />
          </motion.button>

          {/* Mini Profile Av */}
          <Link to="/profile" className="mt-2">
            <div className="size-8 rounded-full bg-gradient-to-tr from-[#FF5636] to-orange-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-md">
              U
            </div>
          </Link>
        </div>
      </div>

      {/* 2. Side Panel (List) - Collapsible with Framer Motion */}
      <motion.div
        initial={false}
        animate={{
          width: isSidebarOpen ? 320 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col bg-white h-full border-r border-gray-100 overflow-hidden relative shadow-xl shadow-gray-200/50 z-10"
      >
        <div className="w-[320px] flex flex-col h-full"> {/* Inner wrapper to prevent content squishing */}
          {/* Header */}
          <div className="h-20 flex items-center justify-between px-6 shrink-0">
            <h2 className="text-gray-900 font-bold text-2xl tracking-tight">
              {viewType === 'chats' && 'Messages'}
              {viewType === 'groups' && 'Groups'}
              {viewType === 'channels' && 'Channels'}
              {viewType === 'archived' && 'Archived'}
            </h2>

            <div className="flex gap-2 items-center">
              {/* Action Buttons */}
              <div className="flex gap-1">
                {viewType === 'channels' ? (
                  <>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal('createChannel')} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-colors"><CirclePlus className="size-5" /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal('explore')} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-colors"><Compass className="size-5" /></motion.button>
                  </>
                ) : viewType === 'groups' ? (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal('createGroup')} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-colors"><CirclePlus className="size-5" /></motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal('addFriend')} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-colors"><UserPlus className="size-5" /></motion.button>
                )}
              </div>

              {/* Collapse Button */}
              <button onClick={toggleSidebar} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all ml-1">
                <ChevronsLeft className="size-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 pb-4 shrink-0">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 pl-10 pr-4 py-3 rounded-2xl text-sm border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 custom-scrollbar">
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
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-3xl mt-4 mx-2">
                    <div className="size-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                      <Compass className="size-6" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-1">No channels yet</p>
                    <button onClick={() => setActiveModal('explore')} className="text-xs text-primary font-semibold hover:underline">Explore Public Channels</button>
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

const NavIcon = ({ icon: Icon, isActive, onClick, title, unreadCount }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`relative p-3 rounded-xl transition-all duration-200 group
            ${isActive
        ? "text-primary bg-primary/5"
        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
      }
        `}
  >
    <Icon className={`size-6 transition-all ${isActive ? "fill-primary/20" : ""}`} strokeWidth={isActive ? 2 : 1.5} />

    {/* Active Indicator (WhatsApp style - subtle left accent or just color) */}
    {isActive && (
      <motion.div
        layoutId="activeNav"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
      />
    )}

    {/* Unread Dot */}
    {unreadCount > 0 && (
      <div className="absolute top-2 right-2 size-2.5 bg-primary rounded-full border-2 border-white ring-1 ring-white" />
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
  const statusColor = "text-gray-400"; // Default to gray (sent/delivered)

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-200 group border border-transparent
          ${isSelected
          ? "bg-gray-100 text-gray-900 shadow-sm ring-1 ring-gray-200"
          : "hover:bg-gray-50 bg-transparent text-gray-600 hover:text-gray-900"
        }
      `}
    >
      {useAvatar ? (
        <div className="relative shrink-0">
          <img src={user.profilePic || "/avatar.png"} alt="" className="size-10 rounded-full object-cover bg-gray-200 ring-2 ring-white" />
          {isOnline && <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-[2px] border-white" />}
        </div>
      ) : (
        <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-white text-primary ring-1 ring-gray-200' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
          <Icon className="size-5" />
        </div>
      )}

      <div className="flex-1 text-left min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex justify-between items-baseline">
          <span className={`text-[14px] font-bold truncate ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
            {user.fullName}
          </span>
          {user.lastMessage?.createdAt && (
            <span className={`text-[10px] font-medium ${unreadCount > 0 ? "text-primary" : "text-gray-400"}`}>
              {formatTime(user.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-[12px] h-4">
          <div className="flex items-center gap-1.5 truncate max-w-[85%] text-gray-500 group-hover:text-gray-600 transition-colors">
            {isMe && (
              <span className="flex items-center shrink-0">
                <StatusIcon className={`size-3.5 ${statusColor}`} />
              </span>
            )}
            <span className="truncate leading-tight">
              {isMe && "You: "}
              {user.lastMessage?.text || (useAvatar ? "Click to chat" : "View messages")}
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[9px] font-bold h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default Sidebar;

