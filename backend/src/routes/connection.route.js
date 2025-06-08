import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getFriendsList,
  removeFriend
} from '../controllers/connection.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Send friend request
router.post('/request', protectRoute, sendFriendRequest);

// Accept friend request
router.post('/accept', protectRoute, acceptFriendRequest);

// Get friend requests
router.get('/requests', protectRoute, getFriendRequests);

// Get friends list
router.get('/friends', protectRoute, getFriendsList);

// Remove friend
router.delete('/remove', protectRoute, removeFriend);

export default router;