import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

export const createGroup = async (req, res) => {
    try {
        const { name, members, image } = req.body;
        const admin = req.user._id;

        if (!name || !members || members.length === 0) {
            return res.status(400).json({ message: "Name and members are required" });
        }

        let imageUrl = "";
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // Add admin to members if not already included
        const allMembers = [...new Set([...members, admin])];

        const newGroup = new Group({
            name,
            members: allMembers,
            admin,
            image: imageUrl,
        });

        await newGroup.save();

        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId })
            .populate("members", "fullName profilePic email")
            .populate("admin", "fullName profilePic email")
            .populate("lastMessage");

        res.json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ groupId }).populate("senderId", "fullName profilePic");
        res.json(messages);
    } catch (error) {
        console.error("Error fetching group messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { groupId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            groupId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Update group last message
        await Group.findByIdAndUpdate(groupId, { lastMessage: newMessage._id });

        // Emit to all members in the group room
        // Note: Socket logic needs to handle joining group rooms
        io.to(groupId).emit("newGroupMessage", newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendGroupMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
