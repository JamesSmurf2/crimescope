import { NextResponse } from "next/server";
import Settings from "@/utils/models/Settings";
import { connectDb } from "@/utils/utility/ConnectDb";

export const GET = async () => {
    try {
        await connectDb();

        // Find settings
        let settings = await Settings.findOne();

        // If no settings exist, create default
        if (!settings) {
            settings = await Settings.create({ enableAi: true });
        }

        // Return current value
        return NextResponse.json(settings.enableAi);

    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
};
