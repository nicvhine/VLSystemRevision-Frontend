"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import translations from "@/app/commonComponents/translation";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: FC<ConfirmModalProps> = ({ isOpen, title = "Confirm", message, onConfirm, onCancel, loading = false }) => {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    if (saved === 'en' || saved === 'ceb') setLanguage(saved);
    const onLang = (e: Event) => {
      try {
        const ev = e as CustomEvent;
        const lang = ev.detail?.language;
        if (lang === 'en' || lang === 'ceb') setLanguage(lang);
      } catch {}
    };
    const onStorage = () => {
      const l = localStorage.getItem('language');
      if (l === 'en' || l === 'ceb') setLanguage(l);
    };
    window.addEventListener('languageChange', onLang as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('languageChange', onLang as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const s = translations.sysadTranslation[language];

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] transition-opacity duration-300 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
      onClick={onCancel}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 ease-out ${
          animateIn ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>
        <p className="mb-6 text-gray-700 text-center">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? "Processing..." : s.t75}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {s.t6}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined" ? createPortal(modalContent, document.body) : null;
};

export default ConfirmModal;
