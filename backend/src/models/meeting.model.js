import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
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
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        attendees: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        type: {
            type: String,
            enum: ["online", "offline"],
            default: "online",
        },
        // Online Spec
        platform: {
            type: String,
            enum: ["external", "internal"], // 'external' = Google Meet/Zoom, 'internal' = Our App
            default: "internal"
        },
        link: { // External Link
            type: String,
        },
        joinId: { // Internal Meeting ID
            type: String,
        },

        // Offline Spec
        location: String,

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);
export default Meeting;
