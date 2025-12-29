import Project from "../models/project.model.js";
import Channel from "../models/channel.model.js";
import Organization from "../models/organization.model.js";

export const createProject = async (req, res) => {
    try {
        const { name, description, assignedMembers } = req.body;
        const userId = req.user._id;
        const orgId = req.user.lastActiveOrgId;

        if (!orgId) return res.status(400).json({ message: "No active organization" });
        if (!name) return res.status(400).json({ message: "Project name is required" });

        // Create a Channel for this Project
        const slug = "proj-" + name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
        const projectChannel = new Channel({
            orgId,
            name: `Project: ${name}`,
            slug,
            isPrivate: true, // Project chats are usually private to members
            members: [userId, ...(assignedMembers || [])], // Add creator and assigned members
            createdBy: userId
        });

        await projectChannel.save();

        const newProject = new Project({
            name,
            description,
            lead: userId, // Creator is lead by default
            members: [userId, ...(assignedMembers || [])],
            orgId,
            chatId: projectChannel._id
        });

        await newProject.save();

        // Add Project to Organization's project list
        await Organization.findByIdAndUpdate(orgId, {
            $push: { projects: newProject._id }
        });

        res.status(201).json(newProject);

    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getOrgProjects = async (req, res) => {
    try {
        const orgId = req.user.lastActiveOrgId;
        if (!orgId) return res.status(400).json({ message: "No active organization" });

        const projects = await Project.find({ orgId })
            .populate("lead", "fullName profilePic")
            .populate("members", "fullName profilePic role");

        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ message: "Status is required" });

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { status },
            { new: true }
        );

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error("Error updating project status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
