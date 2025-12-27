import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

// Configure Nodemailer (mock for now, or real if env vars exist)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS?.replace(/\s+/g, ''), // Remove spaces from App Password
    },
    logger: true, // Log to console
    debug: true, // Include SMTP traffic in logs
    connectionTimeout: 10000, // Fail after 10 seconds if hanging
});

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Upsert user (find or create temporary doc if needed, or just update existing)
        // For simplicity in this flow: We find by email. If not found, we create a temporary placeholder or Just-In-Time creation during verification.
        // Better Linear approach: Just separate OTP store or store on User.
        // If user doesn't exist, we can create them now OR wait for verify.
        // Let's create/update the user record with the OTP.
        // ... existing code ...
        console.log("Preparing to send OTP to:", email);

        // Upsert user
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, fullName: "New User" });
        }
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        console.log("User updated in DB with OTP.");

        // Send Email
        try {
            if (process.env.GMAIL_USER) {
                console.log("Attempting to send email via Nodemailer...");
                await transporter.sendMail({
                    from: '"Talk App" <' + process.env.GMAIL_USER + '>',
                    to: email,
                    subject: "Your Login Code",
                    text: `Your backend verification code is: ${otp}`,
                    html: `<b>Your verification code is: ${otp}</b>`
                });
                console.log(`OTP sent to ${email}`);
            } else {
                console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);
            }
        } catch (emailError) {
            console.error("Email sending failed (Network Blocked?):", emailError.message);
            console.log("\n=======================================");
            console.log(`EMERGENCY OTP FOR ${email}: ${otp}`);
            console.log("=======================================\n");
            // Proceed as if successful so user can login using the log
        }

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("Error in sendOtp details:", error);
        res.status(500).json({ message: "Failed to send OTP: " + error.message });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });

        console.log(`Verifying OTP for ${email}: Received '${otp}' | Stored '${user.otp}'`);
        console.log(`Expires: ${user.otpExpires} | Now: ${new Date()}`);

        if (!user.otp || user.otp !== otp) {
            console.log("OTP Mismatch!");
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otpExpires < Date.now()) {
            console.log("OTP Expired!");
            return res.status(400).json({ message: "OTP expired" });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Enterprise: Provision Default Org if needed
        let activeOrgId = user.lastActiveOrgId;
        if (!activeOrgId) {
            // Check if they have any orgs
            const existingMember = await import("../models/orgMember.model.js").then(m => m.default.findOne({ userId: user._id }));

            if (existingMember) {
                user.lastActiveOrgId = existingMember.orgId;
                activeOrgId = existingMember.orgId;
                await user.save();
            } else {
                // Determine Org Name
                const orgName = (user.fullName || user.email.split('@')[0]) + "'s Workspace";
                const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);

                const Organization = (await import("../models/organization.model.js")).default;
                const OrgMember = (await import("../models/orgMember.model.js")).default;
                const Channel = (await import("../models/channel.model.js")).default;

                const newOrg = new Organization({ name: orgName, slug, ownerId: user._id });
                await newOrg.save();

                await new OrgMember({ userId: user._id, orgId: newOrg._id, role: "owner" }).save();
                await new Channel({ orgId: newOrg._id, name: "General", slug: "general", createdBy: user._id }).save();

                user.lastActiveOrgId = newOrg._id;
                activeOrgId = newOrg._id;
                await user.save();
            }
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
            lastActiveOrgId: activeOrgId, // Send this to frontend
            isNewUser: user.fullName === "New User"
        });

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ message: "Server error during verification" });
    }
};

import axios from "axios";

export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body; // Access Token from frontend
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        // Fetch user info from Google
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        const { sub, name, email, picture } = response.data;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // If user exists but doesn't have googleId, update it
            if (!user.googleId) {
                user.googleId = sub;
                // user.profilePic = picture; // Optional: update pic? maybe not to overwrite custom one
                await user.save();
            }
        } else {
            // Create new user
            user = new User({
                email,
                fullName: name,
                profilePic: picture,
                googleId: sub,
            });
            await user.save();
        }

        // Enterprise: Provision Default Org if needed
        let activeOrgId = user.lastActiveOrgId;
        if (!activeOrgId) {
            const existingMember = await import("../models/orgMember.model.js").then(m => m.default.findOne({ userId: user._id }));

            if (existingMember) {
                user.lastActiveOrgId = existingMember.orgId;
                activeOrgId = existingMember.orgId;
                await user.save();
            } else {
                const orgName = (user.fullName || "My") + " Workspace";
                const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);

                const Organization = (await import("../models/organization.model.js")).default;
                const OrgMember = (await import("../models/orgMember.model.js")).default;
                const Channel = (await import("../models/channel.model.js")).default;

                const newOrg = new Organization({ name: orgName, slug, ownerId: user._id });
                await newOrg.save();

                await new OrgMember({ userId: user._id, orgId: newOrg._id, role: "owner" }).save();
                await new Channel({ orgId: newOrg._id, name: "General", slug: "general", createdBy: user._id }).save();

                user.lastActiveOrgId = newOrg._id;
                activeOrgId = newOrg._id;
                await user.save();
            }
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
            lastActiveOrgId: activeOrgId,
        });

    } catch (error) {
        console.log("Error in googleAuth:", error);
        res.status(500).json({ message: error.message });
    }
};

// Keep existing methods for backward compatibility or profile updates
export const signup = async (req, res) => { /* Legacy or alternative */ };
export const login = async (req, res) => { /* Legacy password login */ };

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;

        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updateData.profilePic = uploadResponse.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("error in update profile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(200).json(null);
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select("-password");
            if (!user) {
                return res.status(200).json(null);
            }
            res.status(200).json(user);
        } catch (error) {
            // Token invalid or expired
            return res.status(200).json(null);
        }
    } catch (error) {
        console.log("error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const requestEmailChange = async (req, res) => {
    const { newEmail } = req.body;
    const userId = req.user._id;

    if (!newEmail) return res.status(400).json({ message: "New Email is required" });

    try {
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) return res.status(400).json({ message: "Email is already in use" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const user = await User.findById(userId);
        user.tempEmail = newEmail;
        user.emailChangeOtp = otp;
        user.emailChangeOtpExpires = otpExpires;
        await user.save();

        // Send Email to NEW address
        try {
            if (process.env.GMAIL_USER) {
                await transporter.sendMail({
                    from: '"Talk App" <' + process.env.GMAIL_USER + '>',
                    to: newEmail,
                    subject: "Verify Email Change",
                    text: `Your verification code for email change is: ${otp}`,
                    html: `<b>Your verification code is: ${otp}</b>`
                });
                console.log(`Email change OTP sent to ${newEmail}`);
            } else {
                console.log(`[MOCK] Email Change OTP for ${newEmail}: ${otp}`);
            }
        } catch (emailError) {
            console.log(`EMERGENCY OTP (Email Change) for ${newEmail}: ${otp}`);
        }

        res.status(200).json({ message: "OTP sent to new email" });

    } catch (error) {
        console.log("Error requesting email change:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const verifyEmailChange = async (req, res) => {
    const { otp } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user.tempEmail || !user.emailChangeOtp) {
            return res.status(400).json({ message: "No email change request found" });
        }

        if (user.emailChangeOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.emailChangeOtpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP Expired" });
        }

        // Commit Change
        user.email = user.tempEmail;
        user.tempEmail = undefined;
        user.emailChangeOtp = undefined;
        user.emailChangeOtpExpires = undefined;
        await user.save();

        res.status(200).json(user);

    } catch (error) {
        console.log("Error verifying email change:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
