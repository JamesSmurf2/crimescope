// import mongoose from 'mongoose';

// const ReportSchema = new mongoose.Schema({
//     complainantName: { type: String, required: true },
//     contactNumber: { type: String, required: true },
//     address: { type: String, required: true },

//     crime: { type: String, required: true },
//     description: { type: String, required: true },
//     barangay: { type: String, required: true },

//     date: { type: String, required: true },  
//     time: { type: String, required: true },

//     suspectName: { type: String, default: "" },
//     witnessName: { type: String, default: "" },

//     status: {
//         type: String,
//         enum: ["Pending", "Unsolved", "Solved"], 
//         default: "Pending"
//     },

//     createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.models.Report || mongoose.model('Report', ReportSchema);


import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    complainantName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },

    crime: { type: String, required: true },
    description: { type: String, required: true },
    barangay: { type: String, required: true },

    date: { type: String, required: true },
    time: { type: String, required: true },

    suspectName: { type: String, default: "" },
    witnessName: { type: String, default: "" },

    // ✅ GeoJSON Location field
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: undefined,
        },
    },

    status: {
        type: String,
        enum: ["Pending", "Unsolved", "Solved"],
        default: "Pending",
    },

    createdAt: { type: Date, default: Date.now },
});

// ✅ Add 2dsphere index for geospatial queries
ReportSchema.index({ location: "2dsphere" });

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
