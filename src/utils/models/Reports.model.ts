import mongoose from "mongoose";

const victimSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    harmed: { type: String, required: true },
    nationality: { type: String, required: true },
    occupation: { type: String, required: true },
});

const suspectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    status: { type: String, required: true },
    nationality: { type: String, required: true },
    occupation: { type: String, required: true },
});

// ✅ FIXED LOCATION SCHEMA
const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Point"],
        required: true,
    },
    coordinates: {
        type: [Number], // [lng, lat]
        required: true,
    },
});
locationSchema.index({ coordinates: "2dsphere" });

// ✅ MAIN SCHEMA
const ReportSchema = new mongoose.Schema(
    {
        blotterNo: { type: String, required: true, unique: true },
        dateEncoded: { type: String, required: true },
        barangay: { type: String, required: true },
        street: { type: String, required: true },
        typeOfPlace: { type: String, required: true },
        dateReported: { type: String, required: true },
        timeReported: { type: String, required: true },
        dateCommitted: { type: String, required: true },
        timeCommitted: { type: String, required: true },
        modeOfReporting: { type: String },
        stageOfFelony: { type: String },
        offense: { type: String, required: true },
        victim: { type: victimSchema, required: true },
        suspect: { type: suspectSchema, required: true },
        suspectMotive: { type: String },
        narrative: { type: String },
        status: { type: String, default: "Solved" },
        location: { type: locationSchema, required: true },
        cctvAvailable: { type: String, default: "Unknown" }, // ADD THIS LINE
    },
    { timestamps: true }
);

const Report =
    mongoose.models.Report || mongoose.model("Report", ReportSchema);

export default Report;
