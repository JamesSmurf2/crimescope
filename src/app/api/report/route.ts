import { NextRequest, NextResponse } from 'next/server';
import ReportsModel from '@/utils/models/Reports.model';
import { connectDb } from '@/utils/utility/ConnectDb';

export const GET = async (req: NextRequest) => {
    try {
        await connectDb();

        const reports = await ReportsModel.find().sort({ createdAt: -1 });

        return NextResponse.json({ reports }, { status: 200 });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
};

export const POST = async (req: NextRequest) => {
    try {
        await connectDb();

        const body = await req.json();

        const {
            complainantName,
            contactNumber,
            address,
            crime,
            description,
            barangay,
            date,
            time,
            suspectName,
            witnessName,
        } = body;

        const report = await ReportsModel.create({
            complainantName,
            contactNumber,
            address,
            crime,
            description,
            barangay,
            date,
            time,
            suspectName,
            witnessName,
        });

        return NextResponse.json({ message: 'Report submitted successfully', report }, { status: 201 });
    } catch (error) {
        console.error('Error submitting report:', error);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
};
