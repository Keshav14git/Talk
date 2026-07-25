import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createProject, getOrgProjects, updateProjectStatus, addProjectMember, deleteProject, updateMemberRole } from "../controllers/project.controller.js";
import { createTask, getProjectTasks, updateTaskStatus, addTaskComment, deleteTaskComments, getUserTasks, deleteTask } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createProject);
router.get("/", protectRoute, getOrgProjects);
router.patch("/:projectId/status", protectRoute, updateProjectStatus);
router.delete("/:projectId", protectRoute, deleteProject);

// Task Routes
router.get("/tasks/me", protectRoute, getUserTasks); // New Route
router.post("/:projectId/tasks", protectRoute, createTask);
router.get("/:projectId/tasks", protectRoute, getProjectTasks);
router.patch("/tasks/:taskId/status", protectRoute, updateTaskStatus);
router.post("/tasks/:taskId/comments", protectRoute, addTaskComment);
router.delete("/tasks/:taskId/comments", protectRoute, deleteTaskComments);
router.delete("/tasks/:taskId", protectRoute, deleteTask);

// Member Routes
router.post("/:projectId/members", protectRoute, addProjectMember);
router.post("/:projectId/members/:userId/role", protectRoute, updateMemberRole);

export default router;
