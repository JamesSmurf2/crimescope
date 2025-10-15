import { NextRequest, NextResponse } from "next/server";
import Report from "@/utils/models/Reports.model";
import { connectDb } from "@/utils/utility/ConnectDb";

export const POST = async (req: NextRequest) => {
    try {
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
            location, // ✅ should be { lat, lng }
        } = body;

        // ✅ Validate required data
        if (!barangay || !offense || !victim || !suspect || !location) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // ✅ Convert to GeoJSON (lng, lat order)
        const geoLocation = {
            type: "Point",
            coordinates: [location.lng, location.lat],
        };

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
            suspectMotive,
            narrative,
            status: status || "Solved",
            location: geoLocation, // ✅ use GeoJSON
        });
   

        return NextResponse.json(
            { message: "Crime report submitted successfully", report },
            { status: 201 }
        );
    } catch (error) {
        console.error("❌ Error submitting report:", error);
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
};
