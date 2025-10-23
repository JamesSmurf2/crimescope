import { NextResponse } from "next/server";
import { connectDb } from "@/utils/utility/ConnectDb";
import User from "@/utils/models/User.model";

export const POST = async (req: Request) => {
    try {
        await connectDb();

        const body = await req.json();
        const { adminId, currentStatus } = body;

        if (!adminId) {
            return NextResponse.json({ success: false, message: "Missing adminId" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            adminId,
            { enableTwoFA: currentStatus },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `2FA ${currentStatus ? "enabled" : "disabled"} successfully`,
            user: updatedUser
        });

    } catch (error) {
        console.error("Error toggling 2FA:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
};
