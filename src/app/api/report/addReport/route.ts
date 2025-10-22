import { NextRequest, NextResponse } from "next/server";
import Report from "@/utils/models/Reports.model";
import Logs from "@/utils/models/Logs.model";
import { connectDb } from "@/utils/utility/ConnectDb";
import { getAuthenticatedUser } from "@/utils/utility/verifyUser";

// ✅ Generate blotter number inside backend
const generateBlotterNumber = async (): Promise<string> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const prefix = `${year}-${month}`;

    // Find reports with this prefix
    const reports = await Report.find({ blotterNo: { $regex: `^${prefix}` } });

    // Determine highest number
    let maxNumber = 0;
    for (const r of reports) {
        const match = r.blotterNo.match(/-(\d{4})$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) maxNumber = num;
        }
    }

    const nextNumber = String(maxNumber + 1).padStart(4, "0");
    return `${prefix}-${nextNumber}`;
};

// ✅ Validation helpers
const isValidString = (value: any, minLength: number = 1): boolean =>
    typeof value === "string" && value.trim().length >= minLength;

const isValidDate = (dateString: any): boolean => {
    if (!dateString || typeof dateString !== "string") return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

const isValidTime = (timeString: any): boolean => {
    if (!timeString || typeof timeString !== "string") return false;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(timeString);
};

const isValidLocation = (location: any): boolean => {
    if (!location || typeof location !== "object") return false;
    const { lat, lng } = location;
    return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
};

// Constants (unchanged)
const validBarangays = [
    "Almanza Dos", "Almanza Uno", "B.F. CAA International Village", "Daniel Fajardo",
    "Elias Aldana", "Ilaya", "Manuyo Uno", "Manuyo Dos", "Pamplona Uno", "Pamplona Dos",
    "Pamplona Tres", "Pilar", "Pulang Lupa Uno", "Pulang Lupa Dos", "Talon Uno",
    "Talon Dos", "Talon Tres", "Talon Cuatro", "Talon Singko", "Zapote",
];

const validOffenses = [
    "Murder", "Homicide", "Rape", "Physical Injury", "Robbery", "Theft",
    "Carnapping", "Cattle Rustling", "Drug Offense", "Illegal Firearms",
    "Child Abuse", "Cybercrime", "Estafa", "Direct Assault", "Grave Threats",
    "Other Forms of Trespass", "Violence Against Women & Children (VAWC)",
    "Illegal Logging", "Reckless Driving", "Illegal Parking", "Overspeeding",
    "Driving Without License", "Road Accident", "Curfew Violation", "Public Disturbance",
    "Littering", "Noise Complaint", "Illegal Vending", "Drinking in Public",
    "Alarms and Scandals", "Unjust Vexations", "Light Threats", "Malicious Mischief",
];

const validTypesOfPlace = ["Along the Street", "Residential", "Commercial"];
// const validModesOfReporting = ["N/A", "In Person", "Phone Call", "Walk In"];
const validStagesOfFelony = ["N/A", "Attempted", "Frustrated", "Consummated"];
const validGenders = ["N/A", "Male", "Female"];
const validHarmedStatus = ["N/A", "Harmed", "Unharmed"];
const validSuspectStatus = ["N/A", "Arrested", "Detained", "At Large"];
const validCaseStatus = ["Solved", "Cleared", "Unsolved"];

export const POST = async (req: NextRequest) => {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDb();
        const body = await req.json();
        const { report } = body

        const {
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
        } = report;

        // ✅ Auto-generate blotterNo here
        const blotterNo = await generateBlotterNumber();

        // ✅ Validate barangay (case-insensitive)
        if (
            !isValidString(barangay) ||
            !validBarangays.some(b => b.toLowerCase() === barangay.toLowerCase())
        ) {
            return NextResponse.json({ error: "Invalid barangay" }, { status: 400 });
        }

        // ✅ Validate typeOfPlace (case-insensitive)
        if (
            !isValidString(typeOfPlace) ||
            !validTypesOfPlace.some(t => t.toLowerCase() === typeOfPlace.toLowerCase())
        ) {
            return NextResponse.json({ error: "Invalid type of place" }, { status: 400 });
        }

        // ✅ Validate dateReported
        if (!isValidDate(dateReported))
            return NextResponse.json({ error: "Invalid date reported" }, { status: 400 });

        // ✅ Validate timeReported (allows both '2:30:00' and '02:30:00')
        if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeReported))
            return NextResponse.json({ error: "Invalid time reported" }, { status: 400 });

        // ✅ Normalize and validate dateCommitted (accepts both 1/5/2025 and 2025-01-05)
        let normalizedDateCommitted = dateCommitted;
        if (dateCommitted.includes("/")) {
            const [month, day, year] = dateCommitted.split("/");
            normalizedDateCommitted = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
        if (!isValidDate(normalizedDateCommitted))
            return NextResponse.json({ error: "Invalid date committed" }, { status: 400 });

        // ✅ Validate timeCommitted (same rule)
        if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeCommitted))
            return NextResponse.json({ error: "Invalid time committed" }, { status: 400 });

        // ✅ Validate modeOfReporting
        // if (!isValidString(modeOfReporting) || !validModesOfReporting.includes(modeOfReporting))
        //     return NextResponse.json({ error: "Invalid mode of reporting" }, { status: 400 });

        // ✅ Validate stageOfFelony (case-insensitive)
        if (
            !isValidString(stageOfFelony) ||
            !validStagesOfFelony.some(s => s.toLowerCase() === stageOfFelony.toLowerCase())
        ) {
            return NextResponse.json({ error: "Invalid stage of felony" }, { status: 400 });
        }

        // ✅ Validate offense
        if (!isValidString(offense) || !validOffenses.includes(offense))
            return NextResponse.json({ error: "Invalid offense" }, { status: 400 });

        // ✅ Validate location object
        const isValidLocation = (loc: any) =>
            loc &&
            typeof loc.lat === "number" &&
            typeof loc.lng === "number" &&
            !isNaN(loc.lat) &&
            !isNaN(loc.lng);

        if (!isValidLocation(location))
            return NextResponse.json({ error: "Invalid location" }, { status: 400 });

        // ✅ Validate narrative
        if (!isValidString(narrative, 10))
            return NextResponse.json({ error: "Narrative too short" }, { status: 400 });

        // ✅ Validate case status
        const finalStatus = status || "Solved";
        if (!validCaseStatus.includes(finalStatus))
            return NextResponse.json({ error: "Invalid case status" }, { status: 400 });

        const geoLocation = { type: "Point", coordinates: [location.lng, location.lat] };

        const reportCreated = await Report.create({
            blotterNo,
            dateEncoded: new Date().toLocaleString(),
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

        await Logs.create({
            adminId: user._id,
            blotterNo,
            action: "Created Report",
            reportId: reportCreated._id,
            offense,
            barangay,
        });

        return NextResponse.json(
            {
                message: "Crime report submitted successfully"
                , reportCreated
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("❌ Error submitting report:", error);
        if (error.name === "ValidationError")
            return NextResponse.json({ error: "Database validation failed", details: error.message }, { status: 400 });
        if (error.code === 11000)
            return NextResponse.json({ error: "Duplicate blotter number" }, { status: 409 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};
