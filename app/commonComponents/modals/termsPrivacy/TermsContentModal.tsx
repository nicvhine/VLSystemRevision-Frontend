"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function TermsContentModal({ language, onClose, onReadComplete }: { language: 'en' | 'ceb'; onClose: () => void; onReadComplete?: () => void }) {
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

    // If content doesn't overflow, mark as read immediately
    if (el.scrollHeight <= el.clientHeight + 1 && !hasReachedEnd) {
      setHasReachedEnd(true);
      onReadComplete?.();
    }

    // IntersectionObserver sentinel at bottom for robust detection
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
              {language === 'en' ? 'Terms of Service' : 'Mga Termino sa Serbisyo'}
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
            <h3 className="text-gray-700 mb-1">1. Introduction</h3>
            <p className="text-gray-700">These Terms govern your use of our loan application services and related features (the "Service"). By submitting an application, you agree to these Terms.</p>
            <h3 className="text-gray-700 mb-1">2. Eligibility</h3>
            <p className="text-gray-700">Applicants must be of legal age and capable of entering into binding contracts. Additional eligibility criteria may apply based on loan products.</p>
            <h3 className="text-gray-700 mb-1">3. Application and Verification</h3>
            <p className="text-gray-700">You authorize us to collect and verify information, contact references, and conduct credit checks with authorized bureaus or partners.</p>
            <h3 className="text-gray-700 mb-1">4. Interest, Fees, and Charges</h3>
            <p className="text-gray-700">Interest rates, service charges, penalties, and any other fees applicable to your loan will be disclosed to you prior to approval and form part of your loan agreement.</p>
            <h3 className="text-gray-700 mb-1">5. Repayment and Default</h3>
            <p className="text-gray-700">Repayments must be made on schedule. Late or missed payments may incur penalties, collections actions, and affect your credit standing.</p>
            <h3 className="text-gray-700 mb-1">6. Communications</h3>
            <p className="text-gray-700">You consent to receive communications (SMS, email, calls, in-app notifications) related to your application and account.</p>
            <h3 className="text-gray-700 mb-1">7. Data Privacy</h3>
            <p className="text-gray-700">Your information is processed in accordance with our Privacy Policy. Do not submit third-party data unless you have obtained proper consent.</p>
            <h3 className="text-gray-700 mb-1">8. Prohibited Use</h3>
            <p className="text-gray-700">Do not submit false documents, misrepresent identity, or use the Service for unlawful purposes.</p>
            <h3 className="text-gray-700 mb-1">9. Changes to the Service</h3>
            <p className="text-gray-700">We may update the Service or these Terms from time to time. Material changes will be communicated through the app or by email.</p>
            <h3 className="text-gray-700 mb-1">10. Governing Law</h3>
            <p className="text-gray-700">These Terms are governed by applicable laws of your jurisdiction. Disputes shall be resolved by competent courts as provided by law.</p>
            <h3 className="text-gray-700 mb-1">11. Contact Us</h3>
            <p className="text-gray-700">For questions about these Terms, contact our support team through the details provided in the app.</p>
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
          {/* Sentinel used by IntersectionObserver to detect end-of-content */}
          <div ref={bottomRef} className="h-1 w-full"></div>
        </div>
      </div>
    </div>
  );
  const target = typeof document !== 'undefined' ? document.body : null;
  if (!target) return null;
  return createPortal(markup, target);
}
