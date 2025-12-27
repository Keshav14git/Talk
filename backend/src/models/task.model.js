import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: String,
        status: {
            type: String,
            enum: ["todo", "in_progress", "review", "done"],
            default: "todo",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        assignees: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        // Contextual Link
        linkedMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        dueDate: Date,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
