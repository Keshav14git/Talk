import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [], // friends
  groups: [],
  friendRequests: [],
  selectedUser: null, // Can be a user object or group object
  selectedType: null, // "user" or "group"
  isUsersLoading: false,
  isMessagesLoading: false,
  isGroupsLoading: false,

  // Reply State
  replyMessage: null,
  setReplyMessage: (message) => set({ replyMessage: message }),

  // Search State
  messageSearchQuery: "",
  setMessageSearchQuery: (query) => set({ messageSearchQuery: query }),

  // UI State
  viewType: "chats", // "chats" | "groups" | "archived"
  isSidebarOpen: true, // Default open on desktop, should handle mobile separately if needed

  setViewType: (type) => set({ viewType: type }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/connections/friends");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch friends");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      toast.success("Group created successfully");
      set({ groups: [...get().groups, res.data] });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      return false;
    }
  },

  publicChannels: [],
  isJoiningGroup: false,

  getPublicChannels: async () => {
    try {
      const res = await axiosInstance.get("/groups/public");
      set({ publicChannels: res.data });
    } catch (error) {
      console.error("Failed to fetch public channels", error);
    }
  },

  joinGroup: async (groupId) => {
    set({ isJoiningGroup: true });
    try {
      const res = await axiosInstance.post(`/groups/join/${groupId}`);
      set(state => ({
        groups: [...state.groups, res.data],
        publicChannels: state.publicChannels.filter(c => c._id !== groupId)
      }));
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join group");
      return false;
    } finally {
      set({ isJoiningGroup: false });
    }
  },

  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/connections/requests");
      set({ friendRequests: res.data });
    } catch (error) {
      console.error("Failed to fetch friend requests", error);
    }
  },

  searchUsers: async (term) => {
    if (!term) return [];
    try {
      const res = await axiosInstance.get(`/connections/search?term=${term}`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to search users");
      return [];
    }
  },

  sendFriendRequest: async (friendId) => {
    try {
      await axiosInstance.post("/connections/request", { friendId });
      toast.success("Friend request sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  },

  acceptFriendRequest: async (friendId) => {
    try {
      await axiosInstance.post("/connections/accept", { friendId });
      toast.success("Friend request accepted");
      get().getFriendRequests();
      get().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  toggleArchive: async (connectionId) => {
    try {
      await axiosInstance.post("/connections/archive", { userId: connectionId }); // reusing param name but sending as userId
      toast.success("Archive status updated");
      // Refresh lists to reflect changes (moved in/out of archive)
      get().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update archive");
    }
  },

  getMessages: async (id, typeOverride) => {
    const { selectedType: storeType, selectedUser } = get();
    const type = typeOverride || storeType;

    set({ isMessagesLoading: true });
    try {
      let res;
      if (type === "group") {
        res = await axiosInstance.get(`/groups/${id}`);
      } else if (type === "channel") {
        res = await axiosInstance.get(`/channels/${id}/messages`);
      } else if (type === "project") {
        // For projects, we use the chatId embedded in the project object (which is usually selectedUser)
        // If typeOverride is passed (e.g. DM inside project), 'id' is the user ID.
        // Wait, if overrideUser is passed, 'id' is user ID. 'type' is 'user'.

        // This block handles `type === 'project'`. 
        // If we are in ProjectDashboard but want DM, we pass type='user'. This block won't run.

        const chatId = selectedUser?.chatId;
        if (!chatId) throw new Error("Project has no chat channel");
        res = await axiosInstance.get(`/channels/${chatId}/messages`);
      } else {
        res = await axiosInstance.get(`/messages/${id}`);
      }
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData, targetUserOverride, targetTypeOverride) => {
    const { selectedUser: storeUser, selectedType: storeType, messages, replyMessage } = get();

    // Resolve target
    const targetUser = targetUserOverride || storeUser;
    const targetType = targetTypeOverride || storeType;

    if (!targetUser) {
      toast.error("No conversation selected");
      return;
    }

    try {
      const payload = { ...messageData, replyTo: replyMessage?._id };
      let res;
      if (targetType === "group") {
        res = await axiosInstance.post(`/groups/send/${targetUser._id}`, payload);
      } else if (targetType === "channel") {
        res = await axiosInstance.post(`/channels/${targetUser._id}/send`, payload);
      } else if (targetType === "project") {
        const chatId = targetUser?.chatId;
        if (!chatId) throw new Error("Project has no chat channel");
        res = await axiosInstance.post(`/channels/${chatId}/send`, payload);
      } else {
        res = await axiosInstance.post(`/messages/send/${targetUser._id}`, payload);
      }

      const newMessage = res.data;
      set({ messages: [...messages, newMessage], replyMessage: null });

      // Update Sidebar List 
      // For Projects/Channels, we might want to update preview if we had one
      // but Sidebar currently reads from orgProjects/orgChannels which might not have 'lastMessage' 
      // wired up reactively yet. For now, we skip updating sidebar preview for projects.

      // Legacy user/group update
      set(state => {
        if (selectedType === "project" || selectedType === "channel") return {};

        const listKey = selectedType === "group" ? "groups" : "users";
        const list = [...state[listKey]];
        const index = list.findIndex(item => item._id === selectedUser._id);

        if (index !== -1) {
          const [item] = list.splice(index, 1);
          item.lastMessage = newMessage;
          list.unshift(item);
          return { [listKey]: list };
        }
        return {};
      });

    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to send message");
    }
  },

  markMessagesAsRead: async () => {
    const { selectedUser, selectedType, users, groups } = get();
    if (!selectedUser) return;

    try {
      await axiosInstance.put(`/messages/mark-read/${selectedUser._id}`, { type: selectedType });

      // Update local state to remove badge immediately
      if (selectedType === "group") {
        const updatedGroups = groups.map(g =>
          g._id === selectedUser._id ? { ...g, unreadCount: 0 } : g
        );
        set({ groups: updatedGroups });
      } else {
        const updatedUsers = users.map(u =>
          u._id === selectedUser._id ? { ...u, unreadCount: 0 } : u
        );
        set({ users: updatedUsers });
      }
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    // We want to subscribe globally, but we need current state inside the callback.
    // Zustand's get() inside the callback will be fresh.

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("newGroupMessage");

    const playNotificationSound = () => {
      try {
        // Simple soft beep
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(e => console.log("Audio play failed (interaction needed first?)", e));
      } catch (err) {
        console.error("Sound error", err);
      }
    };

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, selectedType } = get();
      const isChatOpen = selectedUser?._id === newMessage.senderId && selectedType !== "group";

      if (isChatOpen) {
        set({ messages: [...get().messages, newMessage] });
      }

      // Update User List (Sort & Unread)
      set(state => {
        const userIndex = state.users.findIndex(u => u._id === newMessage.senderId);
        if (userIndex === -1) return {}; // New user? Might need re-fetch, but for now ignore

        const updatedUsers = [...state.users];
        const [user] = updatedUsers.splice(userIndex, 1);

        user.lastMessage = newMessage;
        if (!isChatOpen) {
          user.unreadCount = (user.unreadCount || 0) + 1;
        } else {
          user.unreadCount = 0;
        }

        updatedUsers.unshift(user);
        return { users: updatedUsers };
      });
    });

    socket.on("newGroupMessage", (newMessage) => {
      const { selectedUser, selectedType } = get();
      const isGroupOpen = selectedUser?._id === newMessage.groupId && selectedType === "group";

      // Ignore own messages for notification logic usually, but for sorting we want it on top too? 
      // User says "most latest message to a chat will be on top". Yes, even my own should move it to top.
      // But socket usually sends only *incoming*. If I send, `sendMessage` handles it? `sendMessage` endpoint should return the message. 
      // We generally update list order on send too in `sendMessage` function? 

      const myId = useAuthStore.getState().authUser?._id;
      if (newMessage.senderId === myId) return; // Socket usually echoes back in some setups, assuming strict broadcast to others here based on previous code.

      if (isGroupOpen) {
        set({ messages: [...get().messages, newMessage] });
      }

      // Update Group List
      set(state => {
        const groupIndex = state.groups.findIndex(g => g._id === newMessage.groupId);
        if (groupIndex === -1) return {};

        const updatedGroups = [...state.groups];
        const [group] = updatedGroups.splice(groupIndex, 1);

        group.lastMessage = newMessage;
        if (!isGroupOpen) {
          group.unreadCount = (group.unreadCount || 0) + 1;
        } else {
          group.unreadCount = 0;
        }

        updatedGroups.unshift(group);
        return { groups: updatedGroups };
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("newGroupMessage");
  },

  deleteConversation: async (userIds) => {
    // Accepts single ID or array of IDs
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    set({ isUsersLoading: true });
    try {
      await Promise.all(ids.map(id => axiosInstance.delete(`/messages/conversation/${id}`)));

      // Optimistic update
      const { users, selectedUser } = get();

      // If the selected user is being deleted, deselect them
      if (selectedUser && ids.includes(selectedUser._id)) {
        set({ selectedUser: null, messages: [] });
      }

      // Ideally we might want to refetch users to update "last message" snippet if we had one
      toast.success("Conversation deleted");
      get().getUsers();

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete conversation");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  unfriendUser: async (friendId) => {
    try {
      await axiosInstance.delete("/connections/remove", { data: { friendId } });
      toast.success("Friend removed");

      // Update local state
      set(state => ({
        users: state.users.filter(u => u._id !== friendId),
        selectedUser: state.selectedUser?._id === friendId ? null : state.selectedUser,
        messages: state.selectedUser?._id === friendId ? [] : state.messages
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);

      const { messages, selectedUser, selectedType } = get();
      const updatedMessages = messages.filter(m => m._id !== messageId);

      // Optimistic update for chat view
      set({ messages: updatedMessages });

      // Update Sidebar Preview (last message sync)
      if (selectedUser) {
        set(state => {
          const listKey = selectedType === "group" ? "groups" : "users";
          const list = [...state[listKey]];
          const index = list.findIndex(item => item._id === selectedUser._id);

          if (index !== -1) {
            const item = { ...list[index] };
            // If the deleted message was the one showing in sidebar...
            if (item.lastMessage?._id === messageId) {
              // ...update it to the new last message (or null)
              item.lastMessage = updatedMessages.length > 0
                ? updatedMessages[updatedMessages.length - 1]
                : null;

              list[index] = item;
              return { [listKey]: list };
            }
          }
          return {};
        });
      }

      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  setSelectedUser: (selectedUser, type = "user") => set({ selectedUser, selectedType: type }),
}));
