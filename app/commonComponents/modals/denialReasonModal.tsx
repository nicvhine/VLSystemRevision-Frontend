"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { DenialReasonModalProps } from "../utils/Types/modal";

/**
 * Denial Reason Modal component for loan applications
 * Allows managers and loan officers to provide a reason when denying applications
 * Features validation, character counter, fade animations, and portal rendering
 * @param isOpen - Boolean to control modal visibility
 * @param onClose - Callback function to close the modal
 * @param onConfirm - Callback function with the denial reason
 * @param applicationId - Optional application ID for context
 * @param loading - Boolean to show loading state during submission
 * @param title - Optional custom title for the modal
 * @param confirmLabel - Optional custom label for confirm button
 * @param cancelLabel - Optional custom label for cancel button
 * @param processingLabel - Optional custom label for processing state
 * @returns JSX element containing the denial reason modal
 */
const DenialReasonModal: FC<DenialReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  applicationId,
  loading = false,
  title,
  confirmLabel,
  cancelLabel,
  processingLabel,
}) => {
  // Animation state management
  const [animateIn, setAnimateIn] = useState(false);
  const [visible, setVisible] = useState(false);
  
  // Form state management
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  
  // Character limits
  const MIN_CHARS = 10;
  const MAX_CHARS = 500;

  // Control enter/exit animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setReason("");
      setError("");
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setVisible(false);
        setReason("");
        setError("");
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle close action
  const handleClose = () => {
    if (!loading) {
      setAnimateIn(false);
      setTimeout(() => onClose(), 150);
    }
  };

  // Handle escape key - MUST be before early return to follow Rules of Hooks
  useEffect(() => {
    if (!visible) return;
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, loading]);

  // Early return AFTER all hooks
  if (!visible) return null;

  // Handle form submission with validation
  const handleConfirm = () => {
    const trimmedReason = reason.trim();
    
    if (trimmedReason.length < MIN_CHARS) {
      setError(`Reason must be at least ${MIN_CHARS} characters long.`);
      return;
    }
    
    if (trimmedReason.length > MAX_CHARS) {
      setError(`Reason must not exceed ${MAX_CHARS} characters.`);
      return;
    }
    
    setError("");
    onConfirm(trimmedReason);
  };

  // Handle reason input change
  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setReason(value);
      setError("");
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  // Text configuration
  const header = title ?? "Denial Reason";
  const confirmText = confirmLabel ?? "Submit";
  const cancelText = cancelLabel ?? "Cancel";
  const processingText = processingLabel ?? "Submitting...";
  
  const remainingChars = MAX_CHARS - reason.length;
  const isReasonValid = reason.trim().length >= MIN_CHARS;

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-150 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative text-black transform transition-all duration-150 ${
          animateIn
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition ${
            loading ? "opacity-50 cursor-not-allowed hover:text-gray-500" : ""
          }`}
          aria-label="Close modal"
        >
          <FiX size={20} />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold mb-4 text-gray-900">{header}</h2>

        {/* Application ID display */}
        {applicationId && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Application ID:</span>{" "}
              <span className="font-mono">{applicationId}</span>
            </p>
          </div>
        )}

        {/* Description */}
        <p className="mb-4 text-sm text-gray-600">
          Please provide a clear reason for denying this loan application. This
          will be recorded and may be shared with the applicant.
        </p>

        {/* Textarea for reason */}
        <div className="mb-4">
          <label
            htmlFor="denial-reason"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Reason for Denial <span className="text-red-500">*</span>
          </label>
          <textarea
            id="denial-reason"
            rows={5}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none text-gray-900 ${
              error
                ? "border-red-300"
                : "border-gray-300"
            } ${loading ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
            placeholder="Enter the reason for denial (minimum 10 characters)..."
            value={reason}
            onChange={handleReasonChange}
            disabled={loading}
          />
          
          {/* Character counter */}
          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-xs ${
                reason.length < MIN_CHARS
                  ? "text-gray-400"
                  : remainingChars < 50
                  ? "text-orange-500"
                  : "text-gray-500"
              }`}
            >
              {reason.trim().length >= MIN_CHARS
                ? `${remainingChars} characters remaining`
                : `${MIN_CHARS - reason.trim().length} more characters needed`}
            </span>
            <span className="text-xs text-gray-400">
              {reason.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              loading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={handleClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              loading || !isReasonValid
                ? "bg-red-600 opacity-60 text-white cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            onClick={handleConfirm}
            disabled={loading || !isReasonValid}
          >
            {loading ? processingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default DenialReasonModal;
