'use client';

import React, { useState, useEffect } from 'react';
import { Payment } from '../../utils/Types/collection';
import { PaymentHistoryModalProps } from '../../utils/Types/modal';

export default function PaymentHistoryModal({ isOpen, animateIn, onClose, paidPayments }: PaymentHistoryModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
    else {
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative text-black transform transition-all duration-300 ease-out overflow-y-auto max-h-[80vh] ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-lg font-bold"
          onClick={onClose}
        >
          ✕
        </button>
        {paidPayments.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No paid payments yet.</p>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Reference Number</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Payment Date</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Amount Paid</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Mode</th>
                </tr>
              </thead>
              <tbody>
                {paidPayments.map((payment: Payment, index: number) => (
                  <tr key={payment._id || index} className="bg-white transition-colors">
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-800">{payment.referenceNumber}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-700">{payment.datePaid ? new Date(payment.datePaid).toLocaleDateString('en-PH') : '-'}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-800">₱{payment.amount?.toLocaleString() ?? '0'}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-green-700 font-medium">{payment.mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
