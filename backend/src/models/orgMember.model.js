import mongoose from "mongoose";

const orgMemberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        role: {
            type: String,
            enum: ["owner", "admin", "member", "guest"],
            default: "member",
        },
        employeeId: {
            type: String, // e.g. EMP-1042
            sparse: true, // Allow nulls during migration, but unique where present per org
        },
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // The User ID of their reporting manager
        },
        totalLeavesQuota: {
            type: Number,
            default: 24, // Default annual leave quota
        },
        // For future Team assignments
        teams: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team"
        }]
    },
    { timestamps: true }
);

// Compound index to ensure a user is only a member of an org once
orgMemberSchema.index({ userId: 1, orgId: 1 }, { unique: true });
orgMemberSchema.index({ orgId: 1, employeeId: 1 }, { unique: true, partialFilterExpression: { employeeId: { $exists: true } } });

const OrgMember = mongoose.model("OrgMember", orgMemberSchema);
export default OrgMember;
