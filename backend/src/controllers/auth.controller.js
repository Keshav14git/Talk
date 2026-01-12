import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import { Resend } from "resend";
import { OAuth2Client } from "google-auth-library";

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const getEmailTemplate = (otp, type = "login") => {
    const title = type === "login" ? "Your Login Code" : "Verify Email Change";
    const text = type === "login"
        ? "Use the code below to log in to your account."
        : "Use the code below to verify your new email address.";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; background-color: #f9f9f9; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { color: #000; font-size: 24px; margin: 0; }
            .content { background: #fff; padding: 20px; border-radius: 8px; text-align: center; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; margin: 20px 0; display: inline-block; padding: 10px 20px; background: #EEF2FF; border-radius: 8px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Talk App</h1>
            </div>
            <div class="content">
                <h2>${title}</h2>
                <p>${text}</p>
                <div class="otp-code">${otp}</div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Talk App. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

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

        // Send Email via Resend
        try {
            console.log("Attempting to send email via Resend...");
            if (!process.env.RESEND_API_KEY) {
                throw new Error("Missing RESEND_API_KEY in environment variables");
            }

            const data = await resend.emails.send({
                from: "Talk App <onboarding@resend.dev>",
                to: email, // Free tier limit: must match account email
                subject: "Your Login Code",
                html: getEmailTemplate(otp, "login")
            });

            if (data.error) {
                console.error("Resend API Error:", data.error);
                return res.status(500).json({ message: "Email Error: " + data.error.message });
            }

            console.log(`OTP sent to ${email} | ID: ${data.data?.id}`);
        } catch (emailError) {
            console.error("Email sending exception:", emailError);
            return res.status(500).json({ message: "Email Error: " + emailError.message });
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

        let activeOrgId = user.lastActiveOrgId;

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

        let activeOrgId = user.lastActiveOrgId;

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
        const { profilePic, fullName, role } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (role) updateData.role = role;

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

        // Send Email to NEW address via Resend
        try {
            if (!process.env.RESEND_API_KEY) {
                throw new Error("Missing RESEND_API_KEY");
            }

            const data = await resend.emails.send({
                from: "Talk App <onboarding@resend.dev>",
                to: newEmail,
                subject: "Verify Email Change",
                html: getEmailTemplate(otp, "email_change")
            });

            if (data.error) {
                console.error("Resend API Error details:", data.error);
                if (data.error.message?.includes("resend.dev")) {
                    console.log("DEV NOTE: Free tier Resend only sends to verified email.");
                }
                // Strict fail: notify frontend
                return res.status(500).json({ message: "Email Error: " + data.error.message });
            }
            console.log(`Email change OTP sent to ${newEmail} | ID: ${data.data?.id}`);
        } catch (emailError) {
            console.log("Error sending email change OTP:", emailError);
            return res.status(500).json({ message: "Email Error: " + emailError.message });
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
