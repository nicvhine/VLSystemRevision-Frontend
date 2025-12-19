"use client";

import { FiPrinter, FiX, FiSave } from "react-icons/fi";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { Application } from "../../../utils/Types/application";
import axios from "axios";
import SuccessModal from "../../successModal";

interface ReleaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ReleaseForm({ isOpen, onClose, application }: ReleaseFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [serviceFee, setServiceFee] = useState("");

  // Convert string to boolean
  const hasServiceFee = application?.hasServiceFee === "true";

  // Open/close modal
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setTimeout(() => setAnimateIn(true), 10);
      setIsSaved(false);
      setServiceFee(
        application?.appServiceFee !== undefined && application?.appServiceFee !== null
          ? String(application.appServiceFee)
          : ""
      );    } else {
      setAnimateIn(false);
      setTimeout(() => setShowModal(false), 300);
    }
  }, [isOpen, application]);

  if (!showModal || !application) return null;

  const loanAmount = Number(application.appLoanAmount || 0);
  const feeNumber = parseFloat(serviceFee) || 0;
  const netReleased = loanAmount - feeNumber;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

  // Save function
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/loan-applications/${application.applicationId}/release`,
        { serviceFee: feeNumber, netReleased },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(true);
      setLoading(false);
      setSuccessMessage("Saved successfully! You can now print.");
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      alert(err.response?.data?.error || "Failed to save data.");
    }
  };

  // Print function
  const handlePrint = () => {
    if (!isSaved && !hasServiceFee) return alert("Please save first before printing.");
    setTimeout(() => window.print(), 100);
  };

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printSection, #printSection * {
            visibility: visible !important;
          }
          #printSection {
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 10pt !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          input {
            border: none !important;
            font-weight: bold;
          }
          @page {
            size: legal portrait;
            margin: 15mm;
          }
        }
      `}</style>

      <div
        className={`bg-white rounded-xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col transition-all duration-300 ${
          animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b no-print">
          <h2 className="text-lg font-semibold text-gray-700">Loan Release Form</h2>
          <div className="flex gap-3">
            {!hasServiceFee && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
              >
                <FiSave className="mr-2" /> Save
              </button>
            )}
            {(isSaved || hasServiceFee) && (
              <button
                onClick={handlePrint}
                className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800"
              >
                <FiPrinter className="mr-2" /> Print
              </button>
            )}
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-100 flex justify-center py-6">
          <div
            id="printSection"
            className="bg-white shadow-2xl border border-gray-300 w-[216mm] min-h-[356mm] p-[25mm] text-gray-900 print:shadow-none print:border-none"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-lg font-bold">VISTULA LENDING CORPORATION</h2>
              <p>BG Business Center, Cantecson, Gairan</p>
              <p>Bogo City, Cebu</p>
              <h3 className="text-xl font-semibold mt-4">LOAN RELEASE FORM</h3>
            </div>

            {/* Borrower Info */}
            <div className="grid grid-cols-2 gap-6 mb-10 text-sm">
              <div>
                <label className="block font-medium mb-1">Borrower Name</label>
                <p className="text-gray-800">{application.appName}</p>
              </div>
              <div>
                <label className="block font-medium mb-1">Disbursement Date</label>
                <p className="text-gray-800">
                  {application.dateDisbursed ? formatDate(application.dateDisbursed) : "Not yet set"}
                </p>
              </div>
            </div>

            {/* Loan Details Table */}
            <div className="overflow-x-auto mb-10">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="border border-gray-300 px-4 py-2 text-left">Detail</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Approved Loan Amount</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">{formatCurrency(loanAmount)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Processing / Service Fee</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        placeholder="Enter service fee"
                        min={0}
                        value={serviceFee}
                        onChange={(e) => setServiceFee(e.target.value)}
                        disabled={hasServiceFee}
                        className={`w-full font-semibold border-b border-gray-400 focus:outline-none ${
                          hasServiceFee ? " cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Net Released Amount</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">{formatCurrency(netReleased)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 mt-20 text-center">
              <div>
                <div className="border-b border-gray-700 w-56 mx-auto mb-2"></div>
                <p className="font-medium">Received by</p>
              </div>
              <div>
                <div className="border-b border-gray-700 w-56 mx-auto mb-2"></div>
                <p className="font-medium">Released by</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal isOpen={!!successMessage} message={successMessage} onClose={() => setSuccessMessage("")} />
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
