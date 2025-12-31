import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { protectOrg } from "../middleware/org.middleware.js";
import { getCalendarEvents, createMeeting, getUserEvents } from "../controllers/calendar.controller.js";

const router = express.Router();

// Base: /api/calendar
router.get("/my-events", protectRoute, getUserEvents); // New Route
router.get("/:orgId/events", protectRoute, protectOrg, getCalendarEvents);
router.post("/:orgId/meetings", protectRoute, protectOrg, createMeeting);

export default router;
