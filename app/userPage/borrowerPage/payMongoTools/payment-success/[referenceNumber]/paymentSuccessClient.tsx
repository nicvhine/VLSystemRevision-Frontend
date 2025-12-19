"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/app/commonComponents/utils/loading";

interface Props {
  referenceNumber: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function PaymentSuccessClient({ referenceNumber }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"processing" | "success" | "error">("processing");
  const [msg, setMsg] = useState("Finalizing your payment... Please wait.");
  const [redirectIn, setRedirectIn] = useState(3);

  const finalize = useCallback(async () => {
    setPhase("processing");
    setMsg("Finalizing your payment... Please wait.");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/payments/${referenceNumber}/paymongo/success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json().catch(() => undefined);

      if (!res.ok) throw new Error("Failed to finalize payment");

      setPhase("success");
      setMsg("Payment successful. Redirecting you back to your dashboard...");

      // Extract payment data and store in localStorage to show receipt on dashboard
      if (result && result.paymentLogs && result.paymentLogs.length > 0) {
        const paymentLog = result.paymentLogs[0];
        const paymentReceiptData = {
          referenceNumber: paymentLog.referenceNumber,
          amount: paymentLog.amount,
          datePaid: paymentLog.datePaid,
          loanId: paymentLog.loanId,
          borrowersId: paymentLog.borrowersId,
          collector: paymentLog.collector,
          mode: paymentLog.mode || 'GCash',
          paidToCollection: paymentLog.paidToCollection,
        };
        // Store payment data to show receipt modal on dashboard
        localStorage.setItem('pendingPaymentReceipt', JSON.stringify(paymentReceiptData));
      }
    } catch (err) {
      console.error(err);
      setPhase("error");
      setMsg("We couldn't finalize your payment. You can retry or go back to your dashboard.");
    }
  }, [referenceNumber]);

  useEffect(() => {
    finalize();
  }, [finalize]);

  useEffect(() => {
    if (phase !== "success") return;

    const interval = setInterval(() => {
      setRedirectIn((s) => {
        if (s <= 1) {
          clearInterval(interval);
          router.push("/userPage/borrowerPage/dashboard");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-8 text-center">
        {phase === "processing" && (
          <div className="flex flex-col items-center">
            <LoadingSpinner size={7} />
            <h1 className="mt-4 text-xl font-semibold text-gray-800">Processing Payment</h1>
            <p className="mt-2 text-gray-600">{msg}</p>
          </div>
        )}

        {phase === "success" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-9 h-9"
                fill="none"
                stroke="#16A34A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-green-700">Payment Successful</h1>
            <p className="mt-2 text-gray-700">{msg}</p>
            <button
              onClick={() => router.push("/userPage/borrowerPage/dashboard")}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 text-white px-5 py-2.5"
            >
              Go to Dashboard now ({redirectIn})
            </button>
          </div>
        )}

        {phase === "error" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-9 h-9"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-red-700">Payment Not Finalized</h1>
            <p className="mt-2 text-gray-700">{msg}</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={finalize}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5"
              >
                Retry
              </button>
              <button
                onClick={() => router.push("/userPage/borrowerPage/dashboard")}
                className="inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 px-5 py-2.5"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
