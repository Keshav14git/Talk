import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus, CirclePlus, MessageSquare, Archive, Search, Bell, Menu, ListChecks } from "lucide-react";
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
    <aside className="h-full flex flex-col w-full transition-all duration-300">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2 px-1">
          {isSidebarOpen ? (
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              Chats
            </motion.h1>
          ) : (
            <div className="w-full flex justify-center">
              <div className="size-10 flex items-center justify-center">
                <MessageSquare className="size-6 text-primary" />
              </div>
            </div>
          )}

          {isSidebarOpen && (
            <div className="flex gap-1">
              {isSelectionMode ? (
                <button onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }} className="btn btn-xs btn-ghost text-error">Cancel</button>
              ) : (
                <>
                  <button onClick={() => setIsSelectionMode(true)} className="btn btn-circle btn-sm btn-ghost hover:bg-white/20" title="Select Chats">
                    <ListChecks className="size-5 text-base-content/70" />
                  </button>
                  <button onClick={() => setActiveModal('requests')} className="btn btn-circle btn-sm btn-ghost relative hover:bg-white/20">
                    <Bell className="size-5 text-base-content/70" />
                    {friendRequests.length > 0 && <span className="absolute top-1 right-1 size-2.5 bg-error rounded-full ring-2 ring-white" />}
                  </button>
                  <button onClick={() => setActiveModal('addFriend')} className="btn btn-circle btn-sm btn-ghost hover:bg-white/20">
                    <UserPlus className="size-5 text-base-content/70" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Delete Action Bar */}
        <AnimatePresence>
          {isSelectionMode && selectedIds.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-2 overflow-hidden"
            >
              <button onClick={handleDeleteSelected} className="btn btn-error btn-sm w-full text-white shadow-lg shadow-error/30">
                {viewType === "chats" ? "Unfriend" : "Delete"} ({selectedIds.length})
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        {isSidebarOpen && !isSelectionMode && (
          <div className="relative mb-2 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input input-sm h-10 w-full pl-10 rounded-2xl bg-white/40 border-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-base-content/40 backdrop-blur-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className={`flex px-4 ${isSidebarOpen ? "gap-2" : "flex-col gap-4 mt-2 justify-center px-2"}`}>
        {[
          { id: "chats", label: "Inbox", icon: MessageSquare },
          { id: "groups", label: "Groups", icon: Users },
          { id: "archived", label: "Archive", icon: Archive }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewType(tab.id)}
            className={`
                btn btn-sm border-none shadow-none rounded-xl flex items-center justify-center transition-all duration-300
                ${viewType === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                : "bg-transparent hover:bg-white/20 text-base-content/60"}
                ${!isSidebarOpen ? "size-10 p-0 rounded-full" : "flex-1"} 
            `}
            title={tab.label}
          >
            <tab.icon className={isSidebarOpen ? "size-4 mr-2" : "size-5"} />
            {isSidebarOpen && tab.label}
          </button>
        ))}
      </div>


      {/* Content List */}
      <div className="flex-1 overflow-y-auto mt-4 px-3 space-y-1 pb-4 scrollbar-hide">
        {viewType === "chats" && filteredUsers.map((user, idx) => (
          <UserItem
            key={user._id}
            user={user}
            index={idx}
            isSelected={selectedUser?._id === user._id}
            isOnline={onlineUsers.includes(user._id)}
            isOpen={isSidebarOpen}
            onClick={() => {
              if (isSelectionMode) toggleSelection(user._id);
              else setSelectedUser(user, 'user');
            }}
            isSelectionMode={isSelectionMode}
            isChecked={selectedIds.includes(user._id)}
          />
        ))}

        {viewType === "groups" && (
          <>
            {isSidebarOpen && !isSelectionMode && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal('createGroup')}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 rounded-2xl transition-all mb-3 border border-primary/10"
              >
                <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <CirclePlus className="size-6 text-primary" />
                </div>
                <span className="font-semibold text-primary/80">Create Group</span>
              </motion.button>
            )}
            {filteredGroups.map((group, idx) => (
              <UserItem
                key={group._id}
                user={{ ...group, fullName: group.name, profilePic: group.image }}
                index={idx}
                isSelected={selectedUser?._id === group._id}
                isOpen={isSidebarOpen}
                isGroup
                onClick={() => {
                  if (isSelectionMode) toggleSelection(group._id);
                  else setSelectedUser(group, 'group');
                }}
                isSelectionMode={isSelectionMode}
                isChecked={selectedIds.includes(group._id)}
              />
            ))}
          </>
        )}

        {viewType === "archived" && filteredArchived.map((user, idx) => (
          <UserItem
            key={user._id}
            user={user}
            index={idx}
            isSelected={selectedUser?._id === user._id}
            isOnline={onlineUsers.includes(user._id)}
            isOpen={isSidebarOpen}
            onClick={() => {
              if (isSelectionMode) toggleSelection(user._id);
              else setSelectedUser(user, 'user');
            }}
            isArchived
            isSelectionMode={isSelectionMode}
            isChecked={selectedIds.includes(user._id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 mt-auto">
        <button onClick={toggleSidebar} className="btn btn-ghost btn-circle btn-sm w-full h-auto py-2 flex items-center justify-center gap-2 hover:bg-white/20 rounded-xl transition-all group">
          <Menu className="size-5 text-base-content/60 group-hover:text-primary transition-colors" />
          {isSidebarOpen && <span className="text-sm font-medium text-base-content/60 group-hover:text-primary">Collapse</span>}
        </button>
      </div>

      {/* Modals */}
      {activeModal === 'addFriend' && <AddFriendModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'requests' && <FriendRequestsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'createGroup' && <CreateGroupModal onClose={() => setActiveModal(null)} />}
    </aside>
  );
};

const UserItem = ({ user, index, isSelected, isOnline, isOpen, onClick, isGroup, isArchived, isSelectionMode, isChecked }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
                w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group relative
                ${isSelected && !isSelectionMode ? "bg-white/60 shadow-md ring-1 ring-white/50" : "hover:bg-white/30"}
                ${!isOpen && "justify-center px-0"}
            `}
    >
      <div className="relative flex-shrink-0">
        {isSelectionMode && isOpen ? (
          <div className={`size-12 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked ? "bg-primary border-primary" : "border-base-content/20 bg-white/50"}`}>
            {isChecked && <div className="size-4 bg-white rounded-full shadow-sm" />}
          </div>
        ) : (
          <div className="relative">
            <img
              src={user.profilePic || "/avatar.png"}
              alt={user.fullName}
              className={`object-cover rounded-full bg-base-200 ring-2 ring-white shadow-sm transition-all size-12
                ${isSelected ? "ring-primary/50" : "group-hover:ring-primary/30"}
              `}
            />
            {!isGroup && isOnline && (
              <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full ring-2 ring-white shadow-sm" />
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="flex-1 text-left min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className={`font-semibold text-sm truncate ${isSelected ? "text-primary" : "text-base-content"}`}>
              {user.fullName}
            </h3>
            {!isSelectionMode && <span className="text-[10px] text-base-content/40 font-medium">10:42 PM</span>}
          </div>
          <div className="flex items-center gap-1">
            <p className={`text-xs truncate ${isSelected ? "text-primary/70" : "text-base-content/50"}`}>
              {isGroup ? `${user.members?.length} members` : isArchived ? "Archived" : isSelectionMode ? "Tap to select" : "Click to chat"}
            </p>
          </div>
        </div>
      )}
    </motion.button>
  );
};

export default Sidebar;