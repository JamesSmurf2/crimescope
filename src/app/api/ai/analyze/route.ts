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

        // const prompt = question
        //     ? `
        //     You are an AI crime analyst.
        //     Based on the following ${reports.length} barangay crime reports, answer this specific question: "${question}"

        //     Data:
        //     ${formattedData}
        //     `
        //     : `
        //     You are an AI crime analyst.
        //     Analyze the following ${reports.length} barangay crime reports and summarize:
        //     1. Most common offenses
        //     2. Barangays with the highest number of crimes
        //     3. Common motives and types of places
        //     4. Solved vs unsolved ratio
        //     5. Any patterns or insights.

        //     Data:
        //     ${formattedData}
        //     `;
        const prompt = question
            ? `
You are an AI crime analyst.

Your task is to answer the following question *only* using the data provided in the simplified barangay crime reports below. 
Do not use external knowledge, assumptions, or create information not explicitly found in the reports. 
If the answer cannot be determined from the data, respond with "Insufficient data."

Question: "${question}"

Simplified Crime Reports:
${formattedData}
`
            : `
You are an AI crime analyst.

Analyze the following ${reports.length} simplified barangay crime reports strictly based on the data provided. 
Do not infer or assume details beyond what is given. Summarize:

1. Most common offenses
2. Barangays with the highest number of crimes
3. Common motives and types of places
4. Solved vs unsolved ratio
5. Noticeable patterns or insights strictly visible from the data

Simplified Crime Reports:
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