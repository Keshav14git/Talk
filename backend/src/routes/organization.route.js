import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createOrganization, joinOrganization, getOrganizationData, getMyOrganizations } from "../controllers/organization.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createOrganization);
router.post("/join", protectRoute, joinOrganization);
router.get("/data", protectRoute, getOrganizationData);
router.get("/my-orgs", protectRoute, getMyOrganizations);

export default router;
