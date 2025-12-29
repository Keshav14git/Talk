import Channel from "../models/channel.model.js";
import Message from "../models/message.model.js";
import { io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const getChannelMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const messages = await Message.find({ channelId }).populate("senderId", "fullName profilePic").populate("replyTo");
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getChannelMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendChannelMessage = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { text, image, replyTo } = req.body;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            channelId,
            text,
            image: imageUrl,
            replyTo,
            orgId: req.user.lastActiveOrgId // Track org for strict data boundaries
        });

        await newMessage.save();
        await newMessage.populate("senderId", "fullName profilePic");
        await newMessage.populate("replyTo");

        // Broadcast to channel room
        // Assuming we join users to channel rooms via socket
        io.to(`channel:${channelId}`).emit("newChannelMessage", newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendChannelMessage: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createChannel = async (req, res) => {
    try {
        const { name, description, isPrivate } = req.body;
        const orgId = req.user.lastActiveOrgId;

        const newChannel = new Channel({
            name,
            description,
            isPrivate,
            orgId,
            createdBy: req.user._id,
            members: [req.user._id] // Creator is always a member
        });

        await newChannel.save();
        res.status(201).json(newChannel);
    } catch (error) {
        console.error("Error creating channel:", error);
        res.status(500).json({ message: "Failed to create channel" });
    }
};

export const getOrgChannels = async (req, res) => {
    try {
        const orgId = req.user.lastActiveOrgId;
        // Fetch public channels OR private channels where user is member
        const channels = await Channel.find({
            orgId,
            $or: [
                { isPrivate: false },
                { members: req.user._id }
            ]
        });
        res.status(200).json(channels);
    } catch (error) {
        console.error("Error fetching channels:", error);
        res.status(500).json({ message: "Failed to fetch channels" });
    }
};
