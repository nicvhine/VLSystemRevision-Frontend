"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PrivacyContentModal({ language, onClose, onReadComplete }: { language: 'en' | 'ceb'; onClose: () => void; onReadComplete?: () => void }) {
  const [animateIn, setAnimateIn] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [nearEnd, setNearEnd] = useState(false);

  // Animation setup
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => setAnimateIn(true), 10);
    return () => { 
      clearTimeout(timer);
      setAnimateIn(false);
    };
  }, [mounted]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Fallback scroll-based check
    const onScroll = () => {
      const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
      const progress = el.scrollTop / maxScroll;
      if (progress >= 0.9 && !nearEnd) setNearEnd(true);
      const thresholdPx = 8;
      const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - thresholdPx;
      if ((progress >= 0.97 || atEnd) && !hasReachedEnd) {
        setHasReachedEnd(true);
        onReadComplete?.();
      }
    };
    el.addEventListener('scroll', onScroll);

    // If no overflow, mark as read
    if (el.scrollHeight <= el.clientHeight + 1 && !hasReachedEnd) {
      setHasReachedEnd(true);
      onReadComplete?.();
    }

    // IntersectionObserver sentinel
    let observer: IntersectionObserver | null = null;
    if (bottomRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting && !hasReachedEnd) {
            setHasReachedEnd(true);
            onReadComplete?.();
          }
        },
        { root: el, threshold: 0, rootMargin: '0px 0px -1px 0px' }
      );
      observer.observe(bottomRef.current);
    }

    onScroll();
    requestAnimationFrame(onScroll);

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (observer && bottomRef.current) observer.unobserve(bottomRef.current);
    };
  }, [hasReachedEnd, onReadComplete]);

  // Mark as read immediately upon opening
  useEffect(() => {
    if (!hasReachedEnd) {
      setHasReachedEnd(true);
      onReadComplete?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => { 
    setAnimateIn(false); 
    setTimeout(() => onClose(), 300); 
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!mounted) return null;

  const markup = (
    <div 
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] px-4 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[85vh] overflow-hidden relative text-black transform transition-all duration-300 ease-out ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'en' ? 'Privacy Policy' : 'Palisiya sa Privacy'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'en' ? 'Effective Date:' : 'Petsa sa Pagpatuman:'} {new Date().toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 88px)' }}>
          <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
            <h3 className="text-gray-700 mb-1">1. Scope</h3>
            <p className="text-gray-700">This Policy explains how we collect, use, disclose, and protect your personal data when you apply for and use our Service.</p>
            <h3 className="text-gray-700 mb-1">2. Data We Collect</h3>
            <p className="text-gray-700">Includes identification details, contact information, demographic data, financial and employment details, references, documents, device and usage data.</p>
            <h3 className="text-gray-700 mb-1">3. Purposes of Processing</h3>
            <p className="text-gray-700">To evaluate your application, perform credit and risk assessments, comply with legal obligations, communicate with you, and improve the Service.</p>
            <h3 className="text-gray-700 mb-1">4. Legal Bases</h3>
            <p className="text-gray-700">We process data based on your consent, performance of a contract, legal obligations, and legitimate interests such as fraud prevention and Service improvement.</p>
            <h3 className="text-gray-700 mb-1">5. Sharing and Disclosure</h3>
            <p className="text-gray-700">We may share data with regulators, credit bureaus, payment and verification partners, affiliates, and service providers subject to appropriate safeguards.</p>
            <h3 className="text-gray-700 mb-1">6. Data Retention</h3>
            <p className="text-gray-700">We retain personal data only as long as necessary for the purposes stated and as required by law and regulatory guidelines.</p>
            <h3 className="text-gray-700 mb-1">7. Your Rights</h3>
            <p className="text-gray-700">You may access, correct, or request deletion of your data, withdraw consent, and object to processing, subject to applicable laws.</p>
            <h3 className="text-gray-700 mb-1">8. Security</h3>
            <p className="text-gray-700">We implement organizational, technical, and physical safeguards to protect your information from unauthorized access and misuse.</p>
            <h3 className="text-gray-700 mb-1">9. International Transfers</h3>
            <p className="text-gray-700">Where data is transferred across borders, we ensure appropriate protection consistent with applicable data protection laws.</p>
            <h3 className="text-gray-700 mb-1">10. Cookies and Tracking</h3>
            <p className="text-gray-700">We may use cookies and similar technologies for analytics and functionality. You can control cookies via your browser settings.</p>
            <h3 className="text-gray-700 mb-1">11. Updates</h3>
            <p className="text-gray-700">We may update this Policy from time to time. Material updates will be communicated via the app or email.</p>
            <h3 className="text-gray-700 mb-1">12. Contact</h3>
            <p className="text-gray-700">For privacy inquiries or complaints, contact our Data Protection Officer via the contact details in the app.</p>
          </div>
          {!hasReachedEnd && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              {language === 'en' ? 'Scroll to the bottom to mark as read' : 'I-scroll sa ubos aron ma-mark nga nabasa'}
            </div>
          )}
          {!hasReachedEnd && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => { setHasReachedEnd(true); onReadComplete?.(); }}
                className={`px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700`}
              >
                {language === 'en' ? 'Mark as Read' : 'I-mark nga Nabasa'}
              </button>
            </div>
          )}
          {/* Sentinel for end-of-content detection */}
          <div ref={bottomRef} className="h-1 w-full"></div>
        </div>
      </div>
    </div>
  );
  const target = typeof document !== 'undefined' ? document.body : null;
  if (!target) return null;
  return createPortal(markup, target);
}
