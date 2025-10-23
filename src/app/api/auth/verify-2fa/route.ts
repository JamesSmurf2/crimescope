import { NextResponse } from "next/server";
import User from "@/utils/models/User.model";
import { connectDb } from "@/utils/utility/ConnectDb";
import jwt from "jsonwebtoken";


const generateToken = ({ id }: { id: string }) => {
    const token = jwt.sign({ id }, process.env.NEXT_JWT_SECRET!, {
        expiresIn: "7d",
    });
    return token;
};

export const POST = async (req: Request) => {
    try {
        await connectDb();
        const { userId, code } = await req.json();

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

        if (!user.twoFACode || new Date() > user.twoFAExpires)
            return NextResponse.json({ error: "Code expired" }, { status: 400 });

        if (user.twoFACode !== code)
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });

        // ✅ Clear code after success
        user.twoFACode = undefined;
        user.twoFAExpires = undefined;
        await user.save();

        const token = generateToken({ id: user._id });

        const response = NextResponse.json({ success: true, user: { _id: user._id, username: user.username, role: user.role } });
        response.cookies.set("jwt", token, {
            httpOnly: true,
            secure: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 14,
        });

        return response;

        // Continue to your existing login logic (create session/cookie)
        return NextResponse.json({ message: "2FA success", success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
};
