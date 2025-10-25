import { NextResponse } from "next/server";
import { connectDb } from "@/utils/utility/ConnectDb";
import User from "@/utils/models/User.model";

export const GET = async () => {
    try {
        await connectDb();

        const officials = await User.find({ role: "official" })
            .select('-password')

        return NextResponse.json(officials, { status: 200 });
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};
