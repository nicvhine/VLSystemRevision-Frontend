'use client';

import React, { useState } from "react";
import ConfirmModal from "@/app/commonComponents/modals/confirmModal";

interface UploadSectionProps {
  language: 'en' | 'ceb';
  photo2x2: File[];
  documents: File[];
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeProfile: (index: number) => void;
  removeDocument: (index: number) => void;
  missingFields?: string[];
  requiredDocumentsCount?: number;
  showFieldErrors?: boolean;
  previousProfileUrl?: string | { fileName?: string; filePath?: string; mimeType?: string } | null;
  previousDocuments?: { fileName?: string; filePath?: string; mimeType?: string }[];
  onUsePreviousProfile?: (fileUrl: string) => Promise<{ ok: boolean; error?: string } | void>;
  onUsePreviousDocument?: (index: number) => Promise<{ ok: boolean; error?: string } | void>;
  removePreviousProfile?: () => void;
  removePreviousDocument?: (index: number) => void;
  allowUsePreviousProfile?: boolean;
}

export default function UploadSection({
  language,
  photo2x2,
  documents,
  handleProfileChange,
  handleFileChange,
  removeProfile,
  removeDocument,
  missingFields = [],
  requiredDocumentsCount,
  showFieldErrors = false,
  previousProfileUrl = null,
  previousDocuments = [],
  onUsePreviousProfile,
  onUsePreviousDocument,
  removePreviousProfile,
  removePreviousDocument,
  allowUsePreviousProfile = true,
}: UploadSectionProps) {

  // Normalize old profile URL
  const normalizedPrevUrl =
    typeof previousProfileUrl === "object"
      ? previousProfileUrl?.filePath || null
      : typeof previousProfileUrl === "string" && previousProfileUrl.startsWith("http")
        ? previousProfileUrl
        : null;

  // Extract previous profile filename (if available) without rendering its preview image
  const prevProfileName =
    typeof previousProfileUrl === 'object'
      ? previousProfileUrl?.fileName || previousProfileUrl?.filePath?.split('/').pop() || null
      : typeof previousProfileUrl === 'string'
        ? previousProfileUrl.split('/').pop()
        : null;

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'profile' | 'document' | 'prevProfile' | 'prevDocument' | null>(null);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>("");

  const confirm = (type: typeof confirmType, message: string, index: number | null = null) => {
    setConfirmType(type);
    setConfirmMessage(message);
    setRemoveIndex(index);
    setShowConfirm(true);
  };

  const handleConfirmRemove = () => {
    if (confirmType === 'profile' && removeIndex !== null) removeProfile(removeIndex);
    if (confirmType === 'document' && removeIndex !== null) removeDocument(removeIndex);
    if (confirmType === 'prevProfile') removePreviousProfile?.();
    if (confirmType === 'prevDocument' && removeIndex !== null) removePreviousDocument?.(removeIndex);

    setShowConfirm(false);
    setTimeout(() => {
      setRemoveIndex(null);
      setConfirmType(null);
    }, 300);
  };

  const handleCancelRemove = () => {
    setShowConfirm(false);
    setTimeout(() => {
      setRemoveIndex(null);
      setConfirmType(null);
    }, 300);
  };

  return (
    <div>
      {/* Profile Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
          {language === 'en' ? '2x2 Photo Upload' : 'I-upload ang 2x2 nga Litrato'}
          <span className="relative inline-flex group align-middle ml-2">
            <button
              type="button"
              aria-label={language === 'en' ? 'File format information' : 'Impormasyon sa format sa file'}
              className="h-5 w-5 rounded-full bg-gray-200 text-gray-700 text-[10px] leading-5 inline-flex items-center justify-center select-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
              tabIndex={0}
            >
              i
            </button>
            <div
              role="tooltip"
              className="absolute z-30 top-1/2 left-full ml-2 -translate-y-1/2 w-max rounded-md bg-gray-100 text-gray-800 text-xs p-2 shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none font-normal"
            >
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-100 rotate-45 border-l border-t border-gray-200"></div>
              <span className="whitespace-nowrap">{language === 'en' ? 'Only PNG & JPG files are accepted' : 'PNG ug JPG ra ang madawat'}</span>
            </div>
          </span>
        </h4>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-red-300 transition-colors ${
            showFieldErrors && missingFields.includes('2x2 Photo')
              ? 'border-red-500'
              : 'border-gray-200'
          }`}
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleProfileChange}
            disabled={photo2x2.length > 0}
            className={`block w-full text-sm text-gray-600 cursor-pointer
              file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium
              file:bg-red-50 file:text-red-600 hover:file:bg-red-100
              ${photo2x2.length > 0 ? 'opacity-50 cursor-not-allowed file:bg-gray-100 file:text-gray-400 hover:file:bg-gray-100' : ''}`}
          />
        </div>

        {/* Show previous profile image */}
        {!photo2x2.length && normalizedPrevUrl && (
          <div className="mt-6 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full border border-gray-200 shadow-sm overflow-hidden">
              <img
                src={normalizedPrevUrl}
                alt="Previous 2x2"
                className="object-cover w-full h-full"
                crossOrigin="anonymous"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {language === 'en' ? 'Previously uploaded 2x2' : 'Naunang 2x2 nga litrato'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {allowUsePreviousProfile ? (
                <button
                  onClick={async () => {
                    if (normalizedPrevUrl) {
                      await onUsePreviousProfile?.(normalizedPrevUrl);
                    }
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                >
                  {language === 'en' ? 'Use previous' : 'Gamita ang nauna'}
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-200 text-gray-500 px-3 py-1 rounded text-xs cursor-not-allowed"
                >
                  {language === 'en' ? 'Use previous' : 'Gamita ang nauna'}
                </button>
              )}
              <button
                onClick={() =>
                  confirm(
                    'prevProfile',
                    language === 'en'
                      ? 'Remove the previous 2x2 preview?'
                      : 'Tangtanga ang naunang 2x2?'
                  )
                }
                className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
              >
                {language === 'en' ? 'Remove' : 'Tangtangon'}
              </button>
            </div>
          </div>
        )}

        {/* New profile preview */}
        {photo2x2.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {photo2x2.map((file, index) => (
              <div key={index} className="flex flex-col items-center w-full justify-center">
                <img
                  src={URL.createObjectURL(file)}
                  alt="2x2 Preview"
                  className="w-24 h-24 object-cover rounded border shadow-sm mb-2 mx-auto"
                />
                <p className="text-sm text-gray-600">{file.name}</p>
                <button
                  onClick={() => confirm('profile', 'Remove this photo?', index)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                >
                  {language === 'en' ? 'Remove' : 'Tangtangon'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
          {language === 'en' ? 'Document Upload' : 'I-upload ang mga Dokumento'}
          <span className="relative inline-flex group align-middle ml-2">
            <button
              type="button"
              aria-label={language === 'en' ? 'File format information' : 'Impormasyon sa format sa file'}
              className="h-5 w-5 rounded-full bg-gray-200 text-gray-700 text-[10px] leading-5 inline-flex items-center justify-center select-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
              tabIndex={0}
            >
              i
            </button>
            <div
              role="tooltip"
              className="absolute z-30 top-1/2 left-full ml-2 -translate-y-1/2 w-max rounded-md bg-gray-100 text-gray-800 text-xs p-2 shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none font-normal"
            >
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-100 rotate-45 border-l border-t border-gray-200"></div>
              <span className="whitespace-nowrap">{language === 'en' ? 'Only PNG & JPG files are accepted' : 'PNG ug JPG ra ang madawat'}</span>
            </div>
          </span>
        </h4>

        {/* Document count progress */}
        {typeof requiredDocumentsCount === 'number' && (
          <div className="mb-3 text-sm">
            <span className={documents.length === requiredDocumentsCount ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {language === 'en' 
                ? `${documents.length} of ${requiredDocumentsCount} documents uploaded` 
                : `${documents.length} sa ${requiredDocumentsCount} nga dokumento na-upload`}
            </span>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-6 hover:border-red-300 transition-colors ${
            showFieldErrors && missingFields.includes('Document Upload')
              ? 'border-red-500'
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <input
              id="documents-upload"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={
                typeof requiredDocumentsCount === 'number' &&
                documents.length >= requiredDocumentsCount
              }
              className="sr-only"
            />
            <label
              htmlFor="documents-upload"
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors
                ${
                  typeof requiredDocumentsCount === 'number' &&
                  documents.length >= requiredDocumentsCount
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
            >
              Choose Files
            </label>
            <span className="text-sm text-gray-700">
              {documents.length === 0
                ? 'No file chosen'
                : `${documents.length} ${documents.length === 1 ? 'file' : 'files'}`}
            </span>
          </div>
        </div>

        {/* New docs preview */}
        {documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  {file.type.includes("pdf") ? (
                    <span className="text-red-600 font-bold">PDF</span>
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <p className="text-sm text-gray-700">{file.name}</p>
                </div>
                <button
                  onClick={() => confirm('document', 'Remove this document?', index)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                >
                  {language === 'en' ? 'Remove' : 'Tangtangon'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Previous documents removed: borrowers must upload fresh documents */}
      </div>

      <ConfirmModal
        show={showConfirm}
        message={confirmMessage}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </div>
  );
}
