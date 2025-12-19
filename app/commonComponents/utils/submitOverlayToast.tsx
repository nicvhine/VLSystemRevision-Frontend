"use client";

import React from "react";
import { LoadingSpinner } from "@/app/commonComponents/utils/loading";
import { SubmitOverlayToastProps } from "./Types/components";

export default function SubmitOverlayToast({ open, message = "Processing...", variant = "info" }: SubmitOverlayToastProps & { variant?: "info" | "success" | "error" }) {
  if (!open) return null;
  const styles = {
    info: {
      container: "bg-white/95 border-gray-200",
      dot: <LoadingSpinner size={5} />,
      text: "text-gray-800",
    },
    success: {
      container: "bg-green-50 border-green-300",
      dot: (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
          <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
            <path d="M5 10l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      text: "text-green-800",
    },
    error: {
      container: "bg-red-50 border-red-300",
      dot: (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500">
          <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
            <path d="M6 6l8 8M14 6l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ),
      text: "text-red-800",
    },
  } as const;
  const theme = styles[variant];
  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className={`flex items-center gap-3 rounded-lg shadow-xl border px-4 py-3 ${theme.container}`}>
        {theme.dot}
        <span className={`text-sm font-medium ${theme.text}`}>{message}</span>
      </div>
    </div>
  );
}
