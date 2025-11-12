// app/api/analyze/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import Settings from "@/utils/models/Settings";
import { connectDb } from "@/utils/utility/ConnectDb"; // assuming you have a DB connection util

const genAi = new GoogleGenAI({
    apiKey: process.env.NEXT_GEMINI_API_KEY,
});

export async function POST(request: Request) {
    try {
        await connectDb(); // make sure DB is connected

        // Check AI settings
        const settings = await Settings.findOne({});
        if (!settings?.enableAi) {
            return NextResponse.json(
                { success: false, error: "AI functionality is disabled in settings." },
                { status: 403 }
            );
        }

        const { reports, question } = await request.json();

        const simplifiedReports = reports.map((r: any) => ({
            barangay: r.barangay,
            offense: r.offense,
            dateCommitted: r.dateCommitted,
            timeCommitted: r.timeCommitted,
            status: r.status,
            suspectGender: r?.suspect?.gender,
            victimGender: r?.victim?.gender,
            typeOfPlace: r.typeOfPlace,
            suspectMotive: r.suspectMotive,
        }));

        const formattedData = JSON.stringify(simplifiedReports, null, 2);

        const prompt = question
            ? `
Question: "${question}"

Simplified Crime Reports:
${formattedData}
`
            : `
You are an AI crime analyst.

Analyze the following ${reports.length} simplified barangay crime reports strictly based on the data provided. 
Summarize:

1. Most common offenses
2. Barangays with the highest number of crimes
3. Common motives and types of places
4. Solved vs unsolved ratio
5. Noticeable patterns or insights strictly visible from the data

Simplified Crime Reports:
${formattedData}
`;

        const response = await genAi.models.generateContent({
            model: "gemini-2.0-flash",
            // model: "gemini-2.5-pro",
            // model: "gemini-2.0",
            contents: prompt,
            // contents: "Hello what is 1+1",
        });

        const text = response.text;

        return NextResponse.json({ success: true, analysis: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to analyze reports" },
            { status: 500 }
        );
    }
}
