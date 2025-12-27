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
        link: { // Video Call Link (Jitsi/Zoom/Daily)
            type: String,
        },
        location: String, // For offline
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
