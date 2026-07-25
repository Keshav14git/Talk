import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createOrganization, joinOrganization, getOrganizationData, getMyOrganizations, setManager, getMyTeam } from "../controllers/organization.controller.js";
import approvalRoutes from "./approval.route.js";

const router = express.Router();

router.use("/:orgId/approvals", approvalRoutes);

router.post("/create", protectRoute, createOrganization);
router.post("/join", protectRoute, joinOrganization);
router.get("/data", protectRoute, getOrganizationData);
router.get("/my-orgs", protectRoute, getMyOrganizations);
router.post("/:orgId/set-manager", protectRoute, setManager);
router.get("/:orgId/team", protectRoute, getMyTeam);

export default router;
