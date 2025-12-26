import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

// Configure Nodemailer (mock for now, or real if env vars exist)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App Password
    },
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
        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user record with just email for now
            user = new User({ email, fullName: "New User" }); // Placeholder name
        }

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send Email
        if (process.env.GMAIL_USER) {
            await transporter.sendMail({
                from: '"Talk App" <' + process.env.GMAIL_USER + '>',
                to: email,
                subject: "Your Login Code",
                text: `Your backend verification code is: ${otp}`,
                html: `<b>Your verification code is: ${otp}</b>`
            });
            console.log(`OTP sent to ${email}: ${otp}`);
        } else {
            console.log(`[MOCK EMAIL] OTP for ${email}: ${otp} (Configure GMAIL_USER to send real emails)`);
        }

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("Error in sendOtp:", error.message);
        res.status(500).json({ message: "Failed to send OTP: " + error.message });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });
        if (!user.otp || user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
        if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP expired" });

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic
        });

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ message: "Server error during verification" });
    }
};

export const googleAuth = async (req, res) => {
    // Placeholder for Google Auth logic
    // const { token } = req.body;
    // ... verification logic ...
    res.status(501).json({ message: "Google Auth Not Implemented Yet" });
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
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile Pic is required" });
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });
        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("error in update profile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}