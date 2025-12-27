import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        branding: {
            logo: String,
            primaryColor: String,
        },
    },
    { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
