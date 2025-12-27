import Organization from "../models/organization.model.js";
import OrgMember from "../models/orgMember.model.js";
import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";

// Create a new Organization
export const createOrganization = async (req, res) => {
    try {
        const { name } = req.body;
        const ownerId = req.user._id;

        // Generate simple slug (in production, ensure uniqueness logic is robust)
        const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Date.now().toString().slice(-4);

        const newOrg = new Organization({
            name,
            slug,
            ownerId,
        });

        await newOrg.save();

        // Add creator as Owner
        const member = new OrgMember({
            userId: ownerId,
            orgId: newOrg._id,
            role: "owner",
        });
        await member.save();

        // Create default "General" channel
        const generalChannel = new Channel({
            orgId: newOrg._id,
            name: "General",
            slug: "general",
            isPrivate: false,
            createdBy: ownerId
        });
        await generalChannel.save();

        res.status(201).json({ org: newOrg, channels: [generalChannel] });

    } catch (error) {
        console.error("Error creating org:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all organizations for the current user
export const getMyOrganizations = async (req, res) => {
    try {
        const userId = req.user._id;
        const memberships = await OrgMember.find({ userId }).populate("orgId");

        // Filter out any nulls if orgs were deleted
        const orgs = memberships.map(m => m.orgId).filter(Boolean);
        res.status(200).json(orgs);
    } catch (error) {
        console.error("Error fetching orgs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Switch to an organization (Get details)
export const getOrganizationDetails = async (req, res) => {
    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        // Verify Membership
        const isMember = await OrgMember.findOne({ userId, orgId });
        if (!isMember) {
            return res.status(403).json({ message: "Access Denied" });
        }

        const org = await Organization.findById(orgId);
        const channels = await Channel.find({ orgId });

        // Update user's last active org
        await User.findByIdAndUpdate(userId, { lastActiveOrgId: orgId });

        res.status(200).json({ org, channels, role: isMember.role });
    } catch (error) {
        console.error("Error fetching org details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
