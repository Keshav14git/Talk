import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createProject, getOrgProjects, updateProjectStatus } from "../controllers/project.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createProject);
router.get("/", protectRoute, getOrgProjects);
router.patch("/:projectId/status", protectRoute, updateProjectStatus);

export default router;
