"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters";
import SuccessModal from "./successModal";
import ErrorModal from "./errorModal";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface ViewEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  endorsement: any | null;
}

export default function ViewEndorsementModal({
  isOpen,
  onClose,
  endorsement,
}: ViewEndorsementModalProps) {
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mount success/error modals imperatively
  const mountImperativeModal = (element: React.ReactElement, duration = 5000) => {
    if (typeof window === "undefined") return () => {};
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      try {
        root.unmount();
      } catch {}
      container.remove();
    };

    root.render(element);
    const timer = setTimeout(cleanup, duration);
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  };

  const showSuccess = (message: string, duration = 5000) => {
    mountImperativeModal(
      <SuccessModal isOpen={true} message={message} onClose={() => {}} />,
      duration
    );
  };

  const showError = (message: string, duration = 5000) => {
    mountImperativeModal(
      <ErrorModal isOpen={true} message={message} onClose={() => {}} />,
      duration
    );
  };

  // Fetch penalty endorsements
  const fetchEndorsements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${BASE_URL}/penalty`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch penalty endorsements");
      const data = await res.json();
      setEndorsements(data);
    } catch (err: any) {
      console.error(err);
      showError(err?.message || "Failed to fetch penalty endorsements.");
    }
  };

  useEffect(() => {
    fetchEndorsements();
  }, []);

  // Ensure portal only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, submitting, onClose]);

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${BASE_URL}/penalty/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remarks: "Approved" }),
      });

      if (!res.ok) throw new Error("Failed to approve endorsement");
      onClose();
      showSuccess("Endorsement approved successfully!");
      fetchEndorsements();
    } catch (err: any) {
      console.error(err);
      showError(err?.message || "Failed to approve endorsement.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reject
  const handleReject = async (id: string) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${BASE_URL}/penalty/${id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remarks: "Rejected" }),
      });

      if (!res.ok) throw new Error("Failed to reject endorsement");
      onClose();
      showSuccess("Endorsement rejected successfully!");
      fetchEndorsements();
    } catch (err: any) {
      console.error(err);
      showError(err?.message || "Failed to reject endorsement.");
    } finally {
      setSubmitting(false);
    }
  };

  // Safe render check — after all hooks
  if (!endorsement || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[20000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl w-[90%] max-w-lg p-6 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                if (!submitting) onClose();
              }}
              disabled={submitting}
              className={`absolute top-3 right-3 p-2 text-gray-500 rounded-full ${
                submitting ? "opacity-40 pointer-events-none" : "hover:bg-gray-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-5">
              Penalty Endorsement Details
            </h2>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 font-medium">Loan ID</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1">{endorsement.loanId}</p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">Reference Number</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1">
                    {endorsement.referenceNumber}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-gray-500 font-medium">Borrower Name</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1">{endorsement.borrowerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 font-medium">Endorsed By</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1">{endorsement.endorsedBy}</p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">Date Endorsed</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1">
                    {formatDate(endorsement.dateEndorsed)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-gray-500 font-medium">Status</label>
                <p
                  className={`p-2 rounded mt-1 font-medium ${
                    endorsement.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : endorsement.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {endorsement.status}
                </p>
              </div>

              <div>
                <label className="text-gray-500 font-medium">Reason for Endorsement</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap">
                  {endorsement.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 font-medium">Penalty Amount</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1">
                    {formatCurrency(endorsement.penaltyAmount)}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">Payable Amount</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1">
                    {formatCurrency(endorsement.finalAmount || endorsement.payableAmount)}
                  </p>
                </div>
              </div>

              {endorsement.remarks && (
                <div>
                  <label className="text-gray-500 font-medium">Remarks</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1">
                    {endorsement.remarks}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 space-x-3">
              {endorsement.status === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      if (!submitting) handleApprove(endorsement._id);
                    }}
                    disabled={submitting}
                    className={`px-4 py-2 bg-green-600 text-white rounded-lg ${
                      submitting ? "opacity-50 pointer-events-none" : "hover:bg-green-700"
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      if (!submitting) handleReject(endorsement._id);
                    }}
                    disabled={submitting}
                    className={`px-4 py-2 bg-red-600 text-white rounded-lg ${
                      submitting ? "opacity-50 pointer-events-none" : "hover:bg-red-700"
                    }`}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  if (!submitting) onClose();
                }}
                disabled={submitting}
                className={`px-4 py-2 bg-gray-600 text-white rounded-lg ${
                  submitting ? "opacity-50 pointer-events-none" : "hover:bg-gray-700"
                }`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
