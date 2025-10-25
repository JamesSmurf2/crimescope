import { NextResponse } from "next/server";
import { connectDb } from "@/utils/utility/ConnectDb";
import Logs from "@/utils/models/Logs.model";

import '../../../../utils/models/User.model'
import '../../../../utils/models/Reports.model'

export const GET = async () => {
    try {
        await connectDb();

        const officials = await Logs.find()
            .populate('adminId', 'username')
            .populate('reportId', 'blotterNo') 
            .sort({ createdAt: -1 })

        return NextResponse.json(officials, { status: 200 });
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};