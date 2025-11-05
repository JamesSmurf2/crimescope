// app/api/analyze/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const genAi = new GoogleGenAI({
    apiKey: process.env.NEXT_GEMINI_API_KEY,
});

export async function POST(request: Request) {
    try {
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
            You are an AI crime analyst.
            Based on the following ${reports.length} barangay crime reports, answer this specific question: "${question}"
          
            Data:
            ${formattedData}
            `
            : `
            You are an AI crime analyst.
            Analyze the following ${reports.length} barangay crime reports and summarize:
            1. Most common offenses
            2. Barangays with the highest number of crimes
            3. Common motives and types of places
            4. Solved vs unsolved ratio
            5. Any patterns or insights.
          
            Data:
            ${formattedData}
            `;

        const response = await genAi.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
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