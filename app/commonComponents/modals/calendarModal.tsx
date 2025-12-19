"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ButtonContentLoading } from "@/app/commonComponents/utils/loading";
import ErrorModal from "./errorModal";
import ConfirmModal from "./confirmModal";
import { InterviewModalProps } from "../utils/Types/modal";

export default function InterviewModal({
  show,
  onClose,
  applicationId,
  currentDate,
  currentTime,
  onSave,
  onView,
  appliedDate,
  status,
}: InterviewModalProps & { status?: string }) {
  const [date, setDate] = useState(currentDate || "");
  const [time, setTime] = useState(currentTime || "");
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedStatus = status?.trim().toLowerCase();
  const isDone = normalizedStatus !== "pending"; 
  
  // Helper to normalize a date to local midnight
  const toDateOnly = (d: Date | string) => {
    const dt = typeof d === 'string' ? new Date(d) : new Date(d);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  };

  const today = toDateOnly(new Date());
  const minDateObj = new Date(today);

  // Compute allowed windows relative to the original interview date
  const originalDateObj = currentDate ? toDateOnly(`${currentDate}T00:00:00`) : null;
  const startOfWeekOriginal = originalDateObj ? new Date(originalDateObj.getFullYear(), originalDateObj.getMonth(), originalDateObj.getDate() - originalDateObj.getDay()) : null; // Sunday start
  const endOfWeekOriginal = startOfWeekOriginal ? new Date(startOfWeekOriginal.getFullYear(), startOfWeekOriginal.getMonth(), startOfWeekOriginal.getDate() + 6) : null; // Saturday end
  const weekAfterOriginal = originalDateObj ? new Date(originalDateObj.getFullYear(), originalDateObj.getMonth(), originalDateObj.getDate() + 7) : null;

  // For input max, choose the furthest upper bound; HTML can't express union but we'll validate precisely on save
  const maxUpper = (() => {
    if (endOfWeekOriginal && weekAfterOriginal) return endOfWeekOriginal > weekAfterOriginal ? endOfWeekOriginal : weekAfterOriginal;
    return weekAfterOriginal || endOfWeekOriginal || new Date(today);
  })();

  const minDate = minDateObj.toISOString().split("T")[0];
  const maxDate = maxUpper.toISOString().split("T")[0];

  useEffect(() => {
    setDate(currentDate || "");
    setTime(currentTime || "");
  }, [currentDate, currentTime]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    }

    setIsAnimating(false);
    const timer = setTimeout(() => setIsVisible(false), 150);
    return () => clearTimeout(timer);
  }, [show]);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible && !isSaving) handleModalClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, isSaving]);

  const handleModalClose = () => {
    if (isSaving) return;
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setIsVisible(false);
      setShowConfirm(false);
    }, 150);
  };

  const handleSave = () => {
    const showError = (message: string) => {
      setErrorMessage(message);
      setErrorOpen(true);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setErrorOpen(false), 2000);
    };

    if (!date || !time) {
      showError("Please set both date and time before saving.");
      return;
    }

    const selectedDate = toDateOnly(`${date}T00:00:00`);

    const [hour, minute] = time.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      showError("Please provide a valid interview time.");
      return;
    }

    if (hour < 9 || hour > 18 || (hour === 18 && minute > 0)) {
      showError("Interview time must be between 9:00 AM and 6:00 PM.");
      return;
    }

    // New validations per requirements
    // 1) Not before today
    if (selectedDate < minDateObj) {
      showError("Interview date cannot be before today.");
      return;
    }

    // 2) Not the exact same date AND time as original
    if (originalDateObj && currentTime) {
      const sameDay = selectedDate.getTime() === originalDateObj.getTime();
      const sameTime = time === currentTime;
      if (sameDay && sameTime) {
        showError("New interview date and time cannot match the original schedule.");
        return;
      }
    }

    // 3) Allowed windows: same week as original OR within one week after the original date
    if (originalDateObj && startOfWeekOriginal && endOfWeekOriginal && weekAfterOriginal) {
      const inSameWeek = selectedDate >= startOfWeekOriginal && selectedDate <= endOfWeekOriginal;
      const withinWeekAfter = selectedDate >= originalDateObj && selectedDate <= weekAfterOriginal;
      if (!inSameWeek && !withinWeekAfter) {
        showError("Interview date must be within the same week as the original date or within one week after the original date.");
        return;
      }
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    try {
      setIsSaving(true);
      await onSave(date, time);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (!isVisible) return null;

  const modalContent = (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[9999] px-4 transition-all duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={(e) => { if (!isSaving) handleModalClose(); }}
      >
        <div
          className={`bg-white p-6 text-black rounded-lg shadow-lg w-full max-w-md transition-all duration-300 ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mb-4 relative">
            <h2 className="text-xl font-semibold text-gray-900">
              {isDone ? "Interview Completed" : "Edit Interview Schedule"}
            </h2>
            <p className="text-sm mt-10 text-gray-500">
              {isDone
                ? "This interview has already been completed. You can only view the application."
                : "Update the borrower’s interview date and time."}
            </p>
          </div>

          {/* Only show date/time inputs if still pending */}
          {!isDone && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Interview Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  max={maxDate}
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Interview Time
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
                />
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-6">
            {isDone ? (
              <button
                type="button"
                onClick={() => onView(applicationId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Application
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? <ButtonContentLoading label="Saving..." /> : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => onView(applicationId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  View Application
                </button>
              </>
            )}
             <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Error & Confirmation Modals */}
      <ErrorModal isOpen={errorOpen} message={errorMessage} onClose={() => setErrorOpen(false)} />
      <ConfirmModal
        show={showConfirm}
        message="Do you want to save these changes?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
