"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import CustomAmountModal from "@/app/commonComponents/modals/payModal";
import { formatDate } from "@/app/commonComponents/utils/formatters";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
  </div>
);

export default function UpcomingBillsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loanId = searchParams.get("loanId");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loan, setLoan] = useState<any | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (!loanId) return;

    const fetchLoan = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        const res = await fetch(`${BASE_URL}/collections/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d?.error || "Failed to load loan");
        }

        const data = await res.json();
        setLoan(data);
        setCollections(Array.isArray(data.collections) ? data.collections : []);
      } catch (err: any) {
        setError(err?.message || "Failed to load upcoming bills");
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [loanId]);

  if (!loanId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-xl w-full p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Loan ID required</h2>
          <p className="text-sm text-gray-600 mb-4">
            Pass a <code>?loanId=</code> query parameter
          </p>
          <button
            onClick={() => router.push("/userPage/borrowerPage/dashboard")}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/userPage/borrowerPage/dashboard")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        </div>

        {/* Content */}
        {loading && <LoadingSpinner />}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && collections.length === 0 && (
          <div className="p-6 text-center bg-gray-50 rounded-lg text-gray-600">
            No scheduled collections found
          </div>
        )}

        {!loading &&
          !error &&
          collections.map((c) => {
            const isPaid = c.status === "Paid";
            const isPartial = c.status === "Partial";

            return (
              <div
                key={c.referenceNumber || c.collectionNumber}
                onClick={() => {
                  if (!isPaid) {
                    setSelectedCollection(c);
                    setShowPayModal(true);
                  }
                }}
                className={`mb-3 rounded-lg p-4 border transition ${
                  isPaid
                    ? "bg-gray-50 border-gray-200 opacity-60"
                    : isPartial
                    ? "bg-white border-gray-300 hover:shadow"
                    : "bg-white border-red-200 hover:shadow-lg"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Installment {c.collectionNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      Due{" "}
                      {formatDate(c.dueDate)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ₱
                      {Number(
                        c.periodAmount ?? c.periodBalance ?? 0
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedCollection && loan && (
        <CustomAmountModal
          collection={selectedCollection}
          activeLoan={loan}
          setErrorMsg={setErrorMsg}
          setShowErrorModal={setShowErrorModal}
          onClose={() => {
            setShowPayModal(false);
            setSelectedCollection(null);
          }}
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[99999] bg-black/30 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-sm text-gray-600 mb-4">{errorMsg}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
