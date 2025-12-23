import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus, CirclePlus, MessageSquare, Archive, Search, Bell, Menu, ListChecks, Hash, User } from "lucide-react";
import AddFriendModal from "./AddFriendModal";
import FriendRequestsModal from "./FriendRequestsModal";
import CreateGroupModal from "./CreateGroupModal";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const {
    getUsers, users,
    getGroups, groups,
    selectedUser, setSelectedUser,
    isUsersLoading,
    viewType, setViewType,
    isSidebarOpen, toggleSidebar,
    deleteConversation,
    friendRequests, getFriendRequests,
    unfriendUser
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
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

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    const confirmMessage = viewType === "chats"
      ? `Unfriend ${selectedIds.length} users?`
      : `Delete ${selectedIds.length} conversations?`;

    if (confirm(confirmMessage)) {
      if (viewType === "chats") {
        for (const id of selectedIds) {
          await unfriendUser(id);
        }
      } else {
        await deleteConversation(selectedIds);
      }
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className={`h-full flex flex-col transition-all duration-300 bg-gray-900 border-r border-gray-700 ${isSidebarOpen ? "w-64" : "w-16"}`}>
      {/* Workspace Header (Slack-style) */}
      <div className="h-12 min-h-[3rem] px-3 pl-4 flex items-center justify-between border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer text-slate-200">
        {isSidebarOpen ? (
          <h1 className="font-bold text-slate-100 tracking-tight truncate text-sm">Talk Project</h1>
        ) : (
          <div className="w-full flex justify-center">
            <span className="font-bold text-lg">T</span>
          </div>
        )}

        {isSidebarOpen && (
          <div className="flex items-center gap-1">
            <button onClick={() => setActiveModal('requests')} className="p-1 hover:bg-gray-700 rounded-md relative text-slate-400">
              <Bell className="size-3.5" />
              {friendRequests.length > 0 && <span className="absolute top-1 right-1 size-1.5 bg-red-500 rounded-full" />}
            </button>
          </div>
        )}
      </div>

      {/* Navigation / Sections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        {/* Top Actions */}
        <div className="px-2 mb-4 space-y-0.5">
          <SidebarItem
            icon={MessageSquare}
            label="Threads"
            isActive={viewType === "chats"}
            onClick={() => setViewType("chats")}
            isOpen={isSidebarOpen}
          />
          <SidebarItem
            icon={Hash}
            label="Channels"
            isActive={viewType === "groups"}
            onClick={() => setViewType("groups")}
            isOpen={isSidebarOpen}
          />
          <SidebarItem
            icon={Archive}
            label="Archived"
            isActive={viewType === "archived"}
            onClick={() => setViewType("archived")}
            isOpen={isSidebarOpen}
          />
        </div>

        {/* Section Header: Direct Messages / Channels */}
        {isSidebarOpen && (
          <div className="px-3 mb-1 flex items-center justify-between group text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider transition-colors">
              {viewType === 'groups' ? 'Channels' : 'Direct Messages'}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {viewType === 'groups' ? (
                <button onClick={() => setActiveModal('createGroup')} className="p-0.5 hover:bg-gray-700 rounded"><CirclePlus className="size-3" /></button>
              ) : (
                <button onClick={() => setActiveModal('addFriend')} className="p-0.5 hover:bg-gray-700 rounded"><UserPlus className="size-3" /></button>
              )}
            </div>
          </div>
        )}

        {/* User/Group List */}
        <div className="space-y-0.5 px-2">
          {/* Groups View */}
          {viewType === "groups" && filteredGroups.map((group, idx) => (
            <ListItem
              key={group._id}
              user={{ ...group, fullName: group.name, profilePic: group.image }}
              icon={Hash}
              isSelected={selectedUser?._id === group._id}
              isOpen={isSidebarOpen}
              onClick={() => setSelectedUser(group, 'group')}
            />
          ))}

          {/* Users View */}
          {viewType === "chats" && filteredUsers.map((user, idx) => (
            <ListItem
              key={user._id}
              user={user}
              icon={User}
              isSelected={selectedUser?._id === user._id}
              isOnline={onlineUsers.includes(user._id)}
              isOpen={isSidebarOpen}
              onClick={() => setSelectedUser(user, 'user')}
              useAvatar
            />
          ))}
          {viewType === "archived" && filteredArchived.map((user, idx) => (
            <ListItem
              key={user._id}
              user={user}
              icon={Archive}
              isSelected={selectedUser?._id === user._id}
              isOpen={isSidebarOpen}
              onClick={() => setSelectedUser(user, 'user')}
              useAvatar
            />
          ))}

        </div>
      </div>

      {/* Footer Toggle */}
      <div className="p-2 border-t border-gray-700">
        <button onClick={toggleSidebar} className="w-full flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded-md text-slate-400 transition-colors">
          <Menu className="size-4" />
          {isSidebarOpen && <span className="text-xs">Collapse</span>}
        </button>
      </div>

      {/* Modals */}
      {activeModal === 'addFriend' && <AddFriendModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'requests' && <FriendRequestsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'createGroup' && <CreateGroupModal onClose={() => setActiveModal(null)} />}
    </aside>
  );
};

// Sub-components for cleaner list rendering
const SidebarItem = ({ icon: Icon, label, isActive, onClick, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-2 py-1 rounded transition-colors ${isActive ? "bg-[#FF5636] text-white" : "text-slate-400 hover:bg-gray-800 hover:text-slate-200"
      } ${!isOpen && "justify-center"}`}
  >
    <Icon className="size-4 shrink-0" />
    {isOpen && <span className="text-[14px] truncate">{label}</span>}
  </button>
);

const ListItem = ({ user, icon: Icon, isSelected, isOpen, isOnline, onClick, useAvatar }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-2 py-1 rounded transition-colors group ${isSelected ? "bg-[#FF5636] text-white" : "text-slate-400 hover:bg-gray-800 hover:text-slate-200"
      } ${!isOpen && "justify-center"}`}
  >
    {useAvatar ? (
      <div className="relative shrink-0">
        <img src={user.profilePic || "/avatar.png"} alt="" className="size-4 rounded-[4px] object-cover bg-gray-700" />
        {isOnline && <span className="absolute -bottom-0.5 -right-0.5 size-1.5 bg-green-500 rounded-full border-2 border-gray-900" />}
      </div>
    ) : (
      <Icon className="size-4 shrink-0 opacity-70" />
    )}

    {isOpen && (
      <span className={`text-[14px] truncate ${isOnline && !isSelected ? "text-slate-300 font-medium opacity-100" : "opacity-90"}`}>
        {user.fullName}
      </span>
    )}
  </button>
)

export default Sidebar;