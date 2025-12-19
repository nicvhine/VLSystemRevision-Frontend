'use client';

import { FiPrinter, FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import ErrorModal from "@/app/commonComponents/modals/errorModal";
import SuccessModal from "@/app/commonComponents/modals/successModal";

// Helper to capitalize each word in a name
const capitalizeWords = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  reason: string;
  date: string;
  loanId: string;
  onSuccess?: () => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

export default function EndorseLetterModal({
  isOpen,
  onClose,
  clientName,
  reason,
  date,
  loanId,
  onSuccess,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [authorizedName, setAuthorizedName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast modals state
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('fullName') || 'Authorized Signatory';
      setAuthorizedName(capitalizeWords(storedName));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  const handlePrint = () => setTimeout(() => window.print(), 100);

  const handleSubmit = async () => {
    try {
  setIsSubmitting(true);
  // reset toasts
  setErrorMsg('');
  setShowError(false);
  setSuccessMsg('');
  setShowSuccess(false);

      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/closure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientName,
          reason,
          date,
          authorizedBy: authorizedName,
          loanId,
          status: "Pending",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit endorsement");
      }

      setSuccessMsg("Endorsement successfully submitted!");
      setShowSuccess(true);
      
      // Call onSuccess callback immediately to update UI
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting endorsement:", error);
  setErrorMsg(error.message || "Failed to submit endorsement. Please try again.");
  setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
        animateIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${
          animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-600">Endorsement Letter</h2>
          <div className="flex gap-3 items-center">
            <button
              onClick={handlePrint}
              className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800"
            >
              <FiPrinter className="mr-2" /> Print
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center px-3 py-1 rounded-md text-white ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 flex justify-center py-6">
          <div
            id="printSection"
            className="bg-white shadow-2xl border border-gray-300 w-[210mm] min-h-[297mm] p-[25mm] text-justify leading-relaxed text-[10pt] text-gray-900 print:shadow-none print:border-none"
          >
            {/* Letter content */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold">VISTULA LENDING CORPORATION</h2>
              <p>BG Business Center, Cantecson, Gairan</p>
              <p>Bogo City, Cebu</p>
            </div>

            <p className="text-right">{date}</p>
            <p className="mt-4">Ms. Ronelyn Pelayo</p>
            <p>Loan Department</p>
            <p>Vistula Lending Corporation</p>
            <p className="mt-4">Dear Ms. Pelayo,</p>

            <p className="mt-4">
              This letter serves as a formal endorsement for the closure of the loan
              account under the name of <strong>{capitalizeWords(clientName)}</strong>.
              The account is being recommended for closure due to the following exceptional circumstance:
            </p>
            <p className="mt-2 italic">{reason}</p>

            <p className="mt-2">
              We respectfully request that your office undertake the necessary actions
              to formally close this account in accordance with the company's policies
              and regulatory requirements. Please ensure that all relevant documentation is completed.
            </p>

            <p className="mt-6">Thank you for your prompt attention and cooperation.</p>
            <p className="mt-6">Sincerely,</p>

            <div className="mt-12 flex justify-start items-end">
              <div className="relative">
                <p className="w-48 uppercase relative z-10">{authorizedName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable ErrorModal */}
      <ErrorModal
        isOpen={showError}
        message={errorMsg}
        onClose={() => setShowError(false)}
      />
      <SuccessModal
        isOpen={showSuccess}
        message={successMsg}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
