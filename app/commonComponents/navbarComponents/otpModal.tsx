'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import SuccessModal from '@/app/commonComponents/modals/successModal';

type Props = {
  otp: string;
  setOtp: (val: string) => void;
  error: string;
  setError?: (val: string) => void; 
  handleVerifyOtp: () => Promise<void>; 
  handleResendOtp: () => Promise<void>;
  otpExpiresIn?: number;
  otpType?: 'email' | 'sms';
  showSuccessModal?: boolean;
  successMessage?: string;
  onCloseSuccessModal?: () => void;
};

export default function OTPModal({
  otp,
  setOtp,
  error,
  setError,
  handleVerifyOtp,
  handleResendOtp,
  otpExpiresIn = 300,
  otpType = 'email',
  showSuccessModal = false,
  successMessage = 'Verification successful!',
  onCloseSuccessModal,
}: Props) {
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [expiryTimer, setExpiryTimer] = useState(otpExpiresIn);

  // Countdown for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Countdown for OTP expiry
  useEffect(() => {
    if (expiryTimer <= 0) return;
    const interval = setInterval(() => setExpiryTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [expiryTimer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    const sanitized = value.replace(/\D/g, '');
    const otpArray = otp.padEnd(6, '').split(''); 
    otpArray[index] = sanitized.slice(-1);
    const newOtp = otpArray.join('');
    setOtp(newOtp);
  
    if (setError && error) setError('');
  
    if (sanitized && index < 5) inputRefs.current[index + 1]?.focus();
  };
  
  
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pasteData);
    pasteData.split('').forEach((char, i) => {
      if (inputRefs.current[i]) inputRefs.current[i].value = char;
    });
    if (setError && error) setError('');
  };

  const handleSubmit = async () => {
    if (otp.length !== 6) return;
    setIsVerifying(true);
    try {
      await handleVerifyOtp();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    try {
      await handleResendOtp();
      setResendTimer(60);
      setExpiryTimer(300); 
      setOtp('');
      inputRefs.current[0]?.focus();
      if (setError && error) setError('');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' + sec : sec}`;
  };

  return (
    <div className="flex flex-col items-center text-center p-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">OTP Verification</h2>
      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        Enter the 6-digit code sent to your {otpType === 'sms' ? 'phone number' : 'email'}. It will expire in{' '}
        <span className="font-semibold text-red-600">{formatTime(expiryTimer)}</span>.
      </p>

      <div className="flex justify-center gap-2.5 mb-5" onPaste={handlePaste}>
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i] || ''}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            ref={(el) => {
              if (el) inputRefs.current[i] = el;
            }}
            className={`w-9 h-11 md:w-10 md:h-12 rounded-lg border text-center text-xl font-semibold tracking-widest transition-all duration-150 shadow-sm 
              ${otp[i] ? 'border-red-500 text-gray-900' : 'border-gray-300 text-gray-800'}
              focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none`}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        disabled={otp.length !== 6 || isVerifying}
        onClick={handleSubmit}
        className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:scale-95 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
      >
        {isVerifying ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" />
            Verifying...
          </>
        ) : (
          'Verify'
        )}
      </button>

      <div className="mt-4 text-sm text-gray-600">
        {resendTimer > 0 ? (
          <p>
            Didn’t get the code?{' '}
            <span className="font-medium text-gray-800">Resend available in {resendTimer}s</span>
          </p>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Didn’t get the code?</span>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-red-600 font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              {isResending ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && onCloseSuccessModal && (
        <SuccessModal 
          isOpen={showSuccessModal} 
          message={successMessage} 
          onClose={onCloseSuccessModal} 
        />
      )}
    </div>
  );
}
