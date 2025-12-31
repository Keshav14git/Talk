import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Notification from "../models/notification.model.js";

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
