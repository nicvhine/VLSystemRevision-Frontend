"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { DenialReasonModalProps } from "../utils/Types/modal";

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
  const [description, setDescription] = useState("");
  const [showMissingDocs, setShowMissingDocs] = useState(false);
  const [missingDocuments, setMissingDocuments] = useState({
    basicInformation: false,
    sourceOfIncome: false,
    references: false,
    loanDetails: false,
    photo2x2: false,
    supportingDocuments: false,
  });
  
  // Character limits
  const MIN_CHARS = 10;
  const MAX_CHARS = 500;
  const MAX_DESC_CHARS = 500;

  // Control enter/exit animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setReason("");
      setDescription("");
      setError("");
      setMissingDocuments({
        basicInformation: false,
        sourceOfIncome: false,
        references: false,
        loanDetails: false,
        photo2x2: false,
        supportingDocuments: false,
      });
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setVisible(false);
        setReason("");
        setDescription("");
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

  // Update reason whenever documents change
  useEffect(() => {
    if (!visible) return; // Skip if modal not visible
    
    const issues = Object.entries(missingDocuments)
      .filter(([_, checked]) => checked)
      .map(([key, _]) => {
        const labels: Record<string, string> = {
          basicInformation: 'Basic Information',
          sourceOfIncome: 'Source of Income',
          references: 'References',
          loanDetails: 'Loan Details',
          photo2x2: '2x2 Photo',
          supportingDocuments: 'Supporting Documents',
        };
        return labels[key];
      });

    if (issues.length === 0) {
      return; // Don't update reason if no documents checked
    }

    let generated = '';
    if (issues.length === 1) {
      generated = `Your application could not be approved at this time due to incomplete or invalid documentation. Specifically, we require a complete and valid ${issues[0]}. Please resubmit your application with the necessary documentation to proceed.`;
    } else {
      const lastItem = issues[issues.length - 1];
      const otherItems = issues.slice(0, -1).join(', ');
      generated = `Your application could not be approved at this time due to incomplete or invalid documentation. We were unable to verify the following items: ${otherItems}, and ${lastItem}. Please update your application with valid copies of these documents and resubmit to move forward with your loan.`;
    }
    
    setReason(generated);
  }, [missingDocuments, visible]);

  // Early return AFTER all hooks
  if (!visible) return null;

  // Handle form submission with validation
  const handleConfirm = () => {
    const trimmedReason = reason.trim();
    
    if (trimmedReason.length === 0) {
      setError("Please select at least one missing document or enter a denial reason.");
      return;
    }
    
    if (trimmedReason.length > MAX_CHARS) {
      setError(`Reason must not exceed ${MAX_CHARS} characters.`);
      return;
    }
    
    setError("");
    onConfirm(trimmedReason, missingDocuments, description.trim());
  };

  // Handle reason input change
  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setReason(value);
      setError("");
    }
  };

  // Handle description input change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_DESC_CHARS) {
      setDescription(value);
    }
  };

  // Handle document checkbox change
  const handleDocumentChange = (docType: keyof typeof missingDocuments) => {
    setMissingDocuments(prev => ({
      ...prev,
      [docType]: !prev[docType]
    }));
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
        <p className="mb-6 text-sm text-gray-600">
          Please provide a clear reason for denying this loan application.
        </p>

        {/* Unified Form Section */}
        <div className="space-y-4">
          {/* Missing Documents - Inline Grid */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Missing/Required Documents</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'basicInformation' as const, label: 'Basic Information' },
                { key: 'sourceOfIncome' as const, label: 'Source of Income' },
                { key: 'references' as const, label: 'References' },
                { key: 'loanDetails' as const, label: 'Loan Details' },
                { key: 'photo2x2' as const, label: '2x2 Photo' },
                { key: 'supportingDocuments' as const, label: 'Supporting Documents' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={missingDocuments[key]}
                    onChange={() => handleDocumentChange(key)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-xs text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Combined Reason and Details Textarea */}
          <div>
            <label
              htmlFor="denial-reason"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Denial Reason & Details <span className="text-red-500">*</span>
            </label>
            <textarea
              id="denial-reason"
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none text-gray-900 ${
                error ? "border-red-300" : "border-gray-300"
              } ${loading ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
              placeholder="Enter additional notes or instructions for the applicant below."
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
