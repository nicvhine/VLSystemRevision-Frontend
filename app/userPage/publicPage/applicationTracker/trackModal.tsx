"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { ButtonContentLoading } from "@/app/commonComponents/utils/loading";
import ErrorModal from "@/app/commonComponents/modals/errorModal";
import translations from "@/app/commonComponents/translation";

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: "en" | "ceb";
}

const progressSteps = {
  en: ["Pending", "Endorsed", "Approved"],
  ceb: ["Nagahulat", "Gipadala", "Gidawat"]
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function TrackModal({ isOpen, onClose, language = "en" }: TrackModalProps) {
  const router = useRouter(); 
  const [status, setStatus] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const t = translations.trackerApplication[language];

  // Modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShowModal(false);
        setStatus(null);
        setApplicationId("");
        setShowErrorModal(false);
        setErrorMsg("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!showModal) return null;

  const handleClose = () => {
    if (isTracking) return;
    setAnimateIn(false);
    setTimeout(() => onClose(), 300);
  };

  const handleTrack = async () => {
    if (!applicationId.trim()) {
      setErrorMsg(t.er1);
      setShowErrorModal(true);
      return;
    }

    try {
      setIsTracking(true);
      const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}`);
      if (!res.ok) {
        setStatus(null);
        setErrorMsg(t.er2);
        setShowErrorModal(true);
        return;
      }

      const data = await res.json();
      setStatus(data.status);
      setShowErrorModal(false);
      setErrorMsg("");
    } catch (err) {
      console.error(err);
      setErrorMsg(t.er3);
      setShowErrorModal(true);
    } finally {
      setIsTracking(false);
    }
  };

  const getProgress = () => {
    if (!status) return 0;
    switch (status) {
      case "Applied":
      case "Pending":
        return 1; 
      case "Cleared":
        return 2; 
      case "Approved":
      case "Disbursed":
      case "Active":
        return 3; 
      default:
        return 0;
    }
  };

  const handleReapply = () => {
    router.push("/userPage/publicPage/applyLoan");
    handleClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-150 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      >
        {/* Modal Container */}
        <div
          className={`bg-white rounded-lg p-6 w-full max-w-md shadow-lg transition-all duration-150 relative text-black ${
            animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isTracking}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✖
          </button>

          {/* Header */}
          <h2 className="text-xl font-semibold mb-1">{t.h2}</h2>
          <p className="text-sm mb-3">{t.n1}</p>

          {/* Input */}
          <input
            type="text"
            placeholder="Application ID"
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 uppercase focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
          />

          {/* Track Button */}
          <div className={`flex justify-center ${status ? "mb-4" : "mb-0"}`}>
            <button
              onClick={isTracking ? undefined : handleTrack}
              disabled={isTracking}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isTracking ? <ButtonContentLoading label={t.t1} /> : t.t2}
            </button>
          </div>

          {/* Progress / Denied */}
          {status && (
            <div className="mt-6 p-4">
              {status === "Denied" ? (
                <div className="text-center text-black-600">
                  {"Your application was denied."}
                  <div className="flex flex-col gap-2">
                    <button
                      className="w-full text-red-600 py-2 rounded transition"
                      onClick={handleReapply}
                    >
                      Click here to reapply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between relative w-full">
                  {progressSteps[language].map((step, index) => {
                    const isCompleted = index < getProgress();
                    const isLast = index === progressSteps[language].length - 1;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center relative">
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold text-sm z-10 ${
                            isCompleted ? "bg-red-600 text-white shadow-lg" : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {isCompleted ? "✓" : index + 1}
                        </div>
                        <span
                          className={`mt-2 text-xs text-center font-medium ${
                            isCompleted ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          {step}
                        </span>
                        {!isLast && (
                          <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-300">
                            <div
                              className={`h-0.5 bg-red-600 transition-all duration-500 ${
                                index < getProgress() - 1 ? "w-1/2" : "w-0"
                              }`}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Shared error modal */}
      <ErrorModal
        isOpen={showErrorModal}
        message={errorMsg}
        onClose={() => setShowErrorModal(false)}
      />
    </>
  );
}
