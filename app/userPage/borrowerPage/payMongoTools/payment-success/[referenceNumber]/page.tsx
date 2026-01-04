"use client";

import { use } from "react";
import PaymentSuccessClient from "./paymentSuccessClient";

export default function PaymentSuccessPage({ params }: { params: Promise<{ referenceNumber: string }> }) {
  const { referenceNumber } = use(params);
  return <PaymentSuccessClient referenceNumber={referenceNumber} />;
}
