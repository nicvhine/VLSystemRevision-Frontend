'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ButtonContentLoading, LoadingSpinner } from "@/app/commonComponents/utils/loading";
import SuccessModal from "../successModal";
import ErrorModal from "../errorModal";
import SubmitOverlayToast from "@/app/commonComponents/utils/submitOverlayToast";
import emailjs from "emailjs-com";
import applicationActionsTranslation from "../../translation/applicationActionsTranslation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Interface for application data structure
interface Application {
  applicationId: string;
  appName: string;
  appEmail?: string | null;
  appLoanAmount?: number;
  appInterest?: number;
  appLoanTerms?: number;
  status?: string;
  borrowersId?: string;
  appContact: string;
  profilePic: string;
}

// Collector type
interface Collector {
  name: string;
  userId: string;
}

// Simple validators
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'`\-\.\s]{2,80}$/; // letters, spaces, hyphen, apostrophe, dot
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function validateName(name?: string | null): string | null {
  const n = (name || "").trim();
  if (!n) return "Name is required.";
  if (!NAME_REGEX.test(n)) return "Enter a valid full name (letters only).";
  // Require at least two words for better identity (optional, but helpful)
  if (n.split(/\s+/).length < 2) return "Please include at least first and last name.";
  return null;
}

function validateEmail(email?: string | null): { error: string | null; warning: string | null } {
  const e = (email || "").trim();
  if (!e) return { error: null, warning: "No email on file – credentials email will not be sent." };
  if (!EMAIL_REGEX.test(e)) return { error: "Email format looks invalid.", warning: null };
  return { error: null, warning: null };
}

// Send email helper
const sendEmail = async ({
  to_name,
  email,
  borrower_username,
  borrower_password,
  onError,
}: {
  to_name: string;
  email?: string | null;
  borrower_username: string;
  borrower_password: string;
  onError: (msg: string) => void;
}) => {
  if (!email) return;
  try {
    const result = await emailjs.send(
      "service_c1qaot4",
      "template_gqc0n98",
      { to_name, email, borrower_username, borrower_password },
      "oo7hIZjduEzSoqCY9"
    );
    console.log("Email sent:", result?.text || result);
  } catch (error: any) {
    console.error("EmailJS error:", error);
    onError("Email failed: " + (error?.text || error.message || "Unknown error"));
  }
};

interface AccountModalProps {
  a?: typeof applicationActionsTranslation.en;
}

export default forwardRef(function AccountModal({ a }: AccountModalProps = {}, ref) {
  const i = a ?? applicationActionsTranslation.en;
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [selectedCollectorId, setSelectedCollectorId] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingCollectors, setIsFetchingCollectors] = useState(false);
  const [collectorsError, setCollectorsError] = useState<string | null>(null);

  // Derived field validations
  const nameError = validateName(selectedApp?.appName);
  const { error: emailError, warning: emailWarning } = validateEmail(selectedApp?.appEmail);

  // Expose openModal to parent
  useImperativeHandle(ref, () => ({
    openModal(app: Application) {
      setSelectedApp(app);
      setSelectedCollectorId("");
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    },
  }));

  // Prevent closing via Escape while processing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && !isProcessing) handleModalClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible, isProcessing]);

  const handleModalClose = () => {
    if (isProcessing) return;
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setSelectedApp(null);
      setSelectedCollectorId("");
    }, 150);
  };

  // Fetch helper with token
  async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    return fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
  }

  // Load collectors
  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        setCollectorsError(null);
        setIsFetchingCollectors(true);
        const res = await authFetch(`${BASE_URL}/users/collectors`);
        if (!res.ok) {
          let msg = "Failed to fetch collectors";
          try {
            const d = await res.json();
            msg = d?.error || msg;
          } catch {}
          throw new Error(msg);
        }

        // Expect backend to return { name, userId } array
        const data: Collector[] = await res.json();
      setCollectors(Array.isArray(data) ? data : []);
      if (!Array.isArray(data) || data.length === 0) setCollectorsError(i.ma6);
      } catch (error: any) {
        console.error("Error fetching collectors:", error);
        setCollectors([]);
      setCollectorsError(error?.message || i.ma8);
      } finally {
        setIsFetchingCollectors(false);
      }
    };

    fetchCollectors();
  }, []);


  const handleCreateAccount = async () => {
    if (!selectedApp) return;

    // Cross-check validations
    if (nameError) {
      setErrorMessage(nameError);
      setErrorOpen(true);
      setTimeout(() => setErrorOpen(false), 5000);
      return;
    }

    if (emailError) {
      setErrorMessage(emailError);
      setErrorOpen(true);
      setTimeout(() => setErrorOpen(false), 5000);
      return;
    }

    if (!selectedCollectorId) {
      setErrorMessage(i.ma7);
      setErrorOpen(true);
      setTimeout(() => setErrorOpen(false), 5000);
      return;
    }

    const selectedCollector = collectors.find(c => c.userId === selectedCollectorId);

    try {
      setIsProcessing(true);

      // Set application status active
      const appRes = await authFetch(`${BASE_URL}/loan-applications/${selectedApp.applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Disbursed" }),
      });
      if (!appRes.ok) {
        let msg = "Failed to update application status";
        try { const errData = await appRes.json(); msg = errData?.error || msg; } catch {}
        throw new Error(msg);
      }

      // Generate new loan
      const loanResponse = await authFetch(
        `${BASE_URL}/loans/generate-loan/${selectedApp.applicationId}`,
        { method: "POST" }
      );
      if (!loanResponse.ok) {
        let msg = "Failed to generate loan";
        try { const d = await loanResponse.json(); msg = d?.error || msg; } catch {}
        throw new Error(msg);
      }

      setSuccessMessage(i.ma14);

      setSuccessOpen(true);
      
      // Close account modal after 2 seconds
      setTimeout(() => {
        handleModalClose();
      }, 2000);
      
      // Close success modal after 5 seconds
      setTimeout(() => {
        setSuccessOpen(false);
      }, 5000);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(`Error: ${error.message}`);
      setErrorOpen(true);
      setTimeout(() => setErrorOpen(false), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <SubmitOverlayToast open={isProcessing} message={i.to1} />
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-150 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`bg-white rounded-lg p-6 w-full max-w-md shadow-lg transition-all duration-150 ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-xl font-semibold text-black">{i.ma1}</h2>
              <p className="text-sm text-gray-600 mt-1">{i.ma2}</p>
            </div>
            <button
              onClick={handleModalClose}
              className={`flex-shrink-0 p-1 text-gray-500 rounded-full ${isProcessing ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-100'}`}
              disabled={isProcessing}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Applicant summary + validations */}
          <div className="mb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base text-black font-medium truncate" title={selectedApp?.appName || ''}>{selectedApp?.appName}</p>
                {nameError && (
                  <p className="text-xs text-red-600 mt-1" role="alert">{nameError}</p>
                )}
                <p className="text-sm text-gray-700 mt-1">
                  {selectedApp?.appEmail ? (
                    <>
                      <span className="font-medium">Email:</span> {selectedApp.appEmail}
                    </>
                ) : (
                  <span className="italic text-gray-500">{i.ma10}</span>
                )}
                </p>
                {emailError && (
                  <p className="text-xs text-red-600 mt-1" role="alert">{emailError}</p>
                )}
                {!emailError && emailWarning && (
                  <p className="text-xs text-amber-600 mt-1" role="status">{emailWarning}</p>
                )}
              </div>
            </div>
          </div>

          <label className="block text-sm font-medium text-black mb-2">{i.ma3}</label>
          <div className="relative">
            <select
              value={selectedCollectorId}
              onChange={(e) => setSelectedCollectorId(e.target.value)}
              disabled={isFetchingCollectors || isProcessing}
              className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-black disabled:bg-gray-100 disabled:text-gray-500"
              aria-invalid={!selectedCollectorId}
            >
              <option value="">
                {isFetchingCollectors ? i.ma4 : i.ma5}
              </option>
              {collectors.map((c) => (
                <option key={c.userId} value={c.userId}>
                  {c.name}
                </option>
              ))}
            </select>

            {isFetchingCollectors && <span className="absolute right-2 top-1/2 -translate-y-1/2"><LoadingSpinner size={4} /></span>}
            {collectorsError && !isFetchingCollectors && (
              <p className="text-xs text-red-600 mt-2" role="alert">{collectorsError}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleModalClose}
              disabled={isProcessing}
            >
              {i.cm7}
            </button>

            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={() => handleCreateAccount()}
              disabled={
                isProcessing ||
                !!nameError ||
                !!emailError ||
                !selectedCollectorId
              }
              aria-disabled={
                isProcessing ||
                !!nameError ||
                !!emailError ||
                !selectedCollectorId
              }
            >
              {isProcessing ? <ButtonContentLoading label={i.ma11} /> : i.b7}
            </button>
          </div>
        </div>
      </div>

      <SuccessModal isOpen={successOpen} message={successMessage} onClose={() => setSuccessOpen(false)} />
      <ErrorModal isOpen={errorOpen} message={errorMessage} onClose={() => setErrorOpen(false)} />
    </>
  );
});
