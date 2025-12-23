import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        image: {
            type: String,
            default: "",
        },
        type: {
            type: String, // 'group' (chat) or 'channel' (broadcast)
            enum: ["group", "channel"],
            default: "group",
        },
        description: {
            type: String,
            default: "",
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    },
    { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
