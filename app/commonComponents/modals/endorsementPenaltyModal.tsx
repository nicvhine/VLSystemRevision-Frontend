'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import SuccessModal from './successModal';
import ErrorModal from './errorModal';
import { createRoot } from 'react-dom/client';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

function mountModal(node: React.ReactElement, duration = 5000) {
  if (typeof document === 'undefined') return;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const unmount = () => {
    try { root.unmount(); } catch (e) { /* ignore */ }
    if (container.parentNode) container.parentNode.removeChild(container);
  };

  root.render(React.cloneElement(node, { onClose: unmount } as any));

  const timer = setTimeout(() => { unmount(); clearTimeout(timer); }, duration + 100);
}

function showSuccess(message: string, duration = 5000) {
  mountModal(<SuccessModal isOpen={true} message={message} onClose={() => {}} />, duration);
}

function showError(message: string, duration = 5000) {
  mountModal(<ErrorModal isOpen={true} message={message} onClose={() => {}} />, duration);
}


interface PenaltyEndorseModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: any;
  onSubmit: (formData: FormData) => Promise<void>; 
}

export default function PenaltyEndorseModal({ isOpen, onClose, collection }: PenaltyEndorseModalProps) {
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // use imperative SuccessModal/ErrorModal mounts via utils

  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [payableAmount, setPayableAmount] = useState(0);

  useEffect(() => {
    if (!collection) return;

    let penalty = 0;
    if (collection.status === "Past Due") {
      penalty = collection.periodAmount * 0.02; // 2%
    } else if (collection.status === "Overdue") {
      penalty = collection.periodAmount * 0.05; // 5%
    }

    setPenaltyAmount(penalty);
    setPayableAmount(collection.periodAmount + penalty);
  }, [collection]);

  // close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, submitting, onClose]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showError('Please enter a reason for endorsement');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      setSubmitting(true);

      const payload = {
        referenceNumber: collection.referenceNumber,
        reason,
        penaltyAmount,
        payableAmount,
      };

      const response = await fetch(`${BASE_URL}/penalty/endorse`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit endorsement');
      }

  // close modal then show success modal (imperatively mounted)
  onClose();
  showSuccess('Penalty endorsement successfully submitted!');
    } catch (error: any) {
      console.error('Error submitting endorsement:', error);
      showError(error?.message || 'Failed to submit endorsement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* success/error toasts are mounted imperatively via `showSuccess` / `showError` */}
            <button
              onClick={() => { if (!submitting) onClose(); }}
              disabled={submitting}
              className={`absolute top-3 right-3 p-2 text-gray-500 rounded-full ${submitting ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Endorse Penalty</h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Reference Number</label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{collection?.referenceNumber}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Borrower Name</label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{collection?.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Period Amount</label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                  {formatCurrency(collection?.periodAmount)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Penalty Amount</label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                  {formatCurrency(penaltyAmount)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Payable</label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                  {formatCurrency(payableAmount)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Reason for Endorsement</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border rounded-lg p-2 mt-1 text-sm focus:ring focus:ring-blue-200"
                  rows={3}
                  placeholder="Explain why this penalty should be endorsed..."
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { if (!submitting) onClose(); }}
                disabled={submitting}
                className={`px-4 py-2 text-gray-700 rounded-lg ${submitting ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Endorsement'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
