'use client';

import React, { useState, useRef } from "react";
import ConfirmModal from "../../../modals/confirmModal";
import DenialReasonModal from "../../../modals/denialReasonModal";
import { 
  handleClearedLoan, 
  handleDisburse, 
  handleDenyApplication, 
  handleApproveApplication, 
  handleDenyFromCleared 
} from "./statusHandler";
import { createPortal } from "react-dom";
import SubmitOverlayToast from "@/app/commonComponents/utils/submitOverlayToast";
import { ApplicationButtonsProps } from "@/app/commonComponents/utils/Types/components";

const ApplicationButtons: React.FC<ApplicationButtonsProps> = ({
  application,
  role,
  setApplications,
  authFetch,
  setIsModalOpen,
  modalRef,
  setIsAgreementOpen,
  a,
  showSuccess,
  showError,
}) => {
  const [showDocsDropdown, setShowDocsDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);


  const [showConfirm, setShowConfirm] = useState<{ type: 'approve' | 'deny' | 'disburse' | 'clear' | 'dismissPending' | null }>({ type: null });
  const [pendingAction, setPendingAction] = useState<() => Promise<void> | void>(() => () => {});
  const [isActing, setIsActing] = useState(false);
  
  // Denial modal state
  const [showDenialModal, setShowDenialModal] = useState(false);
  const [denialType, setDenialType] = useState<'direct' | 'fromCleared' | null>(null);
  const [isDenying, setIsDenying] = useState(false);

  if (!application) return null;

  const handleDocumentClick = (type: "loan" | "release") => {
    setIsAgreementOpen(type);
    setShowDocsDropdown(false);
  };

  const toggleDropdown = () => {
    if (!showDocsDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
    setShowDocsDropdown(!showDocsDropdown);
  };

  const statusMessage = (status: string) =>
    a.cm2
      .replace("{id}", application.applicationId)
      .replace("{status}", status);

  const handleDenialConfirm = async (reason: string, missingDocuments?: Record<string, boolean>, description?: string) => {
    setIsDenying(true);
    try {
      if (denialType === 'direct') {
        await handleDenyApplication(application, setApplications, authFetch, showSuccess, showError, reason, missingDocuments, description);
      } else if (denialType === 'fromCleared') {
        await handleDenyFromCleared(application, setApplications, authFetch, showSuccess, showError, reason, missingDocuments, description);
      }
      setShowDenialModal(false);
      setDenialType(null);
    } catch (error) {
      console.error('Denial error:', error);
    } finally {
      setIsDenying(false);
    }
  };

  return (
    <>
      {application.status === "Applied" && role === "loan officer" && !(application as any).pendingWithdrawalRequest && (
        <>
          {/* set schedule */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium"
          >
            {a.b1}
          </button>
          {/* deny loan */}
          <button
            onClick={() => {
              setDenialType('direct');
              setShowDenialModal(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            {a.b2}
          </button>
        </>
      )}

      {application.status === "Disbursed" && role === "manager" && (
        <button
          onClick={() => modalRef.current?.openModal(application)}
          className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium"
        >
          {application.isReloan ? a.b6 : a.b7}
        </button>
      )}

      {application.status === "Pending" && role === "loan officer" && (
        <>
          <button
            onClick={() => {
              setShowConfirm({ type: 'clear' });
              setPendingAction(() => () => handleClearedLoan(application, setApplications, authFetch, showSuccess, showError));
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {a.b3}
          </button>
          <button
            onClick={() => {
              setDenialType('fromCleared');
              setShowDenialModal(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            {a.b2}
          </button>
          <ConfirmModal
            show={showConfirm.type === 'clear'}
            message={statusMessage("Cleared")}
            title={a.cm1}
            confirmLabel={a.cm6}
            cancelLabel={a.cm7}
            processingLabel={a.cm5}
            onConfirm={async () => {
              setShowConfirm({ type: null });
              try {
                setIsActing(true);
                await Promise.resolve(pendingAction());
              } finally {
                setIsActing(false);
              }
            }}
            onCancel={() => setShowConfirm({ type: null })}
          />
        </>
      )}

      {application.status === "Cleared" && role === "manager" && (
        <>
          <button
            onClick={() => {
              setShowConfirm({ type: 'approve' });
              setPendingAction(() => () => handleApproveApplication(application, setApplications, authFetch, showSuccess, showError));
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {a.b8}
          </button>
          <button
            onClick={() => {
              setDenialType('direct');
              setShowDenialModal(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            {a.b9}
          </button>
      <ConfirmModal
        show={showConfirm.type === 'approve'}
        message={statusMessage("Approved")}
        title={a.cm1}
        confirmLabel={a.cm6}
        cancelLabel={a.cm7}
        processingLabel={a.cm5}
        onConfirm={async () => {
          setShowConfirm({ type: null });
          try {
            setIsActing(true);
            await Promise.resolve(pendingAction());
          } finally {
            setIsActing(false);
          }
        }}
        onCancel={() => setShowConfirm({ type: null })}
      />
        </>
      )}

      {application.status === "Approved" && role === "loan officer" && (
        <>
          <button
            onClick={() => {
              try {
                modalRef?.current?.openModal?.(application);
              } catch (err) {
                console.warn('Failed to open account modal on disburse click', err);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {a.b4}
          </button>
        </>
      )}

      {(application.status === "Disbursed" || application.status === "Active") && (
        <>
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={toggleDropdown}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {a.b5}
            </button>
            
            {/* Floating reminder for missing service fee */}
            {role === "loan officer" && application.hasServiceFee === "false" && (
              <>
                <style jsx>{`
                  @keyframes pointLeft {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-8px); }
                  }
                  .point-left {
                    animation: pointLeft 1.5s ease-in-out infinite;
                  }
                `}</style>
              <div className="absolute right-full top-1/2 -translate-y-1/2 ml-3 flex items-center gap-2 point-left flex-row-reverse">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-red-600"></div>

                <div className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                  Please update release form.
                </div>
              </div>
              </>
            )}
          </div>

          {showDocsDropdown && dropdownPos && createPortal(
            <div
              className="w-40 bg-red-600 text-white shadow-lg border rounded-md z-50"
              style={{
                position: 'absolute',
                top: dropdownPos.top,
                left: dropdownPos.left
              }}
            >
              <button
                onClick={() => handleDocumentClick("loan")}
                className="w-full text-left px-4 py-2 hover:bg-red-700"
              >
                {a.b10}
              </button>
              <button
                onClick={() => handleDocumentClick("release")}
                className="w-full text-left px-4 py-2 hover:bg-red-700"
              >
                {a.b11}
              </button>
            </div>,
            document.body
          )}
        </>
      )}

      <SubmitOverlayToast open={isActing} message={a.to1} />
      
      {/* Denial Reason Modal */}
      <DenialReasonModal
        isOpen={showDenialModal}
        onClose={() => {
          setShowDenialModal(false);
          setDenialType(null);
        }}
        onConfirm={handleDenialConfirm}
        applicationId={application?.applicationId}
        loading={isDenying}
        title="Denial Reason"
        confirmLabel="Submit"
        cancelLabel="Cancel"
        processingLabel="Submitting..."
      />
    </>
  );
};

export default ApplicationButtons;