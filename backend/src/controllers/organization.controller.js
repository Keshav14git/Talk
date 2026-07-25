import Organization from "../models/organization.model.js";
import User from "../models/user.model.js";
import OrgMember from "../models/orgMember.model.js";

// Helper to generate a unique employee ID per org
const generateEmployeeId = async (orgId) => {
    let isUnique = false;
    let newId = "";
    while (!isUnique) {
        newId = "EMP-" + Math.floor(1000 + Math.random() * 9000);
        const exists = await OrgMember.findOne({ orgId, employeeId: newId });
        if (!exists) isUnique = true;
    }
    return newId;
};

// Create Organization
export const createOrganization = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user._id;

        if (!name) return res.status(400).json({ message: "Organization name is required" });

        const slug = name.toLowerCase().replace(/\s+/g, '-') + "-" + Date.now().toString().slice(-4);
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        // Generate a 12-character unique registration number (e.g., ORG-9X21-8B7A)
        const registrationNumber = "ORG-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

        const newOrg = new Organization({
            name,
            slug,
            ownerId: userId,
            joinCode,
            registrationNumber
        });

        await newOrg.save();

        // Add creator as Owner
        const employeeId = await generateEmployeeId(newOrg._id);
        const member = new OrgMember({
            userId,
            orgId: newOrg._id,
            role: "owner",
            employeeId
        });

        await member.save();

        // Update User's last active org
        await User.findByIdAndUpdate(userId, { lastActiveOrgId: newOrg._id });

        res.status(201).json(newOrg);
    } catch (error) {
        console.error("Error in createOrganization:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Join Organization
export const joinOrganization = async (req, res) => {
    try {
        const { joinCode, orgName, registrationNumber } = req.body;
        const userId = req.user._id;

        let org;

        if (joinCode) {
            org = await Organization.findOne({ joinCode });
        } else if (registrationNumber) {
            org = await Organization.findOne({ registrationNumber });
        } else if (orgName) {
            // Case insensitive search
            org = await Organization.findOne({ name: { $regex: new RegExp(`^${orgName}$`, 'i') } });
        }

        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // Check if already a member
        const existingMember = await OrgMember.findOne({ userId, orgId: org._id });
        if (existingMember) {
            return res.status(400).json({ message: "You are already a member of this organization" });
        }

        const employeeId = await generateEmployeeId(org._id);
        const newMember = new OrgMember({
            userId,
            orgId: org._id,
            role: "member",
            employeeId
        });

        await newMember.save();

        // Update User's last active org
        await User.findByIdAndUpdate(userId, { lastActiveOrgId: org._id });

        res.status(200).json(org);
    } catch (error) {
        console.error("Error in joinOrganization:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Org Data (Members, Projects, etc.)
export const getOrganizationData = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user.lastActiveOrgId) {
            return res.status(404).json({ message: "No active organization found" });
        }

        const orgId = user.lastActiveOrgId;

        const org = await Organization.findById(orgId).populate("projects");
        const members = await OrgMember.find({ orgId }).populate("userId", "fullName email profilePic role");

        // Format members data and self-heal missing employee IDs
        const formattedMembers = await Promise.all(members.map(async (m) => {
            if (!m.employeeId) {
                m.employeeId = await generateEmployeeId(orgId);
                await m.save();
            }
            return {
                _id: m.userId._id,
                fullName: m.userId.fullName,
                email: m.userId.email,
                profilePic: m.userId.profilePic,
                designation: m.userId.role, // "Product Manager"
                accessLevel: m.role, // "admin" or "member"
                employeeId: m.employeeId,
                managerId: m.managerId,
                joinedAt: m.createdAt
            };
        }));

        res.status(200).json({
            org,
            members: formattedMembers
        });
    } catch (error) {
        console.error("Error in getOrganizationData:", error);
        res.status(500).json({ message: "Internal server error" });
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

// Set Manager
export const setManager = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { managerEmployeeId } = req.body;
        const userId = req.user._id;

        const currentMember = await OrgMember.findOne({ userId, orgId });
        if (!currentMember) {
            return res.status(404).json({ message: "You are not a member of this organization" });
        }

        const managerMember = await OrgMember.findOne({ orgId, employeeId: managerEmployeeId });
        if (!managerMember) {
            return res.status(404).json({ message: "No employee found with that ID in this organization" });
        }

        if (managerMember.userId.toString() === userId.toString()) {
            return res.status(400).json({ message: "You cannot be your own manager" });
        }

        currentMember.managerId = managerMember.userId;
        await currentMember.save();

        res.status(200).json({ message: "Manager mapped successfully" });
    } catch (error) {
        console.error("Error setting manager:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get My Team (Direct Reports)
export const getMyTeam = async (req, res) => {
    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        const teamMembers = await OrgMember.find({ orgId, managerId: userId })
            .populate("userId", "fullName email profilePic role");

        const formattedTeam = teamMembers.map(m => ({
            _id: m.userId._id,
            fullName: m.userId.fullName,
            email: m.userId.email,
            profilePic: m.userId.profilePic,
            designation: m.userId.role,
            accessLevel: m.role,
            employeeId: m.employeeId,
            joinedAt: m.createdAt
        }));

        res.status(200).json(formattedTeam);
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
