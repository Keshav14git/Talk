import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";



const LOGO_URL = "https://talknow-hqjj.onrender.com/Orchestr%20(3).png";


const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

let transporter = null;

const sendEmail = async (toEmail, subject, htmlContent) => {
    // RENDER FREE TIER STRICTLY BLOCKS ALL SMTP PORTS (25, 465, 587).
    // GMAIL SMTP WILL NEVER WORK ON RENDER FREE TIER.
    // WE MUST USE BREVO'S HTTP API (PORT 443).
    
    if (process.env.BREVO_API_KEY) {
        console.log(`[Email] Using Brevo HTTP API...`);
        try {
            const response = await fetch(BREVO_API_URL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                },
                body: JSON.stringify({
                    sender: { name: "Orchestr", email: process.env.EMAIL_USER || "no-reply@orchestr.com" },
                    to: [{ email: toEmail }],
                    subject: subject,
                    htmlContent: htmlContent
                })
            });
            if (!response.ok) {
                const errData = await response.json();
                console.error("Brevo API Full Error:", errData);
                throw new Error(errData.message || "Brevo API Error");
            }
            console.log(`Email sent successfully via Brevo HTTP API to ${toEmail}`);
            return { success: true };
        } catch (error) {
            console.error("Brevo Catch Error:", error.message);
            throw new Error(`Email Error: Failed to send via Brevo. (${error.message})`);
        }
    }

    // Local Development Fallback (Gmail)
    if (!transporter) {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            console.log(`[Email] Using SMTP account: ${process.env.EMAIL_USER} on Port 587`);
            transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // upgrade later with STARTTLS
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            throw new Error("Missing EMAIL_USER and EMAIL_PASS in .env file. Cannot send real emails.");
        }
    }

    try {
        const info = await transporter.sendMail({
            from: `"Orchestr" <${process.env.EMAIL_USER}>`, // sender address
            to: toEmail, // receiver
            subject: subject, // Subject line
            html: htmlContent, // html body
        });
        
        console.log(`Email sent successfully to ${toEmail} | ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Nodemailer Error:", error.message);
        throw new Error("Failed to send email. Check your EMAIL_USER and EMAIL_PASS.");
    }
};


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
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #ffffff; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
            .header { padding: 30px 20px; text-align: center; border-bottom: 1px solid #222; }
            .header img { height: 40px; object-fit: contain; }
            .content { padding: 40px 30px; text-align: center; }
            .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; margin: 30px 0; display: inline-block; padding: 15px 30px; background: #1A1A1A; border-radius: 8px; border: 1px solid #333; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #222; background: #050505; }
            h2 { font-size: 24px; margin-bottom: 10px; font-weight: 600; color: #fff; }
            p { color: #888; font-size: 14px; line-height: 1.6; margin: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${LOGO_URL}" alt="Orchestr" />
            </div>
            <div class="content">
                <h2>${title}</h2>
                <p>${text}</p>
                <div class="otp-code">${otp}</div>
                <p>This code will expire in 10 minutes.</p>
                <p style="margin-top: 20px; font-size: 12px; color: #555;">If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Orchestr. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};

const getWelcomeTemplate = (name, role) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #ffffff; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
            .header { padding: 30px 20px; text-align: center; border-bottom: 1px solid #222; }
            .header img { height: 40px; object-fit: contain; }
            .content { padding: 40px 30px; text-align: center; }
            .role-badge { display: inline-block; background: #fff; color: #000; font-weight: 600; padding: 8px 16px; border-radius: 50px; margin: 20px 0; font-size: 14px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #222; background: #050505; }
            h2 { font-size: 24px; margin-bottom: 15px; font-weight: 600; color: #fff; }
            p { color: #888; font-size: 15px; line-height: 1.6; margin-bottom: 10px; }
            .button { display: inline-block; margin-top: 20px; background-color: #fff; color: #000; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                 <img src="${LOGO_URL}" alt="Orchestr" />
            </div>
            <div class="content">
                <h2>Welcome, ${name}!</h2>
                <p>We are thrilled to have you join us.</p>
                <div class="role-badge">${role}</div>
                <p>Your workspace is ready. As a <b>${role}</b>, you have successfully initialized your professional identity on Orchestr.</p>
                <a href="#" class="button">Go to Workspace</a>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Orchestr. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};

// ... (sendOtp, verifyOtp, googleAuth remain unchanged) ...

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

        // Send Welcome Email if Role is Set and Updated
        if (role) {
            // Trigger asynchronously, don't block response
            sendEmail(
                updatedUser.email,
                "Welcome to Orchestr",
                getWelcomeTemplate(updatedUser.fullName, role)
            ).catch(err => console.error("Failed to send welcome email:", err.message));
        }

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("error in update profile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        console.log("Preparing to send OTP to:", email);
        console.log("==========================================");
        console.log(`BYPASS: The OTP for ${email} is: ${otp}`);
        console.log("==========================================");

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
            console.log("Attempting to send email...");
            await sendEmail(
                email,
                "Your Login Code",
                getEmailTemplate(otp, "login")
            );
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
            devices: user.devices.map(d => ({ deviceId: d.deviceId, deviceName: d.deviceName, lastLoginAt: d.lastLoginAt })),
            isNewUser: user.fullName === "New User"
        });

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ message: "Server error during verification" });
    }
};

export const registerDevice = async (req, res) => {
    try {
        const { deviceId, pin, deviceName } = req.body;
        const userId = req.user._id;

        if (!deviceId || !pin) {
            return res.status(400).json({ message: "Device ID and PIN are required" });
        }

        if (pin.length < 4) {
            return res.status(400).json({ message: "PIN must be at least 4 characters" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Hash the PIN
        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(pin, salt);

        // Check if device already registered, if so update it, else add it
        const existingDeviceIndex = user.devices.findIndex(d => d.deviceId === deviceId);
        
        if (existingDeviceIndex !== -1) {
            user.devices[existingDeviceIndex].hashedPin = hashedPin;
            user.devices[existingDeviceIndex].deviceName = deviceName || user.devices[existingDeviceIndex].deviceName;
            user.devices[existingDeviceIndex].lastLoginAt = Date.now();
        } else {
            user.devices.push({
                deviceId,
                hashedPin,
                deviceName: deviceName || "Unknown Device",
                lastLoginAt: Date.now()
            });
        }

        await user.save();
        res.status(200).json({ message: "Device registered successfully for fast login" });

    } catch (error) {
        console.error("Error in registerDevice:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const loginWithPin = async (req, res) => {
    try {
        const { email, deviceId, pin } = req.body;

        if (!email || !deviceId || !pin) {
            return res.status(400).json({ message: "Email, Device ID, and PIN are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const device = user.devices.find(d => d.deviceId === deviceId);
        if (!device) {
            return res.status(401).json({ message: "Device not registered for fast login. Please use Email verification." });
        }

        const isPinCorrect = await bcrypt.compare(pin, device.hashedPin);
        if (!isPinCorrect) {
            return res.status(401).json({ message: "Invalid PIN" });
        }

        // Update last login
        device.lastLoginAt = Date.now();
        await user.save();

        let activeOrgId = user.lastActiveOrgId;
        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
            lastActiveOrgId: activeOrgId,
            devices: user.devices.map(d => ({ deviceId: d.deviceId, deviceName: d.deviceName, lastLoginAt: d.lastLoginAt }))
        });

    } catch (error) {
        console.error("Error in loginWithPin:", error);
        res.status(500).json({ message: "Internal server error" });
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
            const userObj = user.toObject();
            if (userObj.devices) {
                userObj.devices = userObj.devices.map(d => {
                    const { hashedPin, ...rest } = d;
                    return rest;
                });
            }
            res.status(200).json(userObj);
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
            console.log("Attempting to send email...");
            await sendEmail(
                newEmail,
                "Verify Email Change",
                getEmailTemplate(otp, "email_change")
            );
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

export const revokeDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.devices = user.devices.filter(d => d.deviceId !== deviceId);
        await user.save();

        res.status(200).json({ message: "Device access revoked successfully", devices: user.devices });
    } catch (error) {
        console.error("Error in revokeDevice:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
