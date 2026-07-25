import mongoose from "mongoose";

const approvalRequestSchema = new mongoose.Schema(
    {
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        category: {
            type: String,
            enum: ["SYSTEM_PERMISSION", "HR_LEAVE", "FINANCE_EXPENSE", "IT_SUPPORT"],
            required: true,
        },
        type: {
            type: String, // e.g. 'CREATE_PROJECT', 'SICK_LEAVE', 'SOFTWARE_LICENSE'
            required: true,
        },
        formPayload: {
            type: mongoose.Schema.Types.Mixed, // JSON object storing dynamic form data
            required: true,
            default: {}
        },
        status: {
            type: String,
            enum: ["pending", "approved", "denied"],
            default: "pending",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // If null, means it goes to all Admins
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // Populated when an Admin approves/denies
        },
        reviewNotes: {
            type: String, // Optional feedback from the Admin
            default: "",
        }
    },
    { timestamps: true }
);

const ApprovalRequest = mongoose.model("ApprovalRequest", approvalRequestSchema);
export default ApprovalRequest;
