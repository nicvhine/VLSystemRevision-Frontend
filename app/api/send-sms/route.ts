import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

/**
 * API route for sending SMS messages via Semaphore API
 * Handles phone number formatting and SMS delivery
 * @param req - NextRequest object containing phone number and message
 * @returns NextResponse with success status and response data
 */
export async function POST(req: NextRequest) {
  try {
    // Extract phone number and message from request body
    const { phoneNumber, message } = await req.json();
    const apiKey = process.env.SEMAPHORE_API_KEY;

    // Validate API key is present
    if (!apiKey) throw new Error("Semaphore API key missing");

    // Format phone number for international format (Philippines)
    const formattedNumber = phoneNumber.startsWith("0")
      ? "+63" + phoneNumber.slice(1)
      : phoneNumber;

    // Send SMS via Semaphore API
    const response = await axios.post(
      "https://api.semaphore.co/api/v4/messages",
      {
        apikey: apiKey,
        number: formattedNumber,  
        message,
        sendername: "Gethsemane",   
      },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("SMS sent:", response.data);
    return NextResponse.json({ success: true, data: response.data });
  } catch (err: any) {
    console.error("SMS sending failed:", err.response?.data || err);
    return NextResponse.json({ success: false, error: "Failed to send SMS" });
  }
}
