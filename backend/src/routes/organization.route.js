import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createOrganization, getMyOrganizations, getOrganizationDetails } from "../controllers/organization.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createOrganization);
router.get("/my-orgs", protectRoute, getMyOrganizations);
router.get("/:orgId", protectRoute, getOrganizationDetails);

export default router;
