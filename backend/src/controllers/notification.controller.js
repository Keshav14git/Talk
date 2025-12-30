import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .populate("sender", "fullName profilePic");
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ message: "Marked as read" });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to update notification" });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ message: "All marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Failed to update notifications" });
    }
};
