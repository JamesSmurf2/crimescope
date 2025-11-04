import mongoose from "mongoose";
import '../models/User.model'
import '../models/Reports.model'

const actions = ["Created Report", "Updated Report", "View Report"];

const logsSchema = new mongoose.Schema({
    adminId: {
        ref: 'User',
        type: mongoose.Types.ObjectId,
        required: true,
    },
    blotterNo: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: actions,
        required: true,
    },
    reportId: {
        ref: 'Report',
        type: mongoose.Types.ObjectId,
        required: true
    },
    offense: {
        type: String,
        required: true,
    },
    barangay: {
        type: String,
        required: true,
    },
    // Remove
    // ✅ Add these new fields to track changes
    changes: [{
        field: String,           // e.g., "status", "victim.name", "suspect.age"
        oldValue: String,         // Previous value
        newValue: String,         // New value
    }],
    changeCount: {               // Total number of fields changed
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Logs = mongoose.models.Logs || mongoose.model("Logs", logsSchema);

export default Logs;