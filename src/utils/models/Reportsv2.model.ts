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

const locationSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
});

const crimeReportSchema = new mongoose.Schema(
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
        status: { type: String, enum: ["Solved", "Cleared", "Unsolved"], default: "Solved" },
        location: { type: locationSchema, required: true },
    },
    { timestamps: true }
);

const CrimeReport =
    mongoose.models.CrimeReport || mongoose.model("CrimeReport", crimeReportSchema);

export default CrimeReport;