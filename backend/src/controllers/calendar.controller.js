import Task from "../models/task.model.js";
import Meeting from "../models/meeting.model.js";

export const getCalendarEvents = async (req, res) => {
    try {
        const { orgId } = req; // From middleware
        // Default to current month if no dates provided, but usually frontend sends a range
        // let { start, end } = req.query; 

        // For simplicity, fetch ALL for org (proto) or filter by range
        // In Enterprise, strictly date-range filtered.

        const tasks = await Task.find({
            orgId,
            dueDate: { $exists: true, $ne: null }
        });

        const meetings = await Meeting.find({ orgId });

        // Normalize to standardized Event format
        const events = [
            ...tasks.map(t => ({
                id: t._id,
                title: t.title,
                start: t.dueDate,
                allDay: true, // Tasks are usually dates, not times unless specified
                type: "task",
                status: t.status,
                color: "#3b82f6" // blue
            })),
            ...meetings.map(m => ({
                id: m._id,
                title: m.title,
                start: m.startTime,
                end: m.endTime,
                type: "meeting",
                link: m.link,
                color: "#10b981" // green
            }))
        ];

        res.status(200).json(events);
    } catch (error) {
        console.error("Calendar fetch error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createMeeting = async (req, res) => {
    try {
        const { title, startTime, endTime, attendees, description, link } = req.body;
        const orgId = req.orgId; // From middleware

        const newMeeting = new Meeting({
            orgId,
            title,
            startTime,
            endTime,
            attendees,
            description,
            link,
            createdBy: req.user._id
        });

        await newMeeting.save();
        res.status(201).json(newMeeting);

    } catch (error) {
        console.error("Create Meeting Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
    export const getUserEvents = async (req, res) => {
        try {
            const userId = req.user._id;

            // 1. Fetch Assigned Tasks with Due Dates
            const tasks = await Task.find({
                assignee: userId,
                dueDate: { $exists: true, $ne: null }
            });

            // 2. Fetch Meetings where user is an attendee
            // Assuming attendees array contains userIds
            const meetings = await Meeting.find({
                attendees: userId
            });

            // Normalize
            const events = [
                ...tasks.map(t => ({
                    id: `task-${t._id}`,
                    title: t.title,
                    start: t.dueDate,
                    end: t.dueDate, // Tasks are point-in-time or all-day
                    allDay: true,
                    type: "task",
                    status: t.status,
                    color: "#3b82f6", // Blue
                    originalId: t._id
                })),
                ...meetings.map(m => ({
                    id: `meeting-${m._id}`,
                    title: m.title,
                    start: m.startTime,
                    end: m.endTime,
                    type: "meeting",
                    link: m.link,
                    color: "#10b981", // Green
                    originalId: m._id
                }))
            ];

            res.status(200).json(events);
        } catch (error) {
            console.error("User Calendar fetch error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    };
