
import { NextRequest, NextResponse } from "next/server";
import Report from "@/utils/models/Reports.model";

import Logs from "@/utils/models/Logs.model";

import { connectDb } from "@/utils/utility/ConnectDb";
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

const isValidLocation = (location: any): boolean => {
    if (!location || typeof location !== 'object') return false;
    const { lat, lng } = location;
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
    );
};

const validBarangays = [
    "Almanza Dos", "Almanza Uno", "B.F. CAA International Village", "Daniel Fajardo",
    "Elias Aldana", "Ilaya", "Manuyo Uno", "Manuyo Dos", "Pamplona Uno", "Pamplona Dos",
    "Pamplona Tres", "Pilar", "Pulang Lupa Uno", "Pulang Lupa Dos", "Talon Uno",
    "Talon Dos", "Talon Tres", "Talon Cuatro", "Talon Singko", "Zapote",
];

const validOffenses = [
    // Index Crimes
    "Murder", "Homicide", "Rape", "Physical Injury", "Robbery", "Theft", "Carnapping", "Cattle Rustling",
    // Non-Index Crimes
    "Drug Offense", "Illegal Firearms", "Child Abuse", "Cybercrime", "Estafa", "Direct Assault",
    "Grave Threats", "Other Forms of Trespass", "Violence Against Women & Children (VAWC)", "Illegal Logging",
    // Traffic Violations
    "Reckless Driving", "Illegal Parking", "Overspeeding", "Driving Without License", "Road Accident",
    // Ordinance Violations
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

        const {
            blotterNo,
            dateEncoded,
            barangay,
            street,
            typeOfPlace,
            dateReported,
            timeReported,
            dateCommitted,
            timeCommitted,
            modeOfReporting,
            stageOfFelony,
            offense,
            victim,
            suspect,
            suspectMotive,
            narrative,
            status,
            location,
        } = body;

        // ✅ Validate Blotter Number
        if (!isValidString(blotterNo)) {
            return NextResponse.json(
                { error: "Invalid blotter number" },
                { status: 400 }
            );
        }

        // ✅ Validate Date Encoded
        if (!isValidString(dateEncoded)) {
            return NextResponse.json(
                { error: "Date encoded is required" },
                { status: 400 }
            );
        }

        // ✅ Validate Barangay
        if (!isValidString(barangay) || !validBarangays.includes(barangay)) {
            return NextResponse.json(
                { error: "Invalid barangay. Please select a valid barangay." },
                { status: 400 }
            );
        }

        // ✅ Validate Street
        if (!isValidString(street)) {
            return NextResponse.json(
                { error: "Street is required" },
                { status: 400 }
            );
        }

        // ✅ Validate Type of Place
        if (!isValidString(typeOfPlace) || !validTypesOfPlace.includes(typeOfPlace)) {
            return NextResponse.json(
                { error: "Invalid type of place" },
                { status: 400 }
            );
        }

        // ✅ Validate Date Reported
        if (!isValidDate(dateReported)) {
            return NextResponse.json(
                { error: "Invalid date reported" },
                { status: 400 }
            );
        }

        // ✅ Validate Time Reported
        if (!isValidTime(timeReported)) {
            return NextResponse.json(
                { error: "Invalid time reported. Format should be HH:MM" },
                { status: 400 }
            );
        }

        // ✅ Validate Date Committed
        if (!isValidDate(dateCommitted)) {
            return NextResponse.json(
                { error: "Invalid date committed" },
                { status: 400 }
            );
        }

        // ✅ Validate Time Committed
        if (!isValidTime(timeCommitted)) {
            return NextResponse.json(
                { error: "Invalid time committed. Format should be HH:MM" },
                { status: 400 }
            );
        }

        // ✅ Validate Mode of Reporting
        if (!isValidString(modeOfReporting) || !validModesOfReporting.includes(modeOfReporting)) {
            return NextResponse.json(
                { error: "Invalid mode of reporting" },
                { status: 400 }
            );
        }

        // ✅ Validate Stage of Felony
        if (!isValidString(stageOfFelony) || !validStagesOfFelony.includes(stageOfFelony)) {
            return NextResponse.json(
                { error: "Invalid stage of felony" },
                { status: 400 }
            );
        }

        // ✅ Validate Offense
        if (!isValidString(offense) || !validOffenses.includes(offense)) {
            return NextResponse.json(
                { error: "Invalid offense type" },
                { status: 400 }
            );
        }

        // ✅ Validate Victim Information
        if (!victim || typeof victim !== 'object') {
            return NextResponse.json(
                { error: "Victim information is required" },
                { status: 400 }
            );
        }

        // Optional: Validate victim fields if provided
        if (victim.gender && !validGenders.includes(victim.gender)) {
            return NextResponse.json(
                { error: "Invalid victim gender" },
                { status: 400 }
            );
        }

        if (victim.harmed && !validHarmedStatus.includes(victim.harmed)) {
            return NextResponse.json(
                { error: "Invalid victim harmed status" },
                { status: 400 }
            );
        }

        // ✅ Validate Suspect Information
        if (!suspect || typeof suspect !== 'object') {
            return NextResponse.json(
                { error: "Suspect information is required" },
                { status: 400 }
            );
        }

        // Optional: Validate suspect fields if provided
        if (suspect.gender && !validGenders.includes(suspect.gender)) {
            return NextResponse.json(
                { error: "Invalid suspect gender" },
                { status: 400 }
            );
        }

        if (suspect.status && !validSuspectStatus.includes(suspect.status)) {
            return NextResponse.json(
                { error: "Invalid suspect status" },
                { status: 400 }
            );
        }

        // ✅ Validate Location
        if (!isValidLocation(location)) {
            return NextResponse.json(
                { error: "Invalid location coordinates. Latitude must be between -90 and 90, longitude between -180 and 180." },
                { status: 400 }
            );
        }

        // ✅ Validate Narrative
        if (!isValidString(narrative, 10)) {
            return NextResponse.json(
                { error: "Narrative must be at least 10 characters long" },
                { status: 400 }
            );
        }

        // ✅ Validate Status
        const finalStatus = status || "Solved";
        if (!validCaseStatus.includes(finalStatus)) {
            return NextResponse.json(
                { error: "Invalid case status" },
                { status: 400 }
            );
        }

        // ✅ Convert to GeoJSON (lng, lat order)
        const geoLocation = {
            type: "Point",
            coordinates: [location.lng, location.lat],
        };



        // ✅ Create Report
        const report = await Report.create({
            blotterNo,
            dateEncoded,
            barangay,
            street,
            typeOfPlace,
            dateReported,
            timeReported,
            dateCommitted,
            timeCommitted,
            modeOfReporting,
            stageOfFelony,
            offense,
            victim,
            suspect,
            suspectMotive: suspectMotive || "",
            narrative,
            status: finalStatus,
            location: geoLocation,
        });

        //Create logs here
        await Logs.create({
            adminId: user._id,
            blotterNo,
            action: "Created Report",
            reportId: report._id,
            offense,
            barangay,
        });

        return NextResponse.json(
            {
                message: "Crime report submitted successfully",
                report
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("❌ Error submitting report:", error);

        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { error: "Database validation failed", details: error.message },
                { status: 400 }
            );
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "A report with this blotter number already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};