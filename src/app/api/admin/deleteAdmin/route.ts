import { NextResponse } from "next/server";
import { connectDb } from "@/utils/utility/ConnectDb";
import User from "@/utils/models/User.model";
import { getAuthenticatedUser } from "@/utils/utility/verifyUser";

export const POST = async (req: Request) => {
    try {
        await connectDb();

        const { id } = await req.json();

        const authUser = await getAuthenticatedUser();
        if (!authUser) {
            return NextResponse.json(
                { message: "User is not authenticated or token is invalid." },
                { status: 401 }
            );
        }

        const loggedInUser = await User.findById(authUser._id);
        if (!loggedInUser) {
            return NextResponse.json(
                { message: "User not found or invalid token." },
                { status: 401 }
            );
        }

        if (loggedInUser.role !== "admin") {
            return NextResponse.json(
                { message: "Access denied. Insufficient privileges." },
                { status: 403 }
            );
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return NextResponse.json(
                { message: "User not found or already deleted." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Admin deleted successfully.", deletedUser },
            { status: 200 }
        );

    } catch (error) {
        console.error("❌ Error deleting admin:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};
