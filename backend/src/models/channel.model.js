import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
    {
        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        // e.g. "general", "announcements"
        slug: {
            type: String,
            lowercase: true,
            trim: true,
        },
        description: String,
        isPrivate: {
            type: Boolean,
            default: false,
        },
        // For private channels
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    },
    { timestamps: true }
);

const Channel = mongoose.model("Channel", channelSchema);
export default Channel;
