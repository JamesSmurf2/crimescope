import { NextResponse } from "next/server";
import { connectDb } from "@/utils/utility/ConnectDb";
import { NextRequest } from "next/server";
import ReportsModel from "@/utils/models/Reports.model";
import { getAuthenticatedUser } from "@/utils/utility/verifyUser";

export const POST = async (req: NextRequest) => {
    try {
        const user = await getAuthenticatedUser();

        if (user?.role !== 'admin') {
            return NextResponse.json("You are not Authorized", { status: 401 });
        }

        await connectDb();

        const body = await req.json();
        const { selectedReport } = body;
        const parsedData = JSON.parse(selectedReport);

        // Find and update the report
        const updatedReport = await ReportsModel.findByIdAndUpdate(
            parsedData._id,
            {
                $set: {
                    // General Information
                    barangay: parsedData.barangay,
                    street: parsedData.street,
                    typeOfPlace: parsedData.typeOfPlace,
                    dateReported: parsedData.dateReported,
                    timeReported: parsedData.timeReported,
                    dateCommitted: parsedData.dateCommitted,
                    timeCommitted: parsedData.timeCommitted,
                    modeOfReporting: parsedData.modeOfReporting,
                    stageOfFelony: parsedData.stageOfFelony,
                    offense: parsedData.offense,
                    status: parsedData.status,
                    suspectMotive: parsedData.suspectMotive,
                    narrative: parsedData.narrative,

                    // Victim Information (nested object)
                    "victim.name": parsedData.victim?.name,
                    "victim.age": parsedData.victim?.age,
                    "victim.gender": parsedData.victim?.gender,
                    "victim.harmed": parsedData.victim?.harmed,
                    "victim.nationality": parsedData.victim?.nationality,
                    "victim.occupation": parsedData.victim?.occupation,

                    // Suspect Information (nested object)
                    "suspect.name": parsedData.suspect?.name,
                    "suspect.age": parsedData.suspect?.age,
                    "suspect.gender": parsedData.suspect?.gender,
                    "suspect.status": parsedData.suspect?.status,
                    "suspect.nationality": parsedData.suspect?.nationality,
                    "suspect.occupation": parsedData.suspect?.occupation,
                }
            },
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
    } catch (error) {
        console.error("Error updating report status:", error);
        return NextResponse.json(
            { error: "Something went wrong while updating the report." },
            { status: 500 }
        );
    }
};