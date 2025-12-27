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

    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;