import { NextRequest, NextResponse } from "next/server";
import Report from "@/utils/models/Reports.model";
import Logs from "@/utils/models/Logs.model";
import { connectDb } from "@/utils/utility/ConnectDb";
import { getAuthenticatedUser } from "@/utils/utility/verifyUser";

// Generate blotter number
const generateBlotterNumber = async (): Promise<string> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `${year}-${month}`;

    const reports = await Report.find({ blotterNo: { $regex: `^${prefix}` } });

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

export const POST = async (req: NextRequest) => {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (user.role !== "official") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDb();
        const body = await req.json();
        const { report } = body;

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

        // Auto-generate blotterNo
        const blotterNo = await generateBlotterNumber();

        // Only check if required fields exist (basic validation)
        if (!barangay || typeof barangay !== "string" || !barangay.trim()) {
            return NextResponse.json({ error: "Barangay is required" }, { status: 400 });
        }

        if (!offense || typeof offense !== "string" || !offense.trim()) {
            return NextResponse.json({ error: "Offense is required" }, { status: 400 });
        }

        if (!dateReported) {
            return NextResponse.json({ error: "Date reported is required" }, { status: 400 });
        }

        if (!timeReported) {
            return NextResponse.json({ error: "Time reported is required" }, { status: 400 });
        }

        if (!dateCommitted) {
            return NextResponse.json({ error: "Date committed is required" }, { status: 400 });
        }

        if (!timeCommitted) {
            return NextResponse.json({ error: "Time committed is required" }, { status: 400 });
        }

        // Normalize dateCommitted if it's in MM/DD/YYYY format
        let normalizedDateCommitted = dateCommitted;
        if (typeof dateCommitted === "string" && dateCommitted.includes("/")) {
            const [month, day, year] = dateCommitted.split("/");
            normalizedDateCommitted = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }

        // Basic location check (just verify it exists and has lat/lng)
        if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
            return NextResponse.json({ error: "Valid location is required" }, { status: 400 });
        }

        const geoLocation = { type: "Point", coordinates: [location.lng, location.lat] };

        // Use defaults for missing optional fields
        const reportCreated = await Report.create({
            blotterNo,
            dateEncoded: new Date().toLocaleString(),
            barangay: barangay.trim(),
            street: street || "",
            typeOfPlace: typeOfPlace || "Residential",
            dateReported,
            timeReported,
            dateCommitted: normalizedDateCommitted,
            timeCommitted,
            modeOfReporting: modeOfReporting || "Walk In",
            stageOfFelony: stageOfFelony || "N/A",
            offense: offense.trim(),
            victim: victim || {},
            suspect: suspect || {},
            suspectMotive: suspectMotive || "",
            narrative: narrative || "",
            status: status || "Unsolved",
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
                message: "Crime report submitted successfully",
                reportCreated
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