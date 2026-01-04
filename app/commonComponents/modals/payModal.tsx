"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Collection } from "@/app/commonComponents/utils/Types/collection";
import { Loan } from "@/app/commonComponents/utils/Types/loan";
import { handlePay } from "@/app/userPage/borrowerPage/dashboard/function";

interface CustomAmountModalProps {
  collection: Collection;
  activeLoan: Loan;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  setShowErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}

export default function CustomAmountModal({
  collection,
  activeLoan,
  setErrorMsg,
  setShowErrorModal,
  onClose,
}: CustomAmountModalProps) {
  const [animateIn, setAnimateIn] = useState(false);
  const [customAmount, setCustomAmount] = useState(collection.periodBalance.toFixed(2));
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("gcash");
  const [amountError, setAmountError] = useState("");

  // Safety check for activeLoan
  const loanBalance = activeLoan?.remainingBalance || activeLoan?.balance || 0;
  const suggestedAmount = Number(collection.periodBalance).toFixed(2);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const input = document.getElementById("customAmountInput") as HTMLInputElement | null;
    if (input) input.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAnimateIn(false);
        setTimeout(() => onClose(), 150);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleCustomPay = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      setShowErrorModal(true);
      return;
    }

    if (amount > loanBalance) {
      setErrorMsg(`Payment amount cannot exceed your remaining loan balance of ₱${loanBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`);
      setShowErrorModal(true);
      return;
    }

    setIsPaying(true);

    try {
      await handlePay(
        collection,
        activeLoan,
        setErrorMsg,
        setShowErrorModal,
        amount
      );
      setIsPaying(false);
      // animate out then close
      setAnimateIn(false);
      setTimeout(() => onClose(), 150);
    } catch (err) {
      console.error('Modal payment error:', err);
      setIsPaying(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] bg-black/30 backdrop-blur-sm flex items-center justify-center px-4 transition-opacity duration-200 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-2xl shadow-xl w-full max-w-3xl transition-all duration-200 ${
          animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Payment
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Collection #{collection.collectionNumber}</p>
          </div>
          <button
            onClick={() => {
              setAnimateIn(false);
              setTimeout(() => onClose(), 150);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-4 space-y-4">
          {/* Amount Summary */}
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount Due</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ₱
                  {Number(collection.periodBalance).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Available</p>
                <p className="text-sm font-bold text-gray-800 mt-1">
                  ₱{loanBalance.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700">Enter Amount</label>
                <button
                  onClick={() => {
                    setCustomAmount(suggestedAmount);
                    setAmountError('');
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                  Use Suggested
                </button>
              </div>
              <input
                id="customAmountInput"
                type="text"
                value={customAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and decimal point
                  if (/^\d*\.?\d*$/.test(value) || value === '') {
                    setCustomAmount(value);
                    const num = parseFloat(value);
                    if (value && !isNaN(num)) {
                      if (num < 0) {
                        setAmountError('Amount cannot be negative.');
                      } else if (num > loanBalance) {
                        setAmountError(`Cannot exceed ₱${loanBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`);
                      } else if (num === 0) {
                        setAmountError('Amount must be greater than zero.');
                      } else {
                        setAmountError('');
                      }
                    } else if (value) {
                      setAmountError('Please enter a valid amount.');
                    } else {
                      setAmountError('');
                    }
                  }
                }}
                className={`w-full border rounded px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none transition ${
                  amountError ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                }`}
                placeholder={`0.00`}
              />
              {amountError && <p className="text-red-600 text-xs mt-1.5 font-medium">{amountError}</p>}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Payment Method</p>

            {/* E-wallets */}
            <div className="mb-3">
              <p className="text-[11px] text-gray-500 mb-1.5">E-Wallets</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "gcash", label: "GCash" },
                  { id: "maya", label: "Maya" },
                  { id: "grab_pay", label: "GrabPay" },
                  { id: "shopeepay", label: "ShopeePay" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`h-8 rounded border text-xs font-medium transition ${
                      paymentMethod === opt.id
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Payment */}
            <div className="mb-3">
              <p className="text-[11px] text-gray-500 mb-1.5">QR Payment</p>
              <button
                onClick={() => setPaymentMethod("qrph")}
                className={`h-8 w-full rounded border text-xs font-medium transition ${
                  paymentMethod === "qrph"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                QR PH / InstaPay
              </button>
            </div>

            {/* Card */}
            <div className="mb-3">
              <p className="text-[11px] text-gray-500 mb-1.5">Cards</p>
              <button
                onClick={() => setPaymentMethod("card")}
                className={`h-8 w-full rounded border text-xs font-medium transition ${
                  paymentMethod === "card"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Credit / Debit Card
              </button>
            </div>

            {/* Online Banking */}
            <div>
              <p className="text-[11px] text-gray-500 mb-1.5">Online Banking</p>
              <div className="grid grid-cols-5 gap-1">
                {[
                  "bpi",
                  "bdo",
                  "unionbank",
                  "metrobank",
                  "rcbc",
                ].map((b) => (
                  <button
                    key={b}
                    onClick={() => setPaymentMethod(`ubp:${b}`)}
                    className={`h-7 rounded border text-[10px] font-semibold transition ${
                      paymentMethod === `ubp:${b}`
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {b.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-6 py-3 border-t border-gray-100 bg-white">
          <button
            onClick={() => {
              setAnimateIn(false);
              setTimeout(() => onClose(), 150);
            }}
            className="px-4 py-2 rounded text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCustomPay}
            disabled={isPaying || !!amountError || !customAmount}
            className={`px-5 py-2 rounded text-sm font-semibold text-white transition ${
              isPaying || !!amountError || !customAmount ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isPaying ? "Processing..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function formatMethodLabel(m: string) {
  if (m === "card") return "Card";
  if (m === "qrph") return "QR PH";
  if (m === "gcash") return "GCash";
  if (m === "maya") return "Maya";
  if (m === "grab_pay") return "GrabPay";
  if (m === "shopeepay") return "ShopeePay";
  if (m.startsWith("ubp:")) return m.split(":")[1].toUpperCase();
  return m;
}
