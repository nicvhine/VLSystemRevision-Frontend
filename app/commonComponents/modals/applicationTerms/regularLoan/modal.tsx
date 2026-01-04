"use client";

import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { formatCurrency, capitalizeWords } from "../../../utils/formatters";
import { AgreementModalProps } from "../../../utils/Types/modal";

export default function AgreementModal({
  isOpen,
  onClose,
  application,
  onAccept,
}: AgreementModalProps & { onAccept?: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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

  if (!showModal || !application) return null;

  const monthlyPayment = application.appTotalPayable && application.appLoanTerms
    ? application.appTotalPayable / application.appLoanTerms
    : 0;

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out ${
          animateIn
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Loan Agreement Confirmation</h2>
            <p className="text-red-100 text-sm mt-1">Please review and confirm the loan terms below</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-600 p-2 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Agreement Statement */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-gray-800 font-semibold mb-3">By accepting this agreement, you agree to:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">✓</span>
                <span>Borrow {formatCurrency(application.appLoanAmount)} from Vistula Lending Corporation</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">✓</span>
                <span>Pay interest of {application.appInterestRate}% per month on the principal amount</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">✓</span>
                <span>Make {application.appLoanTerms} equal monthly payments of {formatCurrency(monthlyPayment)}</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">✓</span>
                <span>Pay a total of {formatCurrency(application.appTotalPayable)} over {application.appLoanTerms} months</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">✓</span>
                <span>Comply with all payment terms and conditions</span>
              </li>
            </ul>
          </div>

          {/* Checkbox */}
          <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="w-5 h-5 text-red-600 rounded mt-1 cursor-pointer"
            />
            <label htmlFor="agreeTerms" className="text-sm text-gray-700 cursor-pointer flex-1">
              I have read and understand the loan terms above. I agree to borrow this amount and make the required monthly payments as stated.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-xl flex gap-3 justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            disabled={!agreeToTerms || isSubmitting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
          >
            {isSubmitting ? "Submitting..." : "I Agree & Continue"}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
