import ApprovalRequest from "../models/approvalRequest.model.js";
import OrgMember from "../models/orgMember.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Check if user is an admin or owner of the org
const checkAdminPrivileges = async (userId, orgId) => {
    const member = await OrgMember.findOne({ userId, orgId });
    return member && (member.role === "admin" || member.role === "owner");
};

export const createRequest = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { category, type, formPayload } = req.body;
        const requesterId = req.user._id;

        if (!category || !type || !formPayload) {
            return res.status(400).json({ message: "Category, type, and formPayload are required" });
        }

        // Check if requester has a manager
        const requesterMember = await OrgMember.findOne({ userId: requesterId, orgId });
        const assignedTo = requesterMember?.managerId || null;

        const newRequest = new ApprovalRequest({
            requesterId,
            orgId,
            category,
            type,
            formPayload,
            status: "pending",
            assignedTo
        });

        await newRequest.save();

        // Populate requester details for the response
        await newRequest.populate("requesterId", "fullName email profilePic");

        // TODO: Socket.io notification to org Admins could be emitted here
        // io.to(orgId).emit("new_approval_request", newRequest);

        res.status(201).json(newRequest);
    } catch (error) {
        console.error("Error creating approval request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getInbox = async (req, res) => {
    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        // Admins can see requests assigned to them OR unassigned requests.
        // Managers (non-admins) can ONLY see requests assigned to them.
        const isAdmin = await checkAdminPrivileges(userId, orgId);
        
        let query = { orgId, status: "pending" };
        if (isAdmin) {
            query.$or = [{ assignedTo: userId }, { assignedTo: null }];
        } else {
            query.assignedTo = userId;
        }

        const requests = await ApprovalRequest.find(query)
            .populate("requesterId", "fullName email profilePic")
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching inbox:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getSent = async (req, res) => {
    try {
        const { orgId } = req.params;
        const requesterId = req.user._id;

        const requests = await ApprovalRequest.find({ orgId, requesterId })
            .populate("reviewedBy", "fullName email profilePic")
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching sent requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { orgId, requestId } = req.params;
        const { status, reviewNotes } = req.body;
        const reviewerId = req.user._id;

        if (!["approved", "denied"].includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        const isAdmin = await checkAdminPrivileges(reviewerId, orgId);
        if (!isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const request = await ApprovalRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.orgId.toString() !== orgId) {
            return res.status(400).json({ message: "Request does not belong to this organization" });
        }

        request.status = status;
        request.reviewedBy = reviewerId;
        if (reviewNotes !== undefined) {
            request.reviewNotes = reviewNotes;
        }

        await request.save();

        await request.populate("requesterId", "fullName email profilePic");
        await request.populate("reviewedBy", "fullName email profilePic");

        // TODO: Handle automatic actions if approved (e.g. creating project, granting role)
        // This can be expanded based on request.category and request.type

        res.status(200).json(request);
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteRequest = async (req, res) => {
    try {
        const { orgId, requestId } = req.params;
        const userId = req.user._id;

        const request = await ApprovalRequest.findOne({ _id: requestId, orgId });
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.requesterId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own requests" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Only pending requests can be deleted" });
        }

        const assignedTo = request.assignedTo;
        const requesterDetails = await User.findById(userId).select("fullName");

        await ApprovalRequest.findByIdAndDelete(requestId);
        
        if (assignedTo) {
            const receiverSocketId = getReceiverSocketId(assignedTo.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("request_deleted", { requesterName: requesterDetails?.fullName || "A user" });
            }
        } else {
            // Emit to all admins (for now just emit globally to org admins if we had rooms, but this is fine)
            io.emit("request_deleted_admin", { orgId, requesterName: requesterDetails?.fullName || "A user" });
        }

        res.status(200).json({ message: "Request deleted successfully", assignedTo, requesterName: requesterDetails?.fullName });
    } catch (error) {
        console.error("Error deleting request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- LEAVE & HISTORY LOGIC ---

// Utility to calculate business days between two dates
const getBusinessDays = (startStr, endStr, isHalfDay) => {
    if (isHalfDay) return 0.5;
    
    const start = new Date(startStr);
    const end = new Date(endStr);
    let count = 0;
    const cur = new Date(start.getTime());

    while (cur <= end) {
        const dayOfWeek = cur.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
            count++;
        }
        cur.setDate(cur.getDate() + 1);
    }
    return count;
};

export const getLeaveBalance = async (req, res) => {
    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        const member = await OrgMember.findOne({ userId, orgId });
        if (!member) return res.status(404).json({ message: "Organization member not found" });

        const totalLeaves = member.totalLeavesQuota || 24;

        // Fetch all APPROVED HR_LEAVE requests for this user
        const approvedLeaves = await ApprovalRequest.find({
            orgId,
            requesterId: userId,
            category: "HR_LEAVE",
            status: "approved"
        });

        let takenLeaves = 0;
        let leavesThisMonth = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        approvedLeaves.forEach(req => {
            const payload = req.formPayload || {};
            if (payload.startDate && payload.endDate) {
                const days = getBusinessDays(payload.startDate, payload.endDate, payload.isHalfDay);
                takenLeaves += days;

                // Check if leave falls in the current month
                const startDate = new Date(payload.startDate);
                if (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) {
                    leavesThisMonth += days;
                }
            }
        });

        res.status(200).json({
            totalLeaves,
            takenLeaves,
            leavesThisMonth,
            leavesLeft: totalLeaves - takenLeaves
        });
    } catch (error) {
        console.error("Error fetching leave balance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getHistory = async (req, res) => {
    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        // Managers and Admins can see history. 
        // We'll return requests that they either reviewed OR were assigned to them, that are not pending.
        const isAdmin = await checkAdminPrivileges(userId, orgId);

        let query = { orgId, status: { $in: ["approved", "denied"] } };
        
        if (isAdmin) {
            // Admins can see history of requests assigned to them, unassigned, OR reviewed by them
            query.$or = [
                { assignedTo: userId },
                { assignedTo: null },
                { reviewedBy: userId }
            ];
        } else {
            // Normal managers can see requests assigned to them OR reviewed by them
            query.$or = [
                { assignedTo: userId },
                { reviewedBy: userId }
            ];
        }

        const history = await ApprovalRequest.find(query)
            .populate("requesterId", "fullName email profilePic")
            .populate("reviewedBy", "fullName")
            .sort({ updatedAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
