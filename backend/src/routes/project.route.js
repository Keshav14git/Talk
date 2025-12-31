import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createProject, getOrgProjects, updateProjectStatus, addProjectMember } from "../controllers/project.controller.js";
import { createTask, getProjectTasks, updateTaskStatus, addTaskComment, deleteTaskComments } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createProject);
router.get("/", protectRoute, getOrgProjects);
router.patch("/:projectId/status", protectRoute, updateProjectStatus);

// Task Routes
router.post("/:projectId/tasks", protectRoute, createTask);
router.get("/:projectId/tasks", protectRoute, getProjectTasks);
router.patch("/tasks/:taskId/status", protectRoute, updateTaskStatus);
router.post("/tasks/:taskId/comments", protectRoute, addTaskComment);
router.delete("/tasks/:taskId/comments", protectRoute, deleteTaskComments);

// Member Routes
router.post("/:projectId/members", protectRoute, addProjectMember);

export default router;
