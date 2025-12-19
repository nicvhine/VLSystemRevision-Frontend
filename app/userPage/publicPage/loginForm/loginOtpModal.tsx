'use client';

import { useState, useEffect, useRef } from "react";
import { Loader2 } from 'lucide-react';
import ErrorModal from '@/app/commonComponents/modals/errorModal';
import SuccessModal from '@/app/commonComponents/modals/successModal';

interface OTPModalProps {
  isVisible: boolean;
  onClose: () => void;
  router: any;
  otpRole: 'borrower' | 'staff'; 
  otpExpiresIn?: number;
}

export default function OTPModal({
  isVisible,
  onClose,
  router,
  otpRole,
  otpExpiresIn = 300,
}: OTPModalProps) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [expiryTimer, setExpiryTimer] = useState(otpExpiresIn);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const inputRefs = useRef<HTMLInputElement[]>([]);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setAnimateIn(true), 10);
      inputRefs.current[0]?.focus();

      // Debug: Check localStorage when modal opens
      if (otpRole === 'staff') {
        console.log("OTP Modal opened for staff");
        console.log("pendingUserId on modal open:", localStorage.getItem('pendingUserId'));
        console.log("All localStorage keys:", Object.keys(localStorage));
        console.log("All pending items:", {
          pendingUserId: localStorage.getItem("pendingUserId"),
          pendingEmail: localStorage.getItem("pendingEmail"),
          pendingRole: localStorage.getItem("pendingRole"),
          pendingToken: localStorage.getItem("pendingToken")
        });
      }

      if (!hasInitialized.current) {
        setExpiryTimer(otpExpiresIn); 
        setResendTimer(60);
        hasInitialized.current = true;
      }

      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      hasInitialized.current = false;
    }
  }, [isVisible, otpExpiresIn, otpRole]);

  useEffect(() => {
    if (!isVisible || resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer, isVisible]);

  useEffect(() => {
    if (!isVisible || expiryTimer <= 0) return;
    const interval = setInterval(() => setExpiryTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [expiryTimer, isVisible]);

  const handleChange = (value: string, index: number) => {
    const sanitized = value.replace(/\D/g, '');
    const otpArray = otp.padEnd(6, '').split('');
    otpArray[index] = sanitized.slice(-1);
    setOtp(otpArray.join(''));

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
  };

  const handleVerify = async () => {
    console.log("🔍 Verifying OTP for role:", otpRole);
    if (otp.length !== 6 || isVerifying) return;
    setIsVerifying(true);
  
    try {
      if (otpRole === 'borrower') {
        const borrowersId = localStorage.getItem("borrowersId");
        if (!borrowersId) throw new Error("Borrower ID not found.");
  
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/borrowers/verify-login-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ borrowersId, otp }),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            onClose();
            router.push('/userPage/borrowerPage/dashboard');
          }, 1500);
        } else {
          setErrorMsg(data.error || "Incorrect verification code");
          setShowErrorModal(true);
        }
      } else if (otpRole === 'staff') {
        // Get pending data from localStorage
        const userId = localStorage.getItem('pendingUserId');
        const token = localStorage.getItem('pendingToken');
        const fullName = localStorage.getItem('pendingFullName');
        const phoneNumber = localStorage.getItem('pendingPhoneNumber');
        const email = localStorage.getItem('pendingEmail');
        const username = localStorage.getItem('pendingUsername');
        const role = localStorage.getItem('pendingRole');
        const profilePic = localStorage.getItem('pendingProfilePic');
        const forcePasswordChange = localStorage.getItem('pendingForcePasswordChange');
        
        console.log("📦 Pending data retrieved:", {
          userId,
          email,
          role,
          hasToken: !!token,
          fullName,
          username
        });
        
        if (!userId) {
          console.error("❌ No pendingUserId found in localStorage");
          console.log("📋 All localStorage keys:", Object.keys(localStorage));
          setErrorMsg("Session expired. Please login again.");
          setShowErrorModal(true);
          setIsVerifying(false);
          return;
        }
  
        // Verify OTP with backend
        console.log("🔐 Verifying OTP with backend for userId:", userId);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/verify-login-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, otp }),
        });
  
        const data = await res.json();
        console.log("📨 Backend verification response:", data);
  
        if (res.ok) {
          console.log("✅ OTP verified successfully! Moving pending data to actual localStorage...");
          
          // Move ALL pending data to actual localStorage
          localStorage.setItem("token", token || "");
          localStorage.setItem("userId", userId);
          localStorage.setItem("fullName", fullName || "");
          localStorage.setItem("phoneNumber", phoneNumber || "");
          localStorage.setItem("email", email || "");
          localStorage.setItem("username", username || "");
          localStorage.setItem("role", role || "");
          
          if (profilePic) {
            localStorage.setItem("profilePic", profilePic);
          }
          
          if (forcePasswordChange) {
            localStorage.setItem("forcePasswordChange", "true");
          }
  
          // Log what was set
          console.log("✅ Data moved to localStorage:", {
            token: !!localStorage.getItem("token"),
            userId: localStorage.getItem("userId"),
            fullName: localStorage.getItem("fullName"),
            email: localStorage.getItem("email"),
            username: localStorage.getItem("username"),
            role: localStorage.getItem("role"),
            phoneNumber: localStorage.getItem("phoneNumber"),
            profilePic: localStorage.getItem("profilePic")
          });
  
          // Clear ALL pending data
          const pendingKeys = [
            "pendingToken", 
            "pendingFullName", 
            "pendingPhoneNumber", 
            "pendingEmail", 
            "pendingUsername", 
            "pendingRole", 
            "pendingProfilePic", 
            "pendingUserId", 
            "pendingForcePasswordChange"
          ];
          
          pendingKeys.forEach(key => localStorage.removeItem(key));
          console.log("🧹 Cleared all pending data");
  
          const finalRole = localStorage.getItem("role");
          console.log("🚀 Redirecting to dashboard for role:", finalRole);
          
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            onClose();
  
            const redirectMap: Record<string, string> = {
              head: '/userPage/headPage/dashboard',
              manager: '/userPage/managerPage/dashboard',
              'loan officer': '/userPage/loanOfficerPage/dashboard',
              collector: '/commonComponents/collection',
              sysad: '/userPage/sysadPage/dashboard',
            };
            
            const redirectPath = redirectMap[finalRole || ''] || '/';
            console.log("🎯 Redirecting to:", redirectPath);
            router.push(redirectPath);
          }, 1500);
        } else {
          console.error("❌ OTP verification failed:", data.error);
          setErrorMsg(data.error || "Incorrect verification code");
          setShowErrorModal(true);
        }
      }
    } catch (err) {
      console.error("💥 OTP verification error:", err);
      setErrorMsg("Error verifying OTP.");
      setShowErrorModal(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsResending(true);

    try {
      if (otpRole === 'staff') {
        const userId = localStorage.getItem('pendingUserId');
        const email = localStorage.getItem('pendingEmail');
        
        if (!userId || !email) {
          setErrorMsg("Session expired. Please login again.");
          setShowErrorModal(true);
          return;
        }

        // Backend generates new OTP
        const otpRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/generate-login-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const otpData = await otpRes.json();

        if (!otpRes.ok) {
          throw new Error("Failed to generate OTP");
        }

        // Send via EmailJS
        const emailjs = (await import('emailjs-com')).default;
        const templateParams = {
          to_email: email,
          passcode: otpData.otp,
          time: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString(),
        };

        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID!,
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_PUBLIC_KEY!
        );

        setOtp('');
        inputRefs.current[0]?.focus();
        setResendTimer(60);
        setExpiryTimer(otpExpiresIn);
      } else if (otpRole === 'borrower') {
        const borrowersId = localStorage.getItem("borrowersId");
        if (!borrowersId) throw new Error("Borrower ID not found.");

        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/borrowers/send-login-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ borrowersId }),
        });

        setOtp('');
        inputRefs.current[0]?.focus();
        setResendTimer(60);
        setExpiryTimer(otpExpiresIn);
      }
    } catch (err) {
      console.error("OTP resend error:", err);
      setErrorMsg("Error resending OTP.");
      setShowErrorModal(true);
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <>
      <div className={`fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[60] px-4 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`bg-white p-6 md:p-7 rounded-xl shadow-2xl w-full max-w-sm text-center relative transform transition-all duration-300 ease-out ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
          >
            ✖
          </button>
          
          <h2 className="text-2xl font-semibold mb-2">Enter OTP</h2>
          <p className="text-sm text-gray-600 mb-6">
            Enter the 6-digit code sent to your {otpRole === 'borrower' ? 'phone number' : 'email'}. Expires in{' '}
            <span className="font-semibold text-red-600">{formatTime(expiryTimer)}</span>.
          </p>

          <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[i] || ''}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => { if (el) inputRefs.current[i] = el; }}
                className={`w-9 h-11 md:w-10 md:h-12 rounded-lg border text-center text-xl font-semibold tracking-widest
                  ${otp[i] ? 'border-red-500 text-gray-900' : 'border-gray-300 text-gray-800'}
                  focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none transition-all duration-200`}
              />
            ))}
          </div>

          <div className="flex justify-center mb-4">
            <button
              onClick={handleVerify}
              disabled={otp.length !== 6 || isVerifying}
              className="w-36 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? <><Loader2 className="animate-spin w-5 h-5" /> Verifying...</> : 'Verify'}
            </button>
          </div>

          <div className="flex justify-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-600">
                Didn't get the code? <span className="font-medium text-gray-800">Resend in {resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-red-600 font-medium hover:underline disabled:opacity-50 flex items-center justify-center gap-1 transition-all duration-150"
              >
                {isResending ? <><Loader2 className="animate-spin w-4 h-4" /> Sending...</> : 'Resend Code'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        message="Login successful! Redirecting..." 
        onClose={() => setShowSuccessModal(false)} 
      />

      {/* Error Modal */}
      <ErrorModal 
        isOpen={showErrorModal} 
        message={errorMsg} 
        onClose={() => setShowErrorModal(false)} 
      />
    </>
  );
}