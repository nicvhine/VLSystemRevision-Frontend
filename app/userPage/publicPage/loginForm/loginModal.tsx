'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './loginForm';
import RegisterForm from './registerForm'; // 👈 add this
import ForgotPasswordModal from './forgotPassword/forgotPasswordModal';
import OTPModal from './loginOtpModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'ceb';
}

export default function LoginModal({ isOpen, onClose, language = 'en' }: LoginModalProps) {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false); // 👈 NEW
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
        setShowRegisterModal(false);
        setForgotRole('');
        setShowSMSModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  return (
    <>
      {!showSMSModal && (
        <div className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative text-black transform transition-all duration-300 ease-out ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left panel - branding / illustration */}
              <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700 text-white p-8">
                <div className="max-w-xs text-center">
                  <h3 className="text-2xl font-bold">Welcome to VLSystem</h3>
                  <p className="mt-2 text-sm opacity-90">Secure access to your account — fast and protected.</p>
                </div>
              </div>

              {/* Right panel - content */}
              <div className="p-6 md:p-8 bg-white relative max-h-[80vh] overflow-y-auto">
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                >
                  ✖
                </button>

                {/* FORGOT PASSWORD */}
                {showForgotModal ? (
                  <ForgotPasswordModal
                    forgotRole={forgotRole}
                    setForgotRole={(role: string | null) =>
                      setForgotRole(role === 'borrower' || role === 'staff' || role === '' ? role : '')
                    }
                    setShowForgotModal={setShowForgotModal}
                  />
                ) : showRegisterModal ? (
                  /* REGISTER */
                  <RegisterForm
                    onClose={onClose}
                    router={router}
                    switchToLogin={() => setShowRegisterModal(false)}
                    language={language}
                  />
                ) : (
                  /* LOGIN */
                  <LoginForm
                    onClose={onClose}
                    router={router}
                    setShowForgotModal={setShowForgotModal}
                    setForgotRole={setForgotRole}
                    setShowSMSModal={setShowSMSModal}
                    setOtpRole={setOtpRole}
                    setShowRegisterModal={setShowRegisterModal}
                    language={language}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP */}
      <OTPModal
        isVisible={showSMSModal}
        onClose={() => {
          setShowSMSModal(false);
          onClose();
        }}
        router={router}
        otpRole={otpRole}
      />
    </>
  );
}
