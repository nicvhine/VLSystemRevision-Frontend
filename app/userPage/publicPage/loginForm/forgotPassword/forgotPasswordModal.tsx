'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import emailjs from 'emailjs-com';
import SuccessModal from '@/app/commonComponents/modals/successModal';

// Step components
import StepRole from './stepRole';
import StepAccount from './stepAccount';
import StepMethod from './stepMethod';
import StepOtp from './stepOtp';
import StepReset from './stepReset';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type Props = {
  forgotRole: string | null;
  setForgotRole: (role: string | null) => void;
  setShowForgotModal: (show: boolean) => void;
};

// Utility functions
const maskEmail = (email: string) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(0, name.length - 2))}@${domain}`;
};

const maskPhone = (phone: string) => {
  if (!phone) return '';
  return phone.replace(/(\d{2})\d{5}(\d{2})/, '$1*****$2');
};

// Send OTP via Email
const sendOtpViaEmail = async (toEmail: string, otp: string) => {
  try {
    const expiry = new Date(Date.now() + 5 * 60000).toLocaleTimeString();
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID!,
      { to_email: toEmail, passcode: otp, time: expiry },
      process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_PUBLIC_KEY!
      );
  } catch (error) {
    console.error('EmailJS error:', error);
  }
};

const sendOtpViaSMS = async (phoneNumber: string, otp: string) => {
  try {
    const response = await fetch(`${BASE_URL}/sms/sendOtp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, otp }),
  });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to send OTP SMS");
    
    console.log("OTP SMS sent:", data);
  } catch (error) {
    console.error("OTP SMS error:", error);
  }
};

export default function ForgotPasswordModal({ forgotRole, setForgotRole, setShowForgotModal }: Props) {
  const [step, setStep] = useState<'role' | 'account' | 'method' | 'otp' | 'reset' | 'staff'>('role');
  const [animateIn, setAnimateIn] = useState(false);
  const [pendingStep, setPendingStep] = useState<typeof step | null>(null);

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [borrower, setBorrower] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [borrowerId, setBorrowerId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'mobile'>('email');

  // Animate step changes
  useEffect(() => {
    if (pendingStep) {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setStep(pendingStep);
        setAnimateIn(true);
        setPendingStep(null);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pendingStep]);
  useEffect(() => setAnimateIn(true), []);

  // Search account
  const handleSearchAccount = async () => {
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/borrowers/find-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: usernameOrEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No account found with this email or username.');
        return;
      }
      setBorrower(data.borrower);
      setBorrowerId(data.borrower.id);
      setPendingStep('method');
    } catch {
      setError('Server error. Please try again.');
    }
  };

  const handleSendOtp = async (method: 'email' | 'mobile') => {
    setSelectedMethod(method);
    try {
      const res = await fetch(`${BASE_URL}/otp/generate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: borrower.email }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate OTP");
  
      const newOtp = data.otp;
      setGeneratedOtp(newOtp);
  
      if (method === "email") {
        await sendOtpViaEmail(borrower.email, newOtp);
      } else if (method === "mobile") {
        await sendOtpViaSMS(borrower.phoneNumber, newOtp);
      }
  
      setOtp("");
      setPendingStep("otp");
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Failed to send OTP. Please try again.");
    }
  };
  
  // Verify OTP
  const handleVerifyOtp = async () => {
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: borrower.email, otp }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
  
      setPendingStep('reset');
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.message || 'Invalid or expired OTP.');
    }
  };
  
  // Reset password
  const doResetPassword = async () => {
    setError('');
    setResetLoading(true);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setResetLoading(false);
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      setResetLoading(false);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/borrowers/reset-password/${borrowerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Password reset failed.');
        setResetLoading(false);
        return;
      }
      setSuccessMsg('Password reset successfully!');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setShowForgotModal(false);
      }, 3000);
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setResetLoading(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex justify-center items-center z-50 transition-opacity duration-300 ${
        animateIn ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={() => setShowForgotModal(false)} 
    >
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          message={successMsg}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
  
      <div
        className={`relative bg-white w-[400px] rounded-lg shadow-lg p-6 transform transition-all duration-300 ease-out ${
          animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close forgot password modal"
          onClick={() => setShowForgotModal(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'role' && <StepRole setPendingStep={setPendingStep} setShowForgotModal={setShowForgotModal} />}
        {step === 'account' && (
          <StepAccount
            usernameOrEmail={usernameOrEmail}
            setUsernameOrEmail={setUsernameOrEmail}
            error={error}
            handleSearchAccount={handleSearchAccount}
          />
        )}
        {step === 'method' && borrower && (
          <StepMethod
            borrower={borrower}
            maskEmail={maskEmail}
            maskPhone={maskPhone}
            handleSendOtp={handleSendOtp}
          />
        )}
        {step === 'otp' && (
          <StepOtp
            otp={otp}
            setOtp={setOtp}
            error={error}
            handleVerifyOtp={handleVerifyOtp}
            handleResendOtp={() => handleSendOtp(selectedMethod)}
          />
        )}
        {step === 'reset' && (
          <StepReset
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            error={error}
            setShowResetConfirm={setShowResetConfirm}
            showResetConfirm={showResetConfirm}
            doResetPassword={doResetPassword}
            resetLoading={resetLoading}
          />
        )}
      </div>
    </div>
  );
}
