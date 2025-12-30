import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

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
        const { text } = req.body;
        const userId = req.user._id;

        if (!text) return res.status(400).json({ message: "Comment text is required" });

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.comments.push({
            user: userId,
            text
        });

        await task.save();

        // Populate the new comment user info
        await task.populate("comments.user", "fullName profilePic");

        res.status(201).json(task);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
