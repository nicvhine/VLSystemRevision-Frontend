'use client';

import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/formatters";
import { PaymentModalProps } from "../../utils/Types/collection";
import { LoadingSpinner } from "../../utils/loading";

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  borrowerName: string;
  dueDate: string;
  loanBalance: number;
  amount: number;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

function ConfirmPaymentModal({
  isOpen,
  borrowerName,
  dueDate,
  loanBalance,
  amount,
  onCancel,
  onConfirm,
  isLoading
}: ConfirmPaymentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const newBalance = loanBalance - amount;

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[60] transition-opacity duration-200 ${
      isAnimating ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md p-6 md:p-8 transform transition-all duration-200 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <h2 className="text-xl font-bold mb-6 text-gray-800">Confirm Payment</h2>

        <div className="space-y-3 text-gray-700 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Borrower:</span>
            <span>{borrowerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Due Date:</span>
            <span>{new Date(dueDate).toDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Loan Balance:</span>
            <span>{formatCurrency(loanBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium ">Payment Amount:</span>
            <span className=" font-semibold">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-green-600">New Balance:</span>
            <span className="text-green-600 font-semibold">{formatCurrency(newBalance)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && <LoadingSpinner size={4} />}
            {isLoading ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentModal({
  isOpen,
  isAnimating,
  selectedCollection,
  paymentAmount,
  setPaymentAmount,
  handleClose,
  handleConfirmPayment,
  paymentLoading,
  showPaymentConfirm,
  setShowPaymentConfirm
}: PaymentModalProps) {
  if (!isOpen || !selectedCollection) return null;

  return (
    <>
      {/* Main Payment Modal */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={!paymentLoading ? handleClose : undefined}
      >
        <div
          className={`bg-white rounded-xl shadow-xl w-full max-w-md p-6 md:p-8 transition-transform duration-200 relative ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Loading Overlay */}
          {paymentLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size={8} />
                <p className="text-sm text-gray-600 font-medium">Processing payment...</p>
              </div>
            </div>
          )}
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
            Make Payment for {selectedCollection.name}
          </h2>

          <p className="text-sm text-gray-600 mb-2">
            Due Date: {new Date(selectedCollection.dueDate).toDateString()}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Period Amount: {formatCurrency(selectedCollection.periodAmount)}
          </p>

          <label className="block text-sm text-gray-700 mb-1">Enter Amount</label>
          <input
            type="text"
            className="w-full border border-gray-300 px-3 py-2 rounded mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
            value={paymentAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value) || value === '') {
                const num = parseFloat(value) || 0;
                if (num >= 0 && num <= selectedCollection.loanBalance) {
                  setPaymentAmount(num);
                } else if (num > selectedCollection.loanBalance) {
                  setPaymentAmount(selectedCollection.loanBalance);
                }
              }
            }}
          />
          <p className="text-xs text-gray-500 mb-4">
            Loan Balance: {formatCurrency(selectedCollection.loanBalance)}
          </p>

          <div className="flex justify-end gap-3">
            <button
              className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition ${
                paymentLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleClose}
              disabled={paymentLoading}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition ${
                (paymentLoading || paymentAmount <= 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => setShowPaymentConfirm(true)}
              disabled={paymentLoading || paymentAmount <= 0}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmPaymentModal
        isOpen={showPaymentConfirm}
        borrowerName={selectedCollection.name}
        dueDate={selectedCollection.dueDate}
        loanBalance={selectedCollection.loanBalance}
        amount={paymentAmount}
        onCancel={() => !paymentLoading && setShowPaymentConfirm(false)}
        onConfirm={() => {
          handleConfirmPayment();
        }}
        isLoading={paymentLoading}
      />
    </>
  );
}
