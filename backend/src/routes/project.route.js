import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createProject, getOrgProjects, updateProjectStatus } from "../controllers/project.controller.js";
import { createTask, getProjectTasks, updateTaskStatus, addTaskComment } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createProject);
router.get("/", protectRoute, getOrgProjects);
router.patch("/:projectId/status", protectRoute, updateProjectStatus);

// Task Routes
router.post("/:projectId/tasks", protectRoute, createTask);
router.get("/:projectId/tasks", protectRoute, getProjectTasks);
router.patch("/tasks/:taskId/status", protectRoute, updateTaskStatus);
router.post("/tasks/:taskId/comments", protectRoute, addTaskComment);

export default router;
