import { NextResponse } from "next/server";
import { connectDb } from "@/utils/utility/ConnectDb";
import { NextRequest } from "next/server";
import ReportsModel from "@/utils/models/Reports.model";
import { getAuthenticatedUser } from "@/utils/utility/verifyUser";

// ✅ Validation helper functions
const isValidString = (value: any, minLength: number = 1): boolean => {
    return typeof value === 'string' && value.trim().length >= minLength;
};

const isValidDate = (dateString: any): boolean => {
    if (!dateString || typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

const isValidTime = (timeString: any): boolean => {
    if (!timeString || typeof timeString !== 'string') return false;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(timeString);
};

const isValidObjectId = (id: any): boolean => {
    if (!id || typeof id !== 'string') return false;
    return /^[a-f\d]{24}$/i.test(id);
};

// ✅ Validation constants
const validBarangays = [
    "Almanza Dos", "Almanza Uno", "B.F. CAA International Village", "Daniel Fajardo",
    "Elias Aldana", "Ilaya", "Manuyo Uno", "Manuyo Dos", "Pamplona Uno", "Pamplona Dos",
    "Pamplona Tres", "Pilar", "Pulang Lupa Uno", "Pulang Lupa Dos", "Talon Uno",
    "Talon Dos", "Talon Tres", "Talon Cuatro", "Talon Singko", "Zapote",
];

const validOffenses = [
    "Murder", "Homicide", "Rape", "Physical Injury", "Robbery", "Theft", "Carnapping", "Cattle Rustling",
    "Drug Offense", "Illegal Firearms", "Child Abuse", "Cybercrime", "Estafa", "Direct Assault",
    "Grave Threats", "Other Forms of Trespass", "Violence Against Women & Children (VAWC)", "Illegal Logging",
    "Reckless Driving", "Illegal Parking", "Overspeeding", "Driving Without License", "Road Accident",
    "Curfew Violation", "Public Disturbance", "Littering", "Noise Complaint", "Illegal Vending",
    "Drinking in Public", "Alarms and Scandals", "Unjust Vexations", "Light Threats", "Malicious Mischief"
];

const validTypesOfPlace = ["Along the Street", "Residential", "Commercial"];
const validModesOfReporting = ["N/A", "In Person", "Phone Call", "Walk In"];
const validStagesOfFelony = ["N/A", "Attempted", "Frustrated", "Consummated"];
const validGenders = ["N/A", "Male", "Female"];
const validHarmedStatus = ["N/A", "Harmed", "Unharmed"];
const validSuspectStatus = ["N/A", "Arrested", "Detained", "At Large"];
const validCaseStatus = ["Solved", "Cleared", "Unsolved"];

// ✅ Comprehensive validation function
const validateReportData = (data: any) => {
    // Validate Barangay
    if (data.barangay && (!isValidString(data.barangay) || !validBarangays.includes(data.barangay))) {
        return { valid: false, error: "Invalid barangay. Please select a valid barangay." };
    }

    // Validate Street
    if (data.street && !isValidString(data.street)) {
        return { valid: false, error: "Street name is required and cannot be empty" };
    }

    // Validate Type of Place
    if (data.typeOfPlace && (!isValidString(data.typeOfPlace) || !validTypesOfPlace.includes(data.typeOfPlace))) {
        return { valid: false, error: "Invalid type of place" };
    }

    // Validate Date Reported
    if (data.dateReported && !isValidDate(data.dateReported)) {
        return { valid: false, error: "Invalid date reported" };
    }

    // Validate Time Reported
    if (data.timeReported && !isValidTime(data.timeReported)) {
        return { valid: false, error: "Invalid time reported. Format should be HH:MM" };
    }

    // Validate Date Committed
    if (data.dateCommitted && !isValidDate(data.dateCommitted)) {
        return { valid: false, error: "Invalid date committed" };
    }

    // Validate Time Committed
    if (data.timeCommitted && !isValidTime(data.timeCommitted)) {
        return { valid: false, error: "Invalid time committed. Format should be HH:MM" };
    }

    // Validate Mode of Reporting
    if (data.modeOfReporting && (!isValidString(data.modeOfReporting) || !validModesOfReporting.includes(data.modeOfReporting))) {
        return { valid: false, error: "Invalid mode of reporting" };
    }

    // Validate Stage of Felony
    if (data.stageOfFelony && (!isValidString(data.stageOfFelony) || !validStagesOfFelony.includes(data.stageOfFelony))) {
        return { valid: false, error: "Invalid stage of felony" };
    }

    // Validate Offense
    if (data.offense && (!isValidString(data.offense) || !validOffenses.includes(data.offense))) {
        return { valid: false, error: "Invalid offense type" };
    }

    // Validate Victim Information
    if (data.victim) {
        if (typeof data.victim !== 'object') {
            return { valid: false, error: "Victim information must be an object" };
        }
        if (data.victim.gender && !validGenders.includes(data.victim.gender)) {
            return { valid: false, error: "Invalid victim gender" };
        }
        if (data.victim.harmed && !validHarmedStatus.includes(data.victim.harmed)) {
            return { valid: false, error: "Invalid victim harmed status" };
        }
    }

    // Validate Suspect Information
    if (data.suspect) {
        if (typeof data.suspect !== 'object') {
            return { valid: false, error: "Suspect information must be an object" };
        }
        if (data.suspect.gender && !validGenders.includes(data.suspect.gender)) {
            return { valid: false, error: "Invalid suspect gender" };
        }
        if (data.suspect.status && !validSuspectStatus.includes(data.suspect.status)) {
            return { valid: false, error: "Invalid suspect status" };
        }
    }

    // Validate Narrative
    if (data.narrative !== undefined && !isValidString(data.narrative, 10)) {
        return { valid: false, error: "Narrative must be at least 10 characters long" };
    }

    // Validate Status
    if (data.status && !validCaseStatus.includes(data.status)) {
        return { valid: false, error: "Invalid case status" };
    }

    return { valid: true };
};

export const POST = async (req: NextRequest) => {
    try {
        // ✅ Verify user authentication and authorization
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: "You are not authorized to update reports" },
                { status: 403 }
            );
        }

        await connectDb();

        const body = await req.json();
        const { selectedReport } = body;

        // ✅ Validate request body
        if (!selectedReport) {
            return NextResponse.json(
                { error: "Report data is required" },
                { status: 400 }
            );
        }

        // ✅ Parse and validate JSON
        let parsedData;
        try {
            parsedData = typeof selectedReport === 'string'
                ? JSON.parse(selectedReport)
                : selectedReport;
        } catch (parseError) {
            return NextResponse.json(
                { error: "Invalid JSON format in report data" },
                { status: 400 }
            );
        }

        // ✅ Validate MongoDB ObjectId
        if (!parsedData._id || !isValidObjectId(parsedData._id)) {
            return NextResponse.json(
                { error: "Invalid report ID format" },
                { status: 400 }
            );
        }

        // ✅ Validate report data
        const validation = validateReportData(parsedData);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // ✅ Build update object with only provided fields
        const updateFields: any = {};

        // General Information
        if (parsedData.barangay) updateFields.barangay = parsedData.barangay;
        if (parsedData.street) updateFields.street = parsedData.street;
        if (parsedData.typeOfPlace) updateFields.typeOfPlace = parsedData.typeOfPlace;
        if (parsedData.dateReported) updateFields.dateReported = parsedData.dateReported;
        if (parsedData.timeReported) updateFields.timeReported = parsedData.timeReported;
        if (parsedData.dateCommitted) updateFields.dateCommitted = parsedData.dateCommitted;
        if (parsedData.timeCommitted) updateFields.timeCommitted = parsedData.timeCommitted;
        if (parsedData.modeOfReporting) updateFields.modeOfReporting = parsedData.modeOfReporting;
        if (parsedData.stageOfFelony) updateFields.stageOfFelony = parsedData.stageOfFelony;
        if (parsedData.offense) updateFields.offense = parsedData.offense;
        if (parsedData.status) updateFields.status = parsedData.status;
        if (parsedData.suspectMotive !== undefined) updateFields.suspectMotive = parsedData.suspectMotive;
        if (parsedData.narrative) updateFields.narrative = parsedData.narrative;

        // Victim Information (nested object)
        if (parsedData.victim) {
            if (parsedData.victim.name !== undefined) updateFields["victim.name"] = parsedData.victim.name;
            if (parsedData.victim.age !== undefined) updateFields["victim.age"] = parsedData.victim.age;
            if (parsedData.victim.gender !== undefined) updateFields["victim.gender"] = parsedData.victim.gender;
            if (parsedData.victim.harmed !== undefined) updateFields["victim.harmed"] = parsedData.victim.harmed;
            if (parsedData.victim.nationality !== undefined) updateFields["victim.nationality"] = parsedData.victim.nationality;
            if (parsedData.victim.occupation !== undefined) updateFields["victim.occupation"] = parsedData.victim.occupation;
        }

        // Suspect Information (nested object)
        if (parsedData.suspect) {
            if (parsedData.suspect.name !== undefined) updateFields["suspect.name"] = parsedData.suspect.name;
            if (parsedData.suspect.age !== undefined) updateFields["suspect.age"] = parsedData.suspect.age;
            if (parsedData.suspect.gender !== undefined) updateFields["suspect.gender"] = parsedData.suspect.gender;
            if (parsedData.suspect.status !== undefined) updateFields["suspect.status"] = parsedData.suspect.status;
            if (parsedData.suspect.nationality !== undefined) updateFields["suspect.nationality"] = parsedData.suspect.nationality;
            if (parsedData.suspect.occupation !== undefined) updateFields["suspect.occupation"] = parsedData.suspect.occupation;
        }

        // ✅ Check if there are fields to update
        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        // ✅ Find and update the report
        const updatedReport = await ReportsModel.findByIdAndUpdate(
            parsedData._id,
            { $set: updateFields },
            {
                new: true, // Return the updated document
                runValidators: true // Run model validators
            }
        );

        if (!updatedReport) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 }
            );
        }

        console.log("Report updated successfully:", updatedReport._id);

        return NextResponse.json(
            {
                message: "Report updated successfully",
                report: updatedReport
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Error updating report:", error);

        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { error: "Database validation failed", details: error.message },
                { status: 400 }
            );
        }

        // Handle cast errors (invalid ObjectId format that passes regex)
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: "Invalid report ID" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error while updating the report" },
            { status: 500 }
        );
    }
};