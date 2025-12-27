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

const OrgMember = mongoose.model("OrgMember", orgMemberSchema);
export default OrgMember;
