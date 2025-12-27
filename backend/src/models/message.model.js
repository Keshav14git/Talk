import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: false,
        },
        text: {
            type: String,
        },
        image: {
            type: String,
        },
        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true, // Enterprise Strictness
        },
        channelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Channel',
            required: false, // If null, it's a DM
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: false,
        },
    },
    { timestamps: true, }
);

const Message = mongoose.model('Message', messageSchema);

export default Message