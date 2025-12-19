"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function TermsGateModal({
  language,
  onAccept,
  onCancel,
  onOpenTos,
  onOpenPrivacy,
  tosRead,
  privacyRead,
  enforceReading = true,
  acceptLabel,
  showCloseIcon = true,
  showCancelButton = true,
  showAgreementCheckbox = true,
}: {
  language: "en" | "ceb";
  onAccept: () => void;
  onCancel: () => void;
  onOpenTos: () => void;
  onOpenPrivacy: () => void;
  tosRead?: boolean;
  privacyRead?: boolean;
  enforceReading?: boolean;
  acceptLabel?: string;
  showCloseIcon?: boolean;
  showCancelButton?: boolean;
  showAgreementCheckbox?: boolean;
}) {
  const [animateIn, setAnimateIn] = useState(false);
  const [agree, setAgree] = useState(false);
  const [mounted, setMounted] = useState(false);
  // ensure this component only renders on the client and after mount
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Trigger animateIn one frame after mount so CSS transitions can run
  useEffect(() => {
    if (!mounted) return;
    let raf = requestAnimationFrame(() => setAnimateIn(true));
    return () => { cancelAnimationFrame(raf); setAnimateIn(false); };
  }, [mounted]);
  if (!mounted) return null;

  const handleCancel = () => {
    setAnimateIn(false);
    setTimeout(() => onCancel(), 300);
  };

  const handleAccept = () => {
    setAnimateIn(false);
    setTimeout(() => onAccept(), 300);
  };

  const markup = (
    // Backdrop sits above app UI but below any nested content modals (TOS/Privacy)
    <div
      style={{ zIndex: 1000 }}
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      <div
        style={{ zIndex: 1001 }}
        className={`bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 relative text-black transform transition-all duration-300 ease-out ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
        {showCloseIcon && (
          <button onClick={handleCancel} className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-700 transition text-2xl bg-white/80 rounded-full leading-none w-8 h-8 flex items-center justify-center" aria-label="Close">×</button>
        )}
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {language === 'en' ? 'Terms of Service and Privacy Policy' : 'Mga Termino sa Serbisyo ug Palisiya sa Privacy'}
        </h3>
  <div className="max-h-[60vh] overflow-y-auto border border-gray-200 rounded-md p-3 text-sm text-gray-700 space-y-3">
          <p>
            {language === 'en'
              ? 'Please review the Terms of Service and Privacy Policy before submitting your application. By continuing, you acknowledge and agree to the processing of your personal information for the purposes of evaluating and servicing your loan application.'
              : 'Palihug basaha ang Terms of Service ug Privacy Policy sa dili pa nimo isumite ang imong aplikasyon. Pinaagi sa pagpadayon, imong giila ug gisugot ang pagproseso sa imong personal nga impormasyon para sa pagtimbang-timbang ug pagserbisyo sa imong aplikasyon sa pahulam.'}
          </p>
          <p>
            {language === 'en'
              ? 'Key points: collection and use of personal data, document handling, credit checks, notifications, and your rights to access, correct, and delete your data in accordance with applicable laws.'
              : 'Mga yawe nga punto: pagkolekta ug paggamit sa personal nga datos, pagdumala sa dokumento, credit checks, mga pahibalo, ug imong mga katungod sa pag-access, pag-ayo, ug pagpananggal sa imong datos subay sa balaod.'}
          </p>
          <p className="text-xs text-gray-500">
            {language === 'en'
              ? 'Note: This is a brief summary. Click the links below to read the full Terms of Service and Privacy Policy.'
              : 'Nota: Kini mubo nga kabubuon. I-klik ang mga link sa ubos aron mabasa ang tibuok Terms of Service ug Privacy Policy.'}
          </p>
          <div className="space-x-4">
            <button type="button" onClick={onOpenTos} className="underline text-red-600 hover:text-red-700">
              {language === 'en' ? 'View Terms of Service' : 'Tan-awa ang Terms of Service'}
            </button>
            <button type="button" onClick={onOpenPrivacy} className="underline text-red-600 hover:text-red-700">
              {language === 'en' ? 'View Privacy Policy' : 'Tan-awa ang Privacy Policy'}
            </button>
          </div>
        </div>
        {showAgreementCheckbox && (
          <>
            <label className="mt-4 flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                disabled={enforceReading ? (!tosRead || !privacyRead) : false}
                title={enforceReading && (!tosRead || !privacyRead) ? (language === 'en' ? 'Open and scroll both documents first' : 'Abliha ug i-scroll ang duha ka dokumento una') : undefined}
                className={`mt-1 h-4 w-4 border-gray-300 rounded ${enforceReading && (!tosRead || !privacyRead) ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'}`}
              />
              <span>
                {language === 'en'
                  ? 'I have read and agree to the Terms of Service and Privacy Policy.'
                  : 'Nabasa ug nisugot ko sa Terms of Service ug Privacy Policy.'}
              </span>
            </label>
            <div className="mt-2 text-xs text-gray-500">
              {enforceReading && !tosRead && (
                <div>• {language === 'en' ? 'Please open and read the Terms of Service.' : 'Palihug abliha ug basaha ang Terms of Service.'}</div>
              )}
              {enforceReading && !privacyRead && (
                <div>• {language === 'en' ? 'Please open and read the Privacy Policy.' : 'Palihug abliha ug basaha ang Privacy Policy.'}</div>
              )}
            </div>
          </>
        )}
        <div className="mt-4 flex justify-end gap-3">
          {showCancelButton && (
            <button onClick={handleCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              {language === 'en' ? 'Cancel' : 'Kanselahon'}
            </button>
          )}
          <button
            onClick={handleAccept}
            disabled={showAgreementCheckbox ? (enforceReading ? (!agree || !tosRead || !privacyRead) : !agree) : false}
            className={`px-4 py-2 rounded-lg text-white ${
              showAgreementCheckbox
                ? (enforceReading ? (agree && tosRead && privacyRead ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed') : (agree ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'))
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {acceptLabel ?? (language === 'en' ? 'Accept and Submit' : 'Mouyon ug Isumite')}
          </button>
        </div>
      </div>
    </div>
  );

  const target = typeof document !== 'undefined' ? document.body : null;
  if (!target) return null;
  return createPortal(markup, target);
}
