import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        // Role/Designation e.g. "Product Manager", "Software Engineer"
        role: {
            type: String,
            default: "Employee",
        },
        password: {
            type: String,
            required: false,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        otp: {
            type: String,
        },
        otpExpires: {
            type: Date,
        },
        // For Email Change Process
        tempEmail: {
            type: String,
        },
        emailChangeOtp: {
            type: String,
        },
        emailChangeOtpExpires: {
            type: Date,
        },
        emailChangeOtp: {
            type: String,
        },
        emailChangeOtpExpires: {
            type: Date,
        },
        googleId: {
            type: String,
        },
        // Enterprise Context
        lastActiveOrgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization"
        }

    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;