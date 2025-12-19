"use client";

import PaymentSuccessClient from "./paymentSuccessClient";

export default function PaymentSuccessPage({ params }: { params: any}) {
  return <PaymentSuccessClient referenceNumber={params.referenceNumber} />;
}
