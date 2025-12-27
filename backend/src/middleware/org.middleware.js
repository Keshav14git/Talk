import OrgMember from "../models/orgMember.model.js";

export const protectOrg = async (req, res, next) => {
    try {
        const userId = req.user._id;
        // OrgId can come from params (/:orgId/...) or body or header. 
        // We prioritize params, then header 'x-org-id'.
        const orgId = req.params.orgId || req.headers['x-org-id'];

        if (!orgId) {
            return res.status(400).json({ message: "Organization Context Missing" });
        }

        const membership = await OrgMember.findOne({ userId, orgId });

        if (!membership) {
            return res.status(403).json({ message: "Access Denied to this Organization" });
        }

        // Attach role to request for further policy checks
        req.orgRole = membership.role;
        req.orgId = orgId;

        next();
    } catch (error) {
        console.error("Org Protection Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
