'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

interface ViewCIChecklistModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  applicationId: string;
  authFetchAction: (url: string) => Promise<Response>;
}

interface CIChecklistRecord {
  applicationId: string;
  loanOfficerName: string;
  checklist: Record<string, boolean>;
  notes: string;
  proofPhotos?: string[];
  submittedAt?: string;
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

export default function ViewCIChecklistModal({
  isOpen,
  onCloseAction,
  applicationId,
  authFetchAction,
}: ViewCIChecklistModalProps) {
  const [ciData, setCIData] = useState<CIChecklistRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchCIChecklist();
    }
  }, [isOpen, applicationId]);

  const fetchCIChecklist = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authFetchAction(
        `${process.env.NEXT_PUBLIC_BASE_URL}/loan-applications/${applicationId}/ci-checklist`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch CI checklist');
      }
      const data = await response.json();
      setCIData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load CI checklist');
    } finally {
      setLoading(false);
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
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading checklist...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {ciData && !loading && (
            <>
              {/* Loan Officer Info */}
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Submitted by</p>
                <p className="font-semibold text-gray-800">{ciData.loanOfficerName}</p>
                <p className="text-sm text-gray-600">Application ID: {ciData.applicationId}</p>
                {ciData.submittedAt && (
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(ciData.submittedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Checklist Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">CI Items</h3>
                <div className="space-y-2">
                  {CI_ITEMS.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={ciData.checklist[item.key] || false}
                        disabled
                        className="w-5 h-5 text-red-600 rounded cursor-not-allowed"
                      />
                      <span className="ml-3 text-gray-700 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  CI Notes & Comments
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 whitespace-pre-wrap">
                  {ciData.notes}
                </div>
              </div>

              {/* Photos */}
              {ciData.proofPhotos && ciData.proofPhotos.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Proof Photos
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {ciData.proofPhotos.map((photoUrl, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => setEnlargedPhoto(photoUrl)}>
                        <img
                          src={photoUrl}
                          alt={`Proof ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">Click to enlarge</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onCloseAction}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Enlarged Photo Modal */}
      {enlargedPhoto && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={enlargedPhoto}
              alt="Enlarged proof photo"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setEnlargedPhoto(null)}
              className="absolute top-4 right-4 bg-white/90 text-gray-800 rounded-full p-2 hover:bg-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
