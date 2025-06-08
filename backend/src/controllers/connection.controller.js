import Connection from '../models/connection.model.js';
import User from '../models/user.model.js';

export const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    // Prevent self-friend requests
    if (userId.toString() === friendId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if user exists
    const friendUser = await User.findById(friendId);
    if (!friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for existing connection
    const existingConnection = await Connection.findOne({
      $or: [
        { user: userId, friend: friendId },
        { user: friendId, friend: userId }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return res.status(400).json({ message: 'Already friends' });
      }
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Create new connection
    const newConnection = new Connection({
      user: userId,
      friend: friendId,
      status: 'pending'
    });

    await newConnection.save();

    res.status(201).json({ 
      message: 'Friend request sent', 
      connection: newConnection 
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ 
      message: 'Error sending friend request', 
      error: error.message 
    });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    const connection = await Connection.findOneAndUpdate(
      { user: friendId, friend: userId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    res.json({ 
      message: 'Friend request accepted', 
      connection 
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ 
      message: 'Error accepting friend request', 
      error: error.message 
    });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const pendingRequests = await Connection.find({ 
      friend: userId, 
      status: 'pending' 
    }).populate('user', 'fullName profilePic email');

    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ 
      message: 'Error fetching friend requests', 
      error: error.message 
    });
  }
};

export const getFriendsList = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({ 
      $or: [
        { user: userId, status: 'accepted' },
        { friend: userId, status: 'accepted' }
      ]
    }).populate('user friend', 'fullName profilePic email');

    // Transform connections to return friend details
    const friends = connections.map(conn => 
      conn.user._id.toString() === userId.toString() 
        ? conn.friend 
        : conn.user
    );

    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({ 
      message: 'Error fetching friends list', 
      error: error.message 
    });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    const result = await Connection.findOneAndDelete({
      $or: [
        { user: userId, friend: friendId, status: 'accepted' },
        { user: friendId, friend: userId, status: 'accepted' }
      ]
    });

    if (!result) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ 
      message: 'Error removing friend', 
      error: error.message 
    });
  }
};