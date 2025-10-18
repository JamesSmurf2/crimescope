import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["head-admin", "admin"],
        default: "admin"
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User