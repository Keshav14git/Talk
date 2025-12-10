import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus, CirclePlus, MessageSquare, Archive, Search, Bell, Menu, Settings, ListChecks } from "lucide-react";
import AddFriendModal from "./AddFriendModal";
import FriendRequestsModal from "./FriendRequestsModal";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const {
    getUsers, users,
    getGroups, groups,
    selectedUser, setSelectedUser,
    isUsersLoading,
    viewType, setViewType,
    selectedType,
    isSidebarOpen, toggleSidebar,
    deleteConversation, // Import delete action
    friendRequests, getFriendRequests,
    unfriendUser
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
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
        // For users, we unfriend
        for (const id of selectedIds) {
          await unfriendUser(id);
        }
      } else {
        // For groups/others, we delete conversation (leave group?)
        await deleteConversation(selectedIds);
      }
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full flex flex-col bg-base-100 transition-all duration-300 w-full">
      {/* Header - Instagram/Messenger Style */}
      <div className="p-4 border-b border-base-200">
        <div className="flex items-center justify-between mb-4 px-1">
          {isSidebarOpen ? (
            <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
          ) : (
            <div className="w-full flex justify-center">
              <div className="size-10 btn btn-ghost btn-circle flex items-center justify-center p-0">
                <MessageSquare className="size-5 text-primary" />
              </div>
            </div>
          )}

          {isSidebarOpen && (
            <div className="flex gap-2">
              {isSelectionMode ? (
                <button onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }} className="btn btn-xs btn-ghost text-error">Cancel</button>
              ) : (
                <>
                  <button onClick={() => setIsSelectionMode(true)} className="btn btn-circle btn-sm btn-ghost" title="Select Chats">
                    <ListChecks className="size-5" />
                  </button>
                  <button onClick={() => setActiveModal('requests')} className="btn btn-circle btn-sm btn-ghost relative">
                    <Bell className="size-5" />
                    {friendRequests.length > 0 && <span className="absolute top-0 right-0 size-2.5 bg-error rounded-full ring-2 ring-base-100" />}
                  </button>
                  <button onClick={() => setActiveModal('addFriend')} className="btn btn-circle btn-sm btn-ghost">
                    <UserPlus className="size-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Delete Action Bar */}
        {isSelectionMode && selectedIds.length > 0 && (
          <div className="mb-2 animate-fade-in">
            <button onClick={handleDeleteSelected} className="btn btn-error btn-sm w-full text-white">
              {viewType === "chats" ? "Unfriend" : "Delete"} ({selectedIds.length})
            </button>
          </div>
        )}

        {/* Search Bar - Only visible when open */}
        {isSidebarOpen && !isSelectionMode && (
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search"
              className="input input-sm h-10 w-full pl-9 rounded-full bg-base-200 border-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-base-content/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Navigation Tabs - Icons only when closed */}
      <div className={`flex px-2 ${isSidebarOpen ? "gap-2" : "flex-col gap-4 mt-2 justify-center"}`}>
        {[
          { id: "chats", label: "Inbox", icon: MessageSquare },
          { id: "groups", label: "Groups", icon: Users },
          { id: "archived", label: "Archive", icon: Archive }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewType(tab.id)}
            className={`
                        btn btn-sm border-none shadow-none rounded-full flex items-center justify-center
                        ${viewType === tab.id ? "bg-primary/10 text-primary" : "bg-transparent hover:bg-base-200 text-base-content/60"}
                        ${!isSidebarOpen ? "size-10 p-0" : ""} 
                    `}
            title={tab.label}
          >
            <tab.icon className={isSidebarOpen ? "size-4 mr-2" : "size-5"} />
            {isSidebarOpen && tab.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto mt-2 px-2 scrollbar-hide space-y-1">
        {viewType === "chats" && filteredUsers.map(user => (
          <UserItem
            key={user._id}
            user={user}
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
              <button onClick={() => setActiveModal('createGroup')} className="w-full flex items-center gap-3 p-3 text-primary hover:bg-base-200 rounded-xl transition-colors mb-1">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CirclePlus className="size-6" />
                </div>
                <span className="font-semibold">Create New Group</span>
              </button>
            )}
            {filteredGroups.map(group => (
              <UserItem
                key={group._id}
                user={{ ...group, fullName: group.name, profilePic: group.image }}
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

        {viewType === "archived" && filteredArchived.map(user => (
          <UserItem
            key={user._id}
            user={user}
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

      {/* Footer/Profile - Optional but good for pro apps */}
      <div className="p-3 border-t border-base-content/5 mt-auto">
        <button onClick={toggleSidebar} className="btn btn-ghost btn-circle btn-sm w-full h-auto py-2 flex items-center justify-center gap-2 hover:bg-base-200 rounded-xl">
          <Menu className="size-5" />
          {isSidebarOpen && <span className="text-sm font-medium">More</span>}
        </button>
      </div>

      {/* Modals */}
      {activeModal === 'addFriend' && <AddFriendModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'requests' && <FriendRequestsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'createGroup' && <CreateGroupModal onClose={() => setActiveModal(null)} />}
    </aside>
  );
};

const UserItem = ({ user, isSelected, isOnline, isOpen, onClick, isGroup, isArchived, isSelectionMode, isChecked }) => {
  return (
    <button
      onClick={onClick}
      className={`
                w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group
                ${isSelected && !isSelectionMode ? "bg-base-200" : "hover:bg-base-200/50"}
                ${!isOpen && "justify-center"}
            `}
    >
      <div className="relative flex-shrink-0">
        {isSelectionMode && isOpen ? (
          <div className={`size-10 rounded-full border-2 flex items-center justify-center ${isChecked ? "bg-primary border-primary" : "border-base-content/20"}`}>
            {isChecked && <div className="size-3 bg-white rounded-full" />}
          </div>
        ) : (
          <>
            <img
              src={user.profilePic || "/avatar.png"}
              alt={user.fullName}
              className={`object-cover rounded-full bg-base-300 ring-2 ring-transparent group-hover:ring-base-100 transition-all size-10`}
            />
            {!isGroup && isOnline && (
              <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full ring-2 ring-base-100" />
            )}
          </>
        )}
      </div>

      {isOpen && (
        <div className="flex-1 text-left min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className={`font-semibold text-sm truncate ${isSelected ? "text-base-content" : "text-base-content"}`}>
              {user.fullName}
            </h3>
            {/* Placeholder Time - In real app, pass last message time */}
            {!isSelectionMode && <span className="text-[11px] text-base-content/40 font-medium">10:42 PM</span>}
          </div>
          <div className="flex items-center gap-1">
            <p className={`text-xs truncate ${isSelected ? "text-base-content/70" : "text-base-content/50"}`}>
              {isGroup ? `${user.members?.length} members` : isArchived ? "Archived" : isSelectionMode ? "Tap to select" : "Click to chat"}
            </p>
          </div>
        </div>
      )}
    </button>
  );
};

export default Sidebar;