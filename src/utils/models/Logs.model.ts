import mongoose from "mongoose";
import '../models/User.model'
import '../models/Reports.model'

const offenseList = [
    // 🚨 Index Crimes
    "Murder", "Homicide", "Rape", "Physical Injury", "Robbery", "Theft", "Carnapping", "Cattle Rustling",
    // ⚖️ Non-Index Crimes
    "Drug Offense", "Illegal Firearms", "Child Abuse", "Cybercrime", "Estafa", "Direct Assault", "Grave Threats",
    "Other Forms of Trespass", "Violence Against Women & Children (VAWC)", "Illegal Logging",
    // 🚗 Traffic Violations
    "Reckless Driving", "Illegal Parking", "Overspeeding", "Driving Without License", "Road Accident",
    // 📜 Ordinance Violations
    "Curfew Violation", "Public Disturbance", "Littering", "Noise Complaint", "Illegal Vending", "Drinking in Public",
    "Alarms and Scandals", "Unjust Vexations", "Light Threats", "Malicious Mischief",
];

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
        enum: offenseList,
        required: true,
    },
    barangay: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Logs = mongoose.models.Logs || mongoose.model("Logs", logsSchema);

export default Logs;
