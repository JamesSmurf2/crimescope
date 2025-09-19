import { NextResponse } from "next/server";
import { connectDb } from "@/utils/utility/ConnectDb";
import ReportsModel from "@/utils/models/Reports.model";

// DELETE all reports
export const GET = async () => {
    try {
        await connectDb();

        const result = await ReportsModel.deleteMany({}); // remove all docs

        return NextResponse.json(
            { message: "All reports deleted successfully", deletedCount: result.deletedCount },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting reports:", error);
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
};
