"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DuplicateApplicationModalProps {
  language: "en" | "ceb";
  message: string;
  onClose: () => void;
}

export default function DuplicateApplicationModal({
  language,
  message,
  onClose,
}: DuplicateApplicationModalProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
    document.body.classList.add("overflow-hidden");

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity duration-150 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Wrapper */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-md rounded-lg bg-white p-6 shadow-2xl transition-all duration-150 ${
            animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === "en"
                  ? "Application Found"
                  : "Nakit-an ang Aplikasyon"}
              </h3>

              <p className="text-sm text-gray-600 mb-6">{message}</p>

              <div className="flex justify-end">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={onClose} 
                >
                {language === "en" ? "Understood" : "Nasabtan"}
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
