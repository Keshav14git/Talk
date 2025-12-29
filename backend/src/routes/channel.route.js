import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getChannelMessages, sendChannelMessage, createChannel, getOrgChannels } from "../controllers/channel.controller.js";

const router = express.Router();

router.get("/", protectRoute, getOrgChannels);
router.post("/create", protectRoute, createChannel);
router.get("/:channelId/messages", protectRoute, getChannelMessages);
router.post("/:channelId/send", protectRoute, sendChannelMessage);

export default router;
