"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ConfirmModalProps } from "../utils/Types/modal";
import { LoadingSpinner } from "../utils/loading";

const ConfirmModal: FC<ConfirmModalProps> = ({
  show,
  message,
  onConfirm,
  onCancel,
  loading = false,
  applicationId,
  status,
  title,
  confirmLabel,
  cancelLabel,
  processingLabel,
}) => {
  // Animation state management
  const [animateIn, setAnimateIn] = useState(false);
  const [visible, setVisible] = useState(false);

  // Control enter/exit animation lifecycle
  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  const header = title ?? "Confirmation";
  const confirmText = confirmLabel ?? "Confirm";
  const cancelText = cancelLabel ?? "Cancel";
  const processingText = processingLabel ?? "Processing...";
  const bodyText = message || (applicationId && status
    ? `Are you sure you want to set the status for loan application ${applicationId} to ${status}?`
    : "Are you sure you want to continue?");

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={() => { if (!loading) onCancel(); }}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative text-black transform transition-all duration-300 ease-out ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-center">{header}</h2>
        <p className="mb-6 text-center">{bodyText}</p>
        <div className="flex justify-end gap-4">
          <button
            className={`px-4 py-2 rounded bg-red-600 text-white font-semibold flex items-center gap-2 justify-center ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <LoadingSpinner size={4} />}
            {loading ? processingText : confirmText}
          </button>
          <button
            className={`px-4 py-2 rounded bg-gray-200 text-gray-700 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-300'}`}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ConfirmModal;
