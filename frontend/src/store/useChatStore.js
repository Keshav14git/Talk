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

  getMessages: async (id) => {
    const { selectedType } = get();
    set({ isMessagesLoading: true });
    try {
      let res;
      if (selectedType === "group") {
        res = await axiosInstance.get(`/groups/${id}`);
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

  sendMessage: async (messageData) => {
    const { selectedUser, selectedType, messages, replyMessage } = get();
    if (!selectedUser) {
      toast.error("No conversation selected");
      return;
    }

    try {
      const payload = { ...messageData, replyTo: replyMessage?._id };
      let res;
      if (selectedType === "group") {
        res = await axiosInstance.post(`/groups/send/${selectedUser._id}`, payload);
      } else {
        res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      }
      set({ messages: [...messages, res.data], replyMessage: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
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
      const currentSelectedUser = get().selectedUser;
      const currentViewType = get().selectedType;
      const isChatOpen = currentSelectedUser?._id === newMessage.senderId && currentViewType !== "group";

      if (isChatOpen) {
        set({ messages: [...get().messages, newMessage] });
      } else {
        // Increment unread count
        playNotificationSound();
        set(state => ({
          users: state.users.map(u =>
            u._id === newMessage.senderId ? { ...u, unreadCount: (u.unreadCount || 0) + 1 } : u
          )
        }));
        toast.success(`New message from ${newMessage.senderId}`); // Optional: Replace ID with name if possible (need lookup)
      }
    });

    socket.on("newGroupMessage", (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      const currentViewType = get().selectedType;
      const isGroupOpen = currentSelectedUser?._id === newMessage.groupId && currentViewType === "group";

      // Don't notify for own messages (if backend echoes them back?) usually socket excludes sender but be safe
      const myId = useAuthStore.getState().authUser?._id;
      if (newMessage.senderId === myId) return;

      if (isGroupOpen) {
        set({ messages: [...get().messages, newMessage] });
      } else {
        playNotificationSound();
        set(state => ({
          groups: state.groups.map(g =>
            g._id === newMessage.groupId ? { ...g, unreadCount: (g.unreadCount || 0) + 1 } : g
          )
        }));
      }
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
      // Optimistic update
      set({ messages: get().messages.filter(m => m._id !== messageId) });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  setSelectedUser: (selectedUser, type = "user") => set({ selectedUser, selectedType: type }),
}));
