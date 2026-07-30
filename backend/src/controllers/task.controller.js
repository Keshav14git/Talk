import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Notification from "../models/notification.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Create a new task
export const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, assignee, priority, dueDate } = req.body;
        const userId = req.user._id;

        if (!title) return res.status(400).json({ message: "Task title is required" });

        const task = new Task({
            title,
            description,
            projectId,
            assignee,
            priority,
            dueDate,
            createdBy: userId
        });

        await task.save();

        // Populate assignee details for immediate frontend display
        await task.populate("assignee", "fullName profilePic");

        // Socket.io & Notification: Notify assignee
        if (assignee && assignee.toString() !== userId.toString()) {
            // Save to DB
            const notification = new Notification({
                recipient: assignee,
                sender: userId,
                type: "assignment",
                referenceId: task._id,
                referenceType: "Task",
                text: `assigned you a new task: ${task.title}`
            });
            await notification.save();
            await notification.populate("sender", "fullName profilePic");

            const receiverSocketId = getReceiverSocketId(assignee);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newTaskAssigned", task);
                io.to(receiverSocketId).emit("newNotification", notification);
            }
        }

        res.status(201).json(task);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all tasks for a project
export const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;

        const tasks = await Task.find({ projectId })
            .populate("assignee", "fullName profilePic role")
            .populate("createdBy", "fullName")
            .populate("comments.user", "fullName profilePic")
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ message: "Status is required" });

        const task = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        ).populate("assignee", "fullName profilePic");

        const userId = req.user._id;

        // Socket.io: Notify assignee of status change (if someone else changed it, or just to sync)
        if (task.assignee) {
            const assigneeId = task.assignee._id.toString();
            
            if (assigneeId !== userId.toString()) {
                const notification = new Notification({
                    recipient: task.assignee._id,
                    sender: userId,
                    type: "task_status",
                    referenceId: task._id,
                    referenceType: "Task",
                    text: `updated the status of task '${task.title}' to ${status}`
                });
                await notification.save();
                await notification.populate("sender", "fullName profilePic");

                const receiverSocketId = getReceiverSocketId(assigneeId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("taskUpdated", task);
                    io.to(receiverSocketId).emit("newNotification", notification);
                }
            } else {
                 const receiverSocketId = getReceiverSocketId(assigneeId);
                 if (receiverSocketId) io.to(receiverSocketId).emit("taskUpdated", task);
            }
        }

        res.status(200).json(task);
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add a comment
export const addTaskComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { text, mentions } = req.body; // Expect mentions array [userId, userId]
        const userId = req.user._id;

        if (!text) return res.status(400).json({ message: "Comment text is required" });

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const newComment = {
            user: userId,
            text,
            mentions: mentions || []
        };

        task.comments.push(newComment);

        await task.save();

        // Populate the new comment user info
        await task.populate("comments.user", "fullName profilePic");

        // --- Notification Logic ---
        if (mentions && mentions.length > 0) {
            const notificationPromises = mentions.map(async (mentionedUserId) => {
                // Don't notify self
                if (mentionedUserId.toString() === userId.toString()) return;

                const notification = new Notification({
                    recipient: mentionedUserId,
                    sender: userId,
                    type: "mention",
                    referenceId: taskId,
                    referenceType: "Task",
                    text: `mentioned you in a comment on task "${task.title}"`
                });
                return notification.save();
            });

            await Promise.all(notificationPromises);
        }

        res.status(201).json(task);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete comments
export const deleteTaskComments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { commentIds } = req.body; // Expect array of commentIds
        const userId = req.user._id;

        if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
            return res.status(400).json({ message: "No comment IDs provided" });
        }

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Filter out the comments to be deleted
        // Optional: Check permission (e.g., only their own comments or admin/lead?)
        // For now, assuming any member can delete (or rely on UI to limit selection)
        // A safer check: comment.user.toString() === userId.toString() || projectLead

        // We will perform the pull
        task.comments = task.comments.filter(c => !commentIds.includes(c._id.toString()));

        await task.save();
        await task.populate("comments.user", "fullName profilePic");

        res.status(200).json(task);
    } catch (error) {
        console.error("Error deleting comments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get tasks assigned to the current user or belonging to projects they manage
export const getUserTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // 1. Find projects where the user is a manager (lead or admin)
        const managedProjects = await Project.find({
            $or: [{ lead: userId }, { admins: userId }]
        }).select('_id');
        const managedProjectIds = managedProjects.map(p => p._id);

        // 2. Fetch tasks that are either assigned to the user OR belong to a managed project
        const tasks = await Task.find({
            $or: [
                { assignee: userId },
                { projectId: { $in: managedProjectIds } }
            ]
        })
            .populate("projectId", "name") // Useful to know which project
            .populate("assignee", "fullName profilePic") // Fetch assignee details for display
            .sort({ dueDate: 1 }); // Sort by due date ascending
            
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching user tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a task
export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const project = await Project.findById(task.projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const isLead = project.lead.toString() === userId.toString();
        const isAdmin = project.admins.includes(userId);
        const isCreator = task.createdBy.toString() === userId.toString();
        const isAssignee = task.assignee?.toString() === userId.toString();

        if (!isLead && !isAdmin && !isCreator && !isAssignee) {
            return res.status(403).json({ message: "Unauthorized to delete this task." });
        }

        await Task.findByIdAndDelete(taskId);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
