'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiUpload } from 'react-icons/fi';

interface CIChecklistModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSubmitAction: (data: CIChecklistData) => Promise<void>;
  t: any;
  applicationId: string;
  loanOfficerName: string;
}

export interface CIChecklistData {
  applicationId: string;
  loanOfficerName: string;
  checklist: Record<string, boolean>;
  notes: string;
  proofPhotos: File[];
  photoUrls?: string[];
}

const CI_ITEMS = [
  { key: 'identity_verified', label: 'Identity Verification' },
  { key: 'income_verified', label: 'Income Verification' },
  { key: 'address_verified', label: 'Address Verification' },
  { key: 'employment_verified', label: 'Employment Verification' },
  { key: 'credit_history_checked', label: 'Credit History Checked' },
  { key: 'collateral_verified', label: 'Collateral Verification' },
  { key: 'references_verified', label: 'References Verified' },
  { key: 'no_legal_issues', label: 'No Legal Issues Found' },
];

export default function CIChecklistModal({
  isOpen,
  onCloseAction,
  onSubmitAction,
  t,
  applicationId,
  loanOfficerName,
}: CIChecklistModalProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    CI_ITEMS.reduce((acc, item) => ({ ...acc, [item.key]: false }), {})
  );
  const [notes, setNotes] = useState('');
  const [proofPhotos, setProofPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChecklistChange = (key: string) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and size
    const validFiles = files.filter((file) => {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Only JPEG and PNG images are allowed');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length + proofPhotos.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    setError('');
    setProofPhotos((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setProofPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (Object.values(checklist).filter(Boolean).length === 0) {
      setError('Please check at least one CI item');
      return;
    }

    if (!notes.trim()) {
      setError('Please provide notes about the CI');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmitAction({
        applicationId,
        loanOfficerName,
        checklist,
        notes,
        proofPhotos,
      });

      // Reset form
      setChecklist(CI_ITEMS.reduce((acc, item) => ({ ...acc, [item.key]: false }), {}));
      setNotes('');
      setProofPhotos([]);
      setPhotoPreview([]);
      onCloseAction();
    } catch (err: any) {
      setError(err.message || 'Failed to submit CI checklist');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Credit Investigation Checklist</h2>
          <button
            onClick={onCloseAction}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loan Officer Info */}
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Loan Officer</p>
            <p className="font-semibold text-gray-800">{loanOfficerName}</p>
            <p className="text-sm text-gray-600">Application ID: {applicationId}</p>
          </div>

          {/* Checklist */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">CI Items</h3>
            <div className="space-y-3">
              {CI_ITEMS.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => handleChecklistChange(item.key)}
                    className="w-5 h-5 text-red-600 rounded cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <span className="ml-3 text-gray-700 font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              CI Notes & Comments
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder="Explain why the applicant passed the CI and any important findings..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Proof Photos (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <FiUpload size={32} className="text-gray-400" />
                <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">JPEG or PNG (Max 5MB per file)</p>
              </label>
            </div>

            {/* Photo Preview */}
            {photoPreview.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photoPreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {proofPhotos.length}/5 photos uploaded
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onCloseAction}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit to Manager'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
