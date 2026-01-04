'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import translations from '../translation';
import { ProfileEditingProps } from '../utils/Types/profileEditing';
import OTPModal from './otpModal';
import SuccessModal from '@/app/commonComponents/modals/successModal';
import ErrorModal from '@/app/commonComponents/modals/errorModal';
import SubmitOverlayToast from '@/app/commonComponents/utils/submitOverlayToast';
import ConfirmModal from '../modals/confirmModal';

function PasswordInput({
  label,
  value,
  onChange,
  language = 'en',
  showToggle = true
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  language?: 'en' | 'ceb';
  showToggle?: boolean;
}) {
  const [show, setShow] = useState(false);
  const auth = translations.authTranslation[language];
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        autoComplete="new-password"
        data-lpignore="true"
        data-1p-ignore="true"
        className={`bg-white border text-sm border-gray-300 rounded-md p-2.5 ${showToggle ? 'pr-16' : 'pr-2.5'} focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition w-full`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 text-xs z-10 cursor-pointer"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? auth.hide : auth.show}
        </button>
      )}
    </div>
  );
}

export default function ProfileSettingsPanel({
  username,
  email,
  phoneNumber,
  editingEmail,
  setEditingEmail,
  editingPhone,
  setEditingPhone,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  setPasswordError,
  emailError,
  setEmailError,
  phoneError,
  setPhoneError,
  setSettingsSuccess,
  handleAccountSettingsUpdate,
  emailVerificationSent,
  setEmailVerificationSent,
  smsVerificationSent,
  setSmsVerificationSent,
  enteredEmailCode,
  setEnteredEmailCode,
  enteredSmsCode,
  setEnteredSmsCode,
  sendEmailCode,
  verifyEmailCode,
  sendSmsCode,
  verifySmsCode,
  emailVerified,
  setIsEditingPasswordField,
}: ProfileEditingProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpAnimateIn, setOtpAnimateIn] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const router = useRouter();
  const [sendingCode, setSendingCode] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'sms' | null>(null);

  // Initialize language
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);
      const keyMap: Record<string, string> = {
        head: "headLanguage",
        "loan officer": "loanOfficerLanguage",
        manager: "managerLanguage",
        borrower: "language",
        sysad: "language",
      };
      const langKey = keyMap[storedRole || ""] as keyof typeof keyMap || "language";
      const storedLanguage = (localStorage.getItem(langKey) as "en" | "ceb") || (localStorage.getItem('language') as "en" | "ceb") || "en";
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const validRoles = ["borrower", "head", "loan officer", "manager", "sysad"];
      if (validRoles.includes(role || "") && event.detail.language) {
        setLanguage(event.detail.language as "en" | "ceb");
      }
    };
    const onStorage = () => {
      const l = localStorage.getItem('language');
      if (l === 'en' || l === 'ceb') setLanguage(l);
    };
    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener("languageChange", handleLanguageChange as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, [role]);

  // OTP modal handling
  useEffect(() => {
    if ((emailVerificationSent && !emailVerified) || smsVerificationSent) {
      setShowOtpModal(true);
    }
  }, [emailVerificationSent, emailVerified, smsVerificationSent]);

  useEffect(() => {
    if (showOtpModal) {
      setOtpVisible(true);
      const t = setTimeout(() => setOtpAnimateIn(true), 10);
      return () => clearTimeout(t);
    }
    if (otpVisible && !showOtpModal) {
      setOtpAnimateIn(false);
      const t = setTimeout(() => setOtpVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [showOtpModal]);

  const t = translations.navbarTranslation[language];

  const handleVerifyOtpAndNotify = async () => {
    if (enteredEmailCode.length !== 6) {
      setEmailError("Please enter the verification code."); 
      return;
    }
    try {
      const ok = await verifyEmailCode();
      if (ok) {
        setShowOtpModal(false);
        setModalMsg('Email verified and updated successfully.');
        setShowSuccessModal(true);
        setEnteredEmailCode('');
        setEmailVerificationSent(false);
        // Clear the input field so it shows the new email as placeholder
        setEditingEmail('');
      } else {
        setModalMsg(emailError || 'Failed to verify the code.');
        setShowErrorModal(true);
      }
    } catch {
      setModalMsg('An error occurred while verifying OTP.');
      setShowErrorModal(true);
    }
  };

  const handleVerifySmsAndNotify = async () => {
    if (enteredSmsCode.length !== 6) {
      setPhoneError("Please enter the verification code."); 
      return;
    }
  
    try {
      await verifySmsCode(); 
      setShowOtpModal(false);
      setModalMsg('Phone number verified and updated successfully.');
      setShowSuccessModal(true);
      setEnteredSmsCode('');
      setSmsVerificationSent(false);
      setEditingPhone('');
    } catch {
      setModalMsg(phoneError || 'Failed to verify the code.');
      setShowErrorModal(true);
    }
  };
  
  const handleSaveWithConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    await handleAccountSettingsUpdate();
    setLoading(false);
    // Show success modal and auto-close after 5 seconds
    setModalMsg('Password updated successfully!');
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 5000);
  };


  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">

        {/* USERNAME */}
        <div className="pb-2 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">Username</p>
          <p className="text-gray-900 text-sm">{username}</p>
        </div>

        {/* EMAIL */}
        <div className="pb-2 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
          <div className="min-h-[0.75rem]">
            {emailError && <p className="text-xs text-red-500 mb-1">{emailError}</p>}
          </div>
          <div className="flex flex-col">
          <input
            type="email"
            value={editingEmail}
            onChange={(e) => {
              const value = e.target.value;
              setEditingEmail(value);

              // Clear previous error
              setEmailError('');

              // Same email as current
              if (
                value &&
                email &&
                value.trim().toLowerCase() === email.trim().toLowerCase()
              ) {
                setEmailError("Entered email is what you're currently using.");
                return;
              }

              // Validate email format
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (value && !emailRegex.test(value)) {
                setEmailError('Please enter a valid email address.');
              }
            }}
            placeholder={email || 'Enter email address'}
            className="bg-white border border-gray-300 rounded-md p-2.5 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition text-sm placeholder:text-gray-500"
          />
            <div className="min-h-[1rem]">
              {editingEmail.trim() !== '' && editingEmail.toLowerCase() !== email.toLowerCase() && !emailError && (
                <button
                  disabled={sendingCode}
                  onClick={async () => {
                    setOtpType('email');
                    setEmailError('');
                    setSendingCode(true);
                    try { await sendEmailCode(); } finally { setSendingCode(false); }
                  }}
                  className={`text-red-600 text-xs font-medium hover:text-red-700 transition disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {sendingCode ? 'Sending…' : 'Send Verification Code'}
                </button>
              )}
            </div>
          </div>
        </div>

         {/* PHONE */}
        <div className="pb-2 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
          <div className="min-h-[0.75rem]">
            {phoneError && <p className="text-xs text-red-500 mb-1">{phoneError}</p>}
          </div>
          <div className="flex flex-col">
            <input
              type="tel"
              value={editingPhone}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow numbers
                if (value && !/^\d*$/.test(value)) return;
                setEditingPhone(value);

                 // Same number as current
                  if (
                    value &&
                    phoneNumber &&
                    value.trim().toLowerCase() === phoneNumber.trim().toLowerCase()
                  ) {
                    setPhoneError("Entered phone number is what you're currently using.");
                    return;
                  }

                // Clear error when user starts typing
                if (phoneError) setPhoneError('');
                // Validate phone format
                if (value && (!value.startsWith('09') || value.length !== 11)) {
                  setPhoneError('Phone number must start with 09 and be exactly 11 digits.');
                }
              }}
              placeholder={phoneNumber}
              maxLength={11}
              className="bg-white border border-gray-300 text-sm rounded-md p-2.5 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition placeholder:text-gray-500"
            />
            <div className="min-h-[1rem]">
              {editingPhone.trim() !== '' && editingPhone !== phoneNumber && !phoneError && (
                <button
                  disabled={sendingCode}
                  onClick={async () => {
                    setOtpType('sms');
                    setPhoneError('');
                    setSendingCode(true);
                    try { await sendSmsCode(); } finally { setSendingCode(false); }
                  }}
                  className={`text-red-600 text-xs font-medium hover:text-red-700 transition disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {sendingCode ? 'Sending…' : 'Send Verification Code'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* PASSWORD */}
        <div className="pb-2">
  <p className="text-xs font-medium text-gray-500 mb-1">Password</p>
  <div className="min-h-[0.75rem]">
    {passwordError && <p className="text-xs text-red-500 mb-1">{passwordError}</p>}
  </div>
  <div className="flex flex-col gap-2">
    <PasswordInput
    label="Current Password"
    value={currentPassword}
    onChange={(v) => {
      setCurrentPassword(v);
      setIsEditingPasswordField(true);
      if (passwordError) setPasswordError('');
    }}
    language={language}
    showToggle={true}
  />
    <PasswordInput
    label="New Password"
    value={newPassword}
    onChange={(v) => {
      setNewPassword(v);
      setIsEditingPasswordField(true);
      if (passwordError) setPasswordError('');
      
      if (v) {
        // Check if new password is same as current password
        if (v === currentPassword) {
          setPasswordError('New password must be different from current password.');
          return;
        }
        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(v)) {
          setPasswordError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
        }
      }
    }}
    language={language}
    showToggle={true}
  />
  <PasswordInput
    label="Confirm Password"
    value={confirmPassword}
    onChange={(v) => {
      setConfirmPassword(v);
      setIsEditingPasswordField(true);
      if (passwordError) setPasswordError('');
      // Check if passwords match
      if (v && newPassword && v !== newPassword) {
        setPasswordError('Passwords do not match.');
      }
    }}
    language={language}
    showToggle={true}
  />
          {/* Always render button, disable if not all fields filled */}
          <div className="flex justify-end mt-1.5">
          <button
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            onClick={() => setShowConfirm(true)}
            className="bg-red-600 text-white text-xs font-medium rounded-md px-6 py-2.5 hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
          </div>
        </div>
      </div>

      <ConfirmModal
          show={showConfirm}
          message={t.t33}
          onConfirm={() => { void handleSaveWithConfirm(); }}
          onCancel={() => setShowConfirm(false)}
        />
      </div>

      {/* OTP Modal */}
      {otpVisible &&
        typeof window !== 'undefined' &&
        createPortal(
          <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-300 ${otpAnimateIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 relative transform transition-all duration-300 ease-out ${otpAnimateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}>
              <button
                onClick={() => setShowOtpModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
              <OTPModal
                otp={otpType === 'email' ? enteredEmailCode : enteredSmsCode}
                setOtp={(code) => {
                  if (otpType === 'email') setEnteredEmailCode(code);
                  else setEnteredSmsCode(code);
                  if (otpType === 'email') setEmailError('');
                  else setPhoneError('');
                }}
                error={otpType === 'email' ? emailError : phoneError}
                handleVerifyOtp={otpType === 'email' ? handleVerifyOtpAndNotify : handleVerifySmsAndNotify}
                handleResendOtp={otpType === 'email' ? async () => await sendEmailCode() : async () => await sendSmsCode()}
                otpType={otpType || 'email'}
              />
            </div>
          </div>,
          document.body
        )}

      {/* Loading Toast */}
      {typeof window !== 'undefined' && createPortal(
        <SubmitOverlayToast open={sendingCode} message="Sending verification code..." variant="info" />,
        document.body
      )}

      {/* Success / Error Modals */}
      {showSuccessModal && <SuccessModal isOpen={showSuccessModal} message={modalMsg} onClose={() => setShowSuccessModal(false)} />}
      {showErrorModal && <ErrorModal isOpen={showErrorModal} message={modalMsg} onClose={() => setShowErrorModal(false)} />}
    </>
  );
}
