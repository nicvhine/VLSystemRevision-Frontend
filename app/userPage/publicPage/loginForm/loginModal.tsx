'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './loginForm';
import ForgotPasswordModal from './forgotPassword/forgotPasswordModal';
import OTPModal from './loginOtpModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'ceb';
}

export default function LoginModal({ isOpen, onClose, language = 'en' }: LoginModalProps) {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotRole, setForgotRole] = useState<'borrower' | 'staff' | '' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [otpRole, setOtpRole] = useState<'borrower' | 'staff'>('borrower');
  
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShowModal(false);
        setShowForgotModal(false);
        setForgotRole('');
        setShowSMSModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  return (
    <>
      {/* Login/Forgot Password Modal */}
      {!showSMSModal && (
        <div className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative text-black transform transition-all duration-300 ease-out ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            <button
              onClick={() => {
                onClose();
                setShowForgotModal(false);
                setForgotRole('');
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
            >
              ✖
            </button>

            {showForgotModal ? (
              <ForgotPasswordModal
                forgotRole={forgotRole}
                setForgotRole={(role: string | null) =>
                  setForgotRole(role === "borrower" || role === "staff" || role === "" ? role : "")
                }
                setShowForgotModal={setShowForgotModal}
              /> 
            ) : (
              <LoginForm
                onClose={onClose}
                router={router}
                setShowForgotModal={setShowForgotModal}
                setForgotRole={setForgotRole}
                setShowSMSModal={setShowSMSModal}
                setOtpRole={setOtpRole}
                language={language}
              />
            )}
          </div>
        </div>
      )}

      {/* OTP Modal */}
      <OTPModal 
        isVisible={showSMSModal} 
        onClose={() => { setShowSMSModal(false); onClose(); }} 
        router={router} 
        otpRole={otpRole} 
      />
    </>
  );
}
