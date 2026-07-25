import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createRequest, getInbox, getSent, updateStatus, deleteRequest, getHistory, getLeaveBalance } from "../controllers/approval.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", protectRoute, createRequest);
router.get("/inbox", protectRoute, getInbox);
router.get("/sent", protectRoute, getSent);
router.put("/:requestId", protectRoute, updateStatus);
router.delete("/:requestId", protectRoute, deleteRequest);
router.get("/history", protectRoute, getHistory);
router.get("/leave-balance", protectRoute, getLeaveBalance);

export default router;
