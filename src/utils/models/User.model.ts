import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["head-admin", "admin"],
        default: "admin"
    },
    password: {
        type: String,
        required: true
    },
    enableTwoFA: {
        type: Boolean,
        default: false
    },
    twoFACode: {
        type: String,
        default: null
    },
    twoFAExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
