import { NextResponse } from "next/server";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

export async function POST(req: Request) {
  // Extract payment amount from request body
  const { amount } = await req.json();

  try {
    // Create PayMongo checkout session
    const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64"),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: { name: "Test User", email: "test@example.com" },
            amount: amount * 100, // PayMongo expects cents
            currency: "PHP",
            description: "Sample Payment",
            redirect: {
              // Note: server should include the reference or we derive it server-side; adjust as needed.
              success: `${FRONTEND_URL}/userPage/borrowerPage/payMongoTools/payment-success/{referenceNumber}`,
              failed: `${FRONTEND_URL}/userPage/borrowerPage/payMongoTools/cancel`,
            },
          },
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
