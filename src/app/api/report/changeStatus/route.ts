import { NextResponse } from "next/server";
import { connectDb } from "@/utils/utility/ConnectDb";
import { NextRequest } from "next/server";
import ReportsModel from "@/utils/models/Reports.model";

export const POST = async (req: NextRequest) => {
    try {
        await connectDb();

        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: "Report ID and status are required" },
                { status: 400 }
            );
        }

        const existing = await ReportsModel.findOne({ _id: id });

        if (!existing) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 }
            );
        }

        existing.status = status;
        await existing.save(); // <-- important: persist changes

        return NextResponse.json(
            { message: "Status updated successfully", report: existing },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating report status:", error);
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
};
