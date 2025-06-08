import { create } from 'zustand';
import { connectionService } from '../lib/connection';

const useConnectionStore = create((set, get) => ({
  friends: [],
  friendRequests: [],

  fetchFriends: async () => {
    try {
      const friends = await connectionService.getFriendsList();
      set({ friends });
    } catch (error) {
      console.error('Failed to fetch friends', error);
    }
  },

  fetchFriendRequests: async () => {
    try {
      const friendRequests = await connectionService.getFriendRequests();
      set({ friendRequests });
    } catch (error) {
      console.error('Failed to fetch friend requests', error);
    }
  },

  sendFriendRequest: async (friendId) => {
    try {
      await connectionService.sendFriendRequest(friendId);
      // Optionally, you can add logic to update local state
    } catch (error) {
      console.error('Failed to send friend request', error);
      throw error;
    }
  },

  acceptFriendRequest: async (friendId) => {
    try {
      await connectionService.acceptFriendRequest(friendId);
      // Remove from friend requests and add to friends
      const currentRequests = get().friendRequests;
      const updatedRequests = currentRequests.filter(req => 
        req.user._id !== friendId
      );
      
      set({ 
        friendRequests: updatedRequests 
      });

      // Refetch friends to ensure updated list
      await get().fetchFriends();
    } catch (error) {
      console.error('Failed to accept friend request', error);
      throw error;
    }
  },

  removeFriend: async (friendId) => {
    try {
      await connectionService.removeFriend(friendId);
      // Remove friend from local state
      const currentFriends = get().friends;
      const updatedFriends = currentFriends.filter(friend => 
        friend._id !== friendId
      );
      
      set({ friends: updatedFriends });
    } catch (error) {
      console.error('Failed to remove friend', error);
      throw error;
    }
  }
}));

export default useConnectionStore;