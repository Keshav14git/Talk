import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup, getGroups, getGroupMessages, sendGroupMessage, getPublicChannels, joinGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/public", protectRoute, getPublicChannels); // Discovery
router.post("/join/:groupId", protectRoute, joinGroup); // Join
router.get("/:groupId", protectRoute, getGroupMessages);
router.post("/send/:groupId", protectRoute, sendGroupMessage);

export default router;
