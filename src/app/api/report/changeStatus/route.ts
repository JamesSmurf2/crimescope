import { NextResponse, NextRequest } from "next/server";
import { connectDb } from "@/utils/utility/ConnectDb";
import { getAuthenticatedUser } from "@/utils/utility/verifyUser";
import Report from "@/utils/models/Reports.model";
import Logs from "@/utils/models/Logs.model";

// ✅ Helper Validators
const isValidString = (value: any, minLength: number = 1): boolean =>
    typeof value === "string" && value.trim().length >= minLength;

const isValidDate = (dateString: any): boolean => {
    if (!dateString || typeof dateString !== "string") return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

const isValidObjectId = (id: any): boolean =>
    typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

const validBarangays = [
    "Almanza Dos", "Almanza Uno", "B.F. CAA International Village", "Daniel Fajardo",
    "Elias Aldana", "Ilaya", "Manuyo Uno", "Manuyo Dos", "Pamplona Uno", "Pamplona Dos",
    "Pamplona Tres", "Pilar", "Pulang Lupa Uno", "Pulang Lupa Dos", "Talon Uno",
    "Talon Dos", "Talon Tres", "Talon Cuatro", "Talon Singko", "Zapote",
];

// const validOffenses = [
//     "Murder", "Homicide", "Rape", "Physical Injury", "Robbery", "Theft",
//     "Carnapping", "Cattle Rustling", "Drug Offense", "Illegal Firearms",
//     "Child Abuse", "Cybercrime", "Estafa", "Direct Assault", "Grave Threats",
//     "Other Forms of Trespass", "Violence Against Women & Children (VAWC)",
//     "Illegal Logging", "Reckless Driving", "Illegal Parking", "Overspeeding",
//     "Driving Without License", "Road Accident", "Curfew Violation", "Public Disturbance",
//     "Littering", "Noise Complaint", "Illegal Vending", "Drinking in Public",
//     "Alarms and Scandals", "Unjust Vexations", "Light Threats", "Malicious Mischief",
// ];

const validTypesOfPlace = ["Along the Street", "Residential", "Commercial"];
const validModesOfReporting = ["N/A", "In Person", "Phone Call", "Walk In"];
const validStagesOfFelony = ["N/A", "Attempted", "Frustrated", "Consummated"];
const validGenders = ["N/A", "Male", "Female"];
const validHarmedStatus = ["N/A", "Harmed", "Unharmed"];
const validSuspectStatus = ["N/A", "Arrested", "Detained", "At Large"];
const validCCTVStatus = ["Yes", "No", "Unknown"]; // ADD THIS LINE
const validCaseStatus = ["Solved", "Cleared", "Unsolved"];

// ✅ Main Handler

// ✅ Add this helper function to detect changes
const detectChanges = (oldData: any, newData: any) => {
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];

    const compareFields = (old: any, updated: any, prefix = '') => {
        for (const key in updated) {
            if (key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') continue;

            const fieldPath = prefix ? `${prefix}.${key}` : key;

            if (typeof updated[key] === 'object' && updated[key] !== null && !Array.isArray(updated[key])) {
                // Nested object (like victim, suspect)
                compareFields(old[key] || {}, updated[key], fieldPath);
            } else {
                // Direct comparison
                const oldValue = old[key];
                const newValue = updated[key];

                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    changes.push({
                        field: fieldPath,
                        oldValue: String(oldValue || 'N/A'),
                        newValue: String(newValue || 'N/A')
                    });
                }
            }
        }
    };

    compareFields(oldData, newData);
    return changes;
};

export const POST = async (req: NextRequest) => {
    try {
        const user = await getAuthenticatedUser();
        if (!user)
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        if (user.role !== "official")
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        await connectDb();
        const body = await req.json();
        const { oldReportData, selectedReport } = body;

        console.log(oldReportData, selectedReport)

        if (!selectedReport)
            return NextResponse.json({ error: "Report data missing" }, { status: 400 });

        let data = typeof selectedReport === "string" ? JSON.parse(selectedReport) : selectedReport;
        if (!data._id || !isValidObjectId(data._id))
            return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });

        // ✅ Case-insensitive & flexible validation
        if (
            data.barangay &&
            !validBarangays.some(b => b.toLowerCase() === data.barangay.toLowerCase())
        )
            return NextResponse.json({ error: "Invalid barangay" }, { status: 400 });

        if (
            data.typeOfPlace &&
            !validTypesOfPlace.some(t => t.toLowerCase() === data.typeOfPlace.toLowerCase())
        )
            return NextResponse.json({ error: "Invalid type of place" }, { status: 400 });

        if (
            data.stageOfFelony &&
            !validStagesOfFelony.some(s => s.toLowerCase() === data.stageOfFelony.toLowerCase())
        )
            return NextResponse.json({ error: "Invalid stage of felony" }, { status: 400 });

        // ✅ Normalize dateCommitted if using M/D/YYYY
        if (data.dateCommitted && data.dateCommitted.includes("/")) {
            const [month, day, year] = data.dateCommitted.split("/");
            data.dateCommitted = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }

        if (data.dateReported && !isValidDate(data.dateReported))
            return NextResponse.json({ error: "Invalid date reported" }, { status: 400 });

        if (data.dateCommitted && !isValidDate(data.dateCommitted))
            return NextResponse.json({ error: "Invalid date committed" }, { status: 400 });

        // ✅ Allow 19:00:00 or 19:00
        const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;
        if (data.timeReported && !timeRegex.test(data.timeReported))
            return NextResponse.json({ error: "Invalid time reported" }, { status: 400 });
        if (data.timeCommitted && !timeRegex.test(data.timeCommitted))
            return NextResponse.json({ error: "Invalid time committed" }, { status: 400 });

        if (data.modeOfReporting && !validModesOfReporting.includes(data.modeOfReporting))
            return NextResponse.json({ error: "Invalid mode of reporting" }, { status: 400 });

        if (data.cctvAvailable && !validCCTVStatus.includes(data.cctvAvailable))
            return NextResponse.json({ error: "Invalid CCTV status" }, { status: 400 });

        if (data.status && !validCaseStatus.includes(data.status))
            return NextResponse.json({ error: "Invalid case status" }, { status: 400 });

        // ✅ Build dynamic update object
        const updateFields: any = {};
        const generalFields = [
            "barangay", "street", "typeOfPlace", "dateReported", "timeReported",
            "dateCommitted", "timeCommitted", "modeOfReporting", "stageOfFelony",
            "offense", "status", "suspectMotive", "narrative", "cctvAvailable" // ADD cctvAvailable HERE
        ];
        generalFields.forEach((f) => {
            if (data[f] !== undefined) updateFields[f] = data[f];
        });

        // Victim
        if (data.victim) {
            for (const key in data.victim) {
                updateFields[`victim.${key}`] = data.victim[key];
            }
        }

        // Suspect
        if (data.suspect) {
            for (const key in data.suspect) {
                updateFields[`suspect.${key}`] = data.suspect[key];
            }
        }

        // ✅ Perform update
        const updatedReport = await Report.findByIdAndUpdate(
            data._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedReport)
            return NextResponse.json({ error: "Report not found" }, { status: 404 });

        // await Logs.create({
        //     adminId: user._id,
        //     blotterNo: updatedReport.blotterNo,
        //     action: "Updated Report",
        //     reportId: updatedReport._id,
        //     offense: updatedReport.offense,
        //     barangay: updatedReport.barangay,
        // });

        // ✅ New code with change tracking
        const changes = detectChanges(oldReportData, selectedReport);

        await Logs.create({
            adminId: user._id,
            blotterNo: updatedReport.blotterNo,
            action: "Updated Report",
            reportId: updatedReport._id,
            offense: updatedReport.offense,
            barangay: updatedReport.barangay,
            changes: changes,                    // ✅ Add detected changes
            changeCount: changes.length          // ✅ Add count of changes
        });

        return NextResponse.json(
            { message: "Report updated successfully", report: updatedReport },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating report:", error);
        if (error.name === "ValidationError")
            return NextResponse.json({ error: "Database validation failed", details: error.message }, { status: 400 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};
