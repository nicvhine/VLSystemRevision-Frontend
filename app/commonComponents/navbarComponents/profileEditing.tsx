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
        className={`bg-gray-50 border border-gray-300 text-sm rounded-lg p-3 ${showToggle ? 'pr-12' : 'pr-3'} focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition placeholder:text-gray-400 hover:border-gray-400 w-full`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 text-xs z-10 cursor-pointer font-medium"
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
  editingUsername,
  setEditingUsername,
  usernameError,
  setUsernameError,
  isEditing,
  setIsEditing,
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
  showSuccessModal,
  setShowSuccessModal,
  showErrorModal,
  setShowErrorModal,
  showConfirm,
  setShowConfirm,
}: ProfileEditingProps) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpAnimateIn, setOtpAnimateIn] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'sms' | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const router = useRouter();
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentPhone, setCurrentPhone] = useState('');

  // Get current values from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUsername(localStorage.getItem('username') || username);
      setCurrentEmail(localStorage.getItem('email') || email);
      setCurrentPhone(localStorage.getItem('phoneNumber') || phoneNumber);
    }
  }, [username, email, phoneNumber]);

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
      setLoading(true);
      const ok = await verifyEmailCode();
      
      if (!ok) {
        // Verification failed - show error modal
        setModalMsg(emailError || 'Incorrect verification code. Please try again.');
        setShowErrorModal(true);
        return;
      }

      // Verification successful - continue with other updates
      setShowOtpModal(false);
      setEnteredEmailCode('');
      setEmailVerificationSent(false);
      setEditingEmail('');
      
      // Continue with other updates (username, phone, password)
      await handleAccountSettingsUpdate();
      
      setModalMsg('✓ All changes saved successfully!');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setIsEditing?.(false);
      }, 2000);
    } catch (error) {
      console.error('OTP verification error:', error);
      setModalMsg('An error occurred while verifying OTP.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySmsAndNotify = async () => {
    if (enteredSmsCode.length !== 6) {
      setPhoneError("Please enter the verification code."); 
      return;
    }
  
    try {
      setLoading(true);
      await verifySmsCode(); 
      
      setShowOtpModal(false);
      setEnteredSmsCode('');
      setSmsVerificationSent(false);
      setEditingPhone('');
      
      // Continue with other updates (username, email, password)
      await handleAccountSettingsUpdate();
      
      setModalMsg('✓ All changes saved successfully!');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setIsEditing?.(false);
      }, 2000);
    } catch (error) {
      console.error('SMS verification error:', error);
      setModalMsg(phoneError || 'Failed to verify the code.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }

  };
  
  const handleSaveWithConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    setModalMsg('');
    try {
      await handleAccountSettingsUpdate();
      setModalMsg('✓ All changes saved successfully!');
      setShowSuccessModal(true);
      setShowOtpModal(false);
      setOtpVisible(false);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      setModalMsg('Failed to save changes. Please try again.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="space-y-6">

        {/* USERNAME SECTION */}
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</span>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={editingUsername}
              onChange={(e) => {
                const value = e.target.value;
                setEditingUsername(value);
                setUsernameError('');
                
                // Check if it's the same as current username
                if (value && value.toLowerCase() === currentUsername.toLowerCase()) {
                  setUsernameError("Entered username is your current username.");
                  return;
                }
                
                // Username validation
                if (value && (value.length < 3 || value.length > 20)) {
                  setUsernameError('Username must be between 3 and 20 characters.');
                  return;
                }
                
                if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
                  setUsernameError('Username can only contain letters, numbers, underscores, and hyphens.');
                }
              }}
              placeholder={currentUsername || 'Enter new username'}
              disabled={!isEditing}
              className={`rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm placeholder:text-gray-400 ${
                isEditing
                  ? 'bg-gray-50 border border-gray-300 hover:border-gray-400'
                  : 'bg-gray-100 border border-gray-200 cursor-not-allowed'
              }`}
            />
            {usernameError && <p className="text-xs text-red-500 font-medium">⚠ {usernameError}</p>}
          </div>
        </div>

        {/* EMAIL SECTION */}
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</span>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="email"
              value={editingEmail}
              onChange={(e) => {
                const value = e.target.value;
                setEditingEmail(value);
                setEmailError('');
                if (
                  value &&
                  currentEmail &&
                  value.trim().toLowerCase() === currentEmail.trim().toLowerCase()
                ) {
                  setEmailError("Entered email is what you're currently using.");
                  return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                  setEmailError('Please enter a valid email address.');
                }
              }}
              placeholder={currentEmail || 'Enter email address'}
              disabled={!isEditing}
              className={`rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm placeholder:text-gray-400 ${
                isEditing
                  ? 'bg-gray-50 border border-gray-300 hover:border-gray-400'
                  : 'bg-gray-100 border border-gray-200 cursor-not-allowed'
              }`}
            />
            {emailError && <p className="text-xs text-red-500 font-medium">⚠ {emailError}</p>}
          </div>
        </div>

         {/* PHONE SECTION */}
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</span>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="tel"
              value={editingPhone}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !/^\d*$/.test(value)) return;
                setEditingPhone(value);
                if (
                  value &&
                  currentPhone &&
                  value.trim().toLowerCase() === currentPhone.trim().toLowerCase()
                ) {
                  setPhoneError("Entered phone number is what you're currently using.");
                  return;
                }
                if (phoneError) setPhoneError('');
                if (value && (!value.startsWith('09') || value.length !== 11)) {
                  setPhoneError('Phone number must start with 09 and be exactly 11 digits.');
                }
              }}
              placeholder={currentPhone}
              maxLength={11}
              disabled={!isEditing}
              className={`text-sm rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition placeholder:text-gray-400 ${
                isEditing
                  ? 'bg-gray-50 border border-gray-300 hover:border-gray-400'
                  : 'bg-gray-100 border border-gray-200 cursor-not-allowed'
              }`}
            />
            {phoneError && <p className="text-xs text-red-500 font-medium">⚠ {phoneError}</p>}
          </div>
        </div>
        
        {/* PASSWORD SECTION */}
        {isEditing && (
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</span>
            </div>
            <div className="min-h-[1.5rem] mb-2">
              {passwordError && <p className="text-xs text-red-500 font-medium flex items-center gap-1">⚠ {passwordError}</p>}
            </div>
            <div className="flex flex-col gap-3">
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
                  if (v && newPassword && v !== newPassword) {
                    setPasswordError('Passwords do not match.');
                  }
                }}
                language={language}
                showToggle={true}
              />
              {/* Save/Cancel Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  disabled={loading}
                  onClick={() => setShowConfirm(true)}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg px-8 py-3 hover:shadow-lg transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? '⟳ Saving…' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing?.(false);
                    setEditingUsername('');
                    setEditingEmail('');
                    setEditingPhone('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setUsernameError('');
                    setEmailError('');
                    setPhoneError('');
                    setPasswordError('');
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
          show={showConfirm}
          message={t.t33}
          onConfirm={() => { void handleSaveWithConfirm(); }}
          onCancel={() => setShowConfirm(false)}
        />

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
