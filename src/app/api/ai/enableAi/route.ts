import { NextResponse } from "next/server";
import Settings from "@/utils/models/Settings";
import { connectDb } from "@/utils/utility/ConnectDb";
import { getAuthenticatedUser } from "@/utils/utility/verifyUser";

export const GET = async () => {
    try {
        await connectDb();

        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({ enableAi: true });
        } else {
            // Toggle enableAi
            settings.enableAi = !settings.enableAi;
            await settings.save();
        }
        return NextResponse.json({ enableAi: settings.enableAi });

    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
};
