import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup, getGroups, getGroupMessages, sendGroupMessage } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/:groupId", protectRoute, getGroupMessages);
router.post("/send/:groupId", protectRoute, sendGroupMessage);

export default router;
