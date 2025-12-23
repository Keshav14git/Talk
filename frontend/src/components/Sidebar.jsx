import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  Users, UserPlus, CirclePlus, MessageSquare, Archive,
  Search, Bell, Menu, ListChecks, Hash, User, Compass, Lock,
  Settings, LogOut, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Link } from "react-router-dom";
import AddFriendModal from "./AddFriendModal";
import FriendRequestsModal from "./FriendRequestsModal";
import CreateGroupModal from "./CreateGroupModal";
import ExploreChannelsModal from "./ExploreChannelsModal";
import CreateChannelModal from "./CreateChannelModal";

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
      // If already active and open, close it (optional behavior, or just stay open? Let's stay open unless toggled)
      // Maybe no op.
    } else {
      setViewType(type);
      setSidebarOpen(true);
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full flex transition-all duration-300 bg-gray-900 border-r border-gray-800">
      {/* 1. Navigation Rail (Leftmost strip) */}
      <div className="w-16 flex flex-col items-center py-4 bg-gray-950 border-r border-gray-800 h-full flex-shrink-0 z-20">
        {/* Top: Brand/Logo */}
        <div className="mb-6 flex justify-center cursor-pointer" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <span className="font-bold text-xl text-white tracking-tight">T</span>
        </div>

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-4 w-full items-center">
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
          <div className="h-px w-8 bg-gray-800 my-1" />
          <NavIcon
            icon={Archive}
            isActive={viewType === "archived" && isSidebarOpen}
            onClick={() => handleNavClick("archived")}
            title="Archived"
          />
        </div>

        {/* Bottom: Settings & User */}
        <div className="mt-auto flex flex-col gap-4 w-full items-center">
          <button onClick={() => setActiveModal('requests')} className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all" title="Friend Requests">
            <Bell className="size-5" />
            {friendRequests.length > 0 && <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-gray-950" />}
          </button>

          <Link to="/settings" className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all" title="Settings">
            <Settings className="size-5" />
          </Link>

          <button onClick={logout} className="p-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Logout">
            <LogOut className="size-5" />
          </button>

          {/* Mini Profile Av */}
          <Link to="/profile" className="mt-2 text-gray-400 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-full bg-gradient-to-tr from-[#FF5636] to-orange-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-gray-900">
              U
            </div>
          </Link>
        </div>
      </div>

      {/* 2. Side Panel (List) - Collapsible */}
      <div className={`flex flex-col bg-gray-900 h-full border-r border-gray-800 transition-all duration-300 ease-in-out relative
                ${isSidebarOpen ? "w-72 translate-x-0 opacity-100" : "w-0 -translate-x-4 opacity-0 overflow-hidden border-none text-[0px]"}
            `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 min-w-[18rem]">
          <h2 className="text-white font-semibold text-lg tracking-tight whitespace-nowrap">
            {viewType === 'chats' && 'Chats'}
            {viewType === 'groups' && 'Groups'}
            {viewType === 'channels' && 'Channels'}
            {viewType === 'archived' && 'Archived'}
          </h2>

          <div className="flex gap-1 items-center">
            {/* Action Buttons */}
            <div className="flex gap-1 mr-2">
              {viewType === 'channels' ? (
                <>
                  <button onClick={() => setActiveModal('createChannel')} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all"><CirclePlus className="size-4" /></button>
                  <button onClick={() => setActiveModal('explore')} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all"><Compass className="size-4" /></button>
                </>
              ) : viewType === 'groups' ? (
                <button onClick={() => setActiveModal('createGroup')} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all"><CirclePlus className="size-4" /></button>
              ) : (
                <button onClick={() => setActiveModal('addFriend')} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all"><UserPlus className="size-4" /></button>
              )}
            </div>

            {/* Collapse Button */}
            <button onClick={toggleSidebar} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-all">
              <ChevronsLeft className="size-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 min-w-[18rem]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 text-gray-300 placeholder-gray-600 pl-9 pr-4 py-2 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-700 transition-all"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1 min-w-[18rem]">
          {viewType === "groups" && filteredGroups.filter(g => g.type !== 'channel').map((group) => (
            <ListItem
              key={group._id}
              user={{ ...group, fullName: group.name, profilePic: group.image }}
              icon={Lock}
              isSelected={selectedUser?._id === group._id}
              onClick={() => setSelectedUser(group, 'group')}
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
                />
              ))}
              {filteredGroups.filter(g => g.type === 'channel').length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-500 mb-3">No channels joined</p>
                  <button onClick={() => setActiveModal('explore')} className="text-xs text-[#FF5636] hover:underline">Explore Channels</button>
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
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'addFriend' && <AddFriendModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'requests' && <FriendRequestsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'createGroup' && <CreateGroupModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'createChannel' && <CreateChannelModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'explore' && <ExploreChannelsModal onClose={() => setActiveModal(null)} onCreate={() => setActiveModal('createChannel')} />}
    </aside>
  );
};

// --- Sub Components ---

const NavIcon = ({ icon: Icon, isActive, onClick, title, unreadCount }) => (
  <button
    onClick={onClick}
    title={title}
    className={`relative p-3 rounded-2xl transition-all duration-200 group
            ${isActive
        ? "bg-[#FF5636] text-white shadow-lg shadow-orange-500/20"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
      }
        `}
  >
    <Icon className="size-6" strokeWidth={1.5} />

    {/* Unread Dot */}
    {unreadCount > 0 && (
      <div className="absolute top-2 right-2 size-2.5 bg-green-500 rounded-full border-2 border-gray-950 animate-pulse" />
    )}

    {/* Tooltip */}
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-gray-800">
      {title}
    </div>
  </button>
);


const ListItem = ({ user, icon: Icon, isSelected, isOnline, onClick, useAvatar, unreadCount }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group border border-transparent
        ${isSelected
        ? "bg-gray-800 text-white border-gray-700 shadow-sm"
        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
      }
    `}
  >
    {useAvatar ? (
      <div className="relative shrink-0">
        <img src={user.profilePic || "/avatar.png"} alt="" className="size-12 rounded-full object-cover bg-gray-800 ring-2 ring-gray-950" />
        {isOnline && <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-gray-900" />}
      </div>
    ) : (
      <div className={`size-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300'}`}>
        <Icon className="size-6" />
      </div>
    )}

    <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
      <div className="flex justify-between items-center mb-0.5">
        <span className={`text-[15px] font-semibold truncate heading-font ${isSelected || isOnline ? "text-gray-100" : "text-gray-300"}`}>
          {user.fullName}
        </span>
        {/* Optional: Time could go here if available */}
      </div>

      <div className="flex justify-between items-center text-[13px] text-gray-500 h-5">
        <span className="truncate max-w-[85%] pr-2">
          {user.lastMessage?.text || (useAvatar ? "Click to chat" : "View messages")}
        </span>

        {/* Unread Badge - Bottom Right */}
        {unreadCount > 0 && (
          <span className="bg-[#25D366] text-white text-[10px] font-bold h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center rounded-full shadow-sm">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  </button>
)

export default Sidebar;