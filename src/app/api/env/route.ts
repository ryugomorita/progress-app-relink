import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        serverEnv: process.env.TEST_SERVER_ENV || "undefined",
    });
}