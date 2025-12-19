'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface LoanPreview {
  principal: number;
  months: number;
  interestRate: number;
  interestAmount: number;
  totalInterestAmount: number;
  totalPayable: number;
  monthlyDue: number;
}

interface LoanApplication {
  applicationId: string;
  appLoanAmount: number;
  loanType: string;
}

interface EditPrincipalModalProps {
  applicationId: string;
  currentAmount: number;
  onSave: (newAmount: number) => void;
  onClose: () => void;
  loading?: boolean;
  showSuccess?: (msg: string) => void;
  showError?: (msg: string) => void;
}

const loanOptions = {
  "Regular Loan With Collateral": [
    { amount: 20000, months: 8, interest: 7 },
    { amount: 50000, months: 10, interest: 5 },
    { amount: 100000, months: 18, interest: 4 },
    { amount: 200000, months: 24, interest: 3 },
    { amount: 300000, months: 36, interest: 2 },
    { amount: 500000, months: 60, interest: 1.5 },
  ],
  "Regular Loan Without Collateral": [
    { amount: 10000, months: 5, interest: 10 },
    { amount: 15000, months: 6, interest: 10 },
    { amount: 20000, months: 8, interest: 10 },
    { amount: 30000, months: 10, interest: 10 },
  ],
  "Open-Term Loan": [
    { amount: 50000, interest: 6 },
    { amount: 100000, interest: 5 },
    { amount: 200000, interest: 4 },
    { amount: 500000, interest: 3 },
  ],
} as const;

type LoanOptionKey = keyof typeof loanOptions;

export default function EditPrincipalModal({
  applicationId,
  currentAmount,
  onSave,
  onClose,
  loading = false,
  showSuccess,
  showError,
}: EditPrincipalModalProps) {
  const [amount, setAmount] = useState(currentAmount);
  const [loanApp, setLoanApp] = useState<LoanApplication | null>(null);
  const [preview, setPreview] = useState<LoanPreview | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [amountError, setAmountError] = useState<string>("");

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsAnimating(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleModalClose = () => {
    if (loading) return;
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 150);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleModalClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && !loading) handleModalClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible, loading]);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}`);
        if (!res.ok) throw new Error("Failed to fetch application");
        const data: LoanApplication = await res.json();
        setLoanApp(data);
        setAmount(Number(data.appLoanAmount));
      } catch (err) {
        console.error(err);
        alert("Error fetching loan application");
      }
    };
    fetchApp();
  }, [applicationId]);

  const computePreview = (principal: number, loanType: string): LoanPreview => {
    const key: LoanOptionKey = loanType as LoanOptionKey;
    const options = loanOptions[key];

    let selectedOption;
    if (key === "Open-Term Loan") {
      selectedOption =
        options.find(opt => opt.amount >= principal) || options[options.length - 1];
    } else {
      selectedOption =
        options
          .filter(opt => opt.amount <= principal)
          .sort((a, b) => b.amount - a.amount)[0] || options[0];
    }

    const months = "months" in selectedOption ? selectedOption.months : 12;
    const interestRate = selectedOption.interest;
    const p = Number(principal);

    const interestAmount = p * (interestRate / 100);
    const totalInterestAmount = interestAmount * months;
    const totalPayable = p + totalInterestAmount;
    const monthlyDue = totalPayable / months;

    return {
      principal: p,
      months,
      interestRate,
      interestAmount,
      totalInterestAmount,
      totalPayable,
      monthlyDue,
    };
  };

  useEffect(() => {
    if (loanApp) setPreview(computePreview(amount, loanApp.loanType));
  }, [amount, loanApp]);

  const getLoanLimits = (loanType: string) => {
    const key: LoanOptionKey = loanType as LoanOptionKey;
    const options = loanOptions[key];
    const min = Math.min(...options.map(o => o.amount));
    const max = Math.max(...options.map(o => o.amount));
    return { min, max };
  };

  const handleSave = async () => {
    if (!loanApp) return;
    if (isNaN(amount) || amount <= 0) {
      if (showError) {
        showError("Please enter a valid amount");
      } else {
        alert("Please enter a valid amount");
      }
      return;
    }

    if (amountError) {
      if (showError) {
        showError(amountError);
      } else {
        alert(amountError);
      }
      return;
    }

    const { min, max } = getLoanLimits(loanApp.loanType);
    if (amount < min || amount > max) {
      const errorMsg = `Amount must be between ₱${min.toLocaleString()} and ₱${max.toLocaleString()}`;
      if (showError) {
        showError(errorMsg);
      } else {
        alert(errorMsg);
      }
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}/principal`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPrincipal: amount }),
      });

      if (!res.ok) throw new Error("Failed to update principal");

      const data = await res.json();
      onSave(Number(data.updatedApp.appLoanAmount));
      if (showSuccess) {
        showSuccess("Principal amount updated successfully!");
      }
      handleModalClose();
    } catch (err) {
      console.error(err);
      if (showError) {
        showError("Error updating principal. Please try again.");
      } else {
        alert("Error updating principal");
      }
    }
  };

  if (!isVisible) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-150 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative text-black transform transition-all duration-150 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleModalClose}
          className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition ${
            loading ? "opacity-50 cursor-not-allowed hover:text-gray-500" : ""
          }`}
          disabled={loading}
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Principal</h2>

        {/* Input Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Principal Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              const newAmount = parseFloat(e.target.value) || 0;
              setAmount(newAmount);

              if (loanApp && newAmount > 0) {
                const { min, max } = getLoanLimits(loanApp.loanType);
                if (newAmount < min) {
                  setAmountError(`Amount must be at least ₱${min.toLocaleString()}`);
                } else if (newAmount > max) {
                  setAmountError(`Amount cannot exceed ₱${max.toLocaleString()}`);
                } else {
                  setAmountError("");
                }
              }
            }}
            className={`w-full p-3 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
              amountError ? "border-red-500" : "border-gray-300"
            }`}
            step={0.01}
            disabled={loading}
          />
          {amountError && <p className="text-sm text-red-500 mt-1">{amountError}</p>}
          {loanApp && (() => {
            const { min, max } = getLoanLimits(loanApp.loanType);
            return (
              <p className="text-xs text-gray-500 mt-1">
                Allowed range: ₱{min.toLocaleString()} - ₱{max.toLocaleString()}
              </p>
            );
          })()}
        </div>

        {/* ================================
            UPDATED PREVIEW SECTION
        ================================= */}
        {preview && (
          <div className="mb-4 bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-700 text-lg border-b border-gray-200 pb-1 mb-3">
              Loan Preview
            </h3>

            {/* Always show Principal */}
            <div className="flex justify-between">
              <span className="text-gray-600">Principal</span>
              <span className="font-semibold text-gray-900">
                ₱ {preview.principal.toLocaleString()}
              </span>
            </div>

            {/* Always show Interest Rate */}
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Rate</span>
              <span className="text-gray-900">{preview.interestRate}%</span>
            </div>

            {/* Show full details only if NOT open-term */}
            {loanApp?.loanType !== "Open-Term Loan" && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Term</span>
                  <span className="text-gray-900">{preview.months} months</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest</span>
                  <span className="font-semibold text-gray-900">
                    ₱ {preview.totalInterestAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <div>
                    <span className="text-gray-600">Total Payable</span>
                    <div className="text-gray-900 font-bold text-lg">
                      ₱ {preview.totalPayable.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">Monthly Due</span>
                    <div className="text-gray-900 font-bold text-lg">
                      ₱ {preview.monthlyDue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleModalClose}
            className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-300"
            }`}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-red-600 text-white rounded-lg transition-colors font-medium ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-red-700"
            }`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
