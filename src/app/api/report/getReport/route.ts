import { NextRequest, NextResponse } from "next/server";
import Report from "@/utils/models/Reports.model";
import { connectDb } from "@/utils/utility/ConnectDb";

export const GET = async (req: NextRequest) => {
    try {
        await connectDb();

        const reports = await Report.find().sort({ createdAt: -1 });

        return NextResponse.json({ reports }, { status: 200 });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
};