import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage, markMessagesAsRead, deleteConversation, deleteMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar)
router.get("/:id", protectRoute, getMessages)
router.post("/send/:id", protectRoute, sendMessage)
router.delete("/conversation/:id", protectRoute, deleteConversation);
router.delete("/:id", protectRoute, deleteMessage); // Delete single message

export default router;