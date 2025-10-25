// import { connectDb } from "@/utils/utility/ConnectDb"
// import User from "@/utils/models/User.model"
// import bcrypt from 'bcrypt'
// import { NextResponse } from "next/server"

// import jwt from 'jsonwebtoken'

// const generateToken = ({ id }: { id: string }) => {
//     const token = jwt.sign(
//         { id: id },
//         process.env.NEXT_JWT_SECRET!,
//         { expiresIn: '7d' }
//     )

//     return token
// }

// export const POST = async (request: Request) => {
//     await connectDb()

//     const body = await request.json()
//     const { username, password } = body

//     const ifExist = await User.findOne({ username: username })
//     if (!ifExist) return NextResponse.json("User doesn't exist.", { status: 400 })
//     const isMatched = await bcrypt.compare(password, ifExist.password)
//     if (!isMatched) return NextResponse.json("Password does not match.", { status: 400 })

//     const token = generateToken({ id: ifExist._id })

//     const response = NextResponse.json(ifExist)

//     response.cookies.set('jwt', token, {
//         httpOnly: true,
//         secure: true,
//         path: '/',
//         maxAge: 60 * 60 * 24 * 14
//     })

//     return response
// }

import { connectDb } from "@/utils/utility/ConnectDb";
import User from "@/utils/models/User.model";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const generateToken = ({ id }: { id: string }) => {
    const token = jwt.sign({ id }, process.env.NEXT_JWT_SECRET!, {
        expiresIn: "7d",
    });
    return token;
};

export const POST = async (request: Request) => {
    try {
        await connectDb();

        const body = await request.json();
        const { username, password } = body;

        const user = await User.findOne({ username });
        if (!user)
            return NextResponse.json({ error: "User doesn't exist." }, { status: 400 });

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched)
            return NextResponse.json({ error: "Password does not match." }, { status: 400 });

        // If user is admin bypass
        if (user.role === "admin") {
            const token = generateToken({ id: user._id });

            const response = NextResponse.json({ success: true, user: { _id: user._id, username: user.username, role: user.role } });
            response.cookies.set("jwt", token, {
                httpOnly: true,
                secure: true,
                path: "/",
                maxAge: 60 * 60 * 24 * 14,
            });

            return response;
        }

        // Pag false yung enableTwoFA nung user, hindi na gagana yung nasa verify 2FA
        if (user.enableTwoFA === false) {
            const token = generateToken({ id: user._id });

            const response = NextResponse.json({ success: true, user: { _id: user._id, username: user.username, role: user.role } });
            response.cookies.set("jwt", token, {
                httpOnly: true,
                secure: true,
                path: "/",
                maxAge: 60 * 60 * 24 * 14,
            });

            return response;
        }

        // Generate 6-digit code for 2FA
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save 2FA code & expiry to user record
        user.twoFACode = code;
        user.twoFAExpires = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 mins
        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER!,
                pass: process.env.EMAIL_PASS!,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER!,
            to: user.email,
            subject: "Your 2FA Verification Code",
            text: `Your verification code is ${code}. It will expire in 5 minutes.`,
        });

        // Inform frontend to ask for 2FA code
        return NextResponse.json({
            message: "2FA code sent to email",
            step: "2fa",
            userId: user._id,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
};
