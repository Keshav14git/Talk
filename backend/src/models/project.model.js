import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["active", "completed", "on-hold"],
            default: "active",
        },
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        // The dedicated chat channel for this project
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
        }
    },
    { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
