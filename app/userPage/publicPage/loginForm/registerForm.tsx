'use client';

import { FormEvent, useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
  switchToLogin: () => void;
  language?: 'en' | 'ceb';
}

// Mock modals for demo
const ErrorModal = ({ isOpen, message, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-red-600 text-5xl mb-3 text-center">⚠️</div>
        <h3 className="text-lg font-semibold mb-2 text-center">Error</h3>
        <p className="text-gray-600 text-center mb-4">{message}</p>
        <button onClick={onClose} className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          Close
        </button>
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, message, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-green-600 text-5xl mb-3 text-center">✓</div>
        <h3 className="text-lg font-semibold mb-2 text-center">Success!</h3>
        <p className="text-gray-600 text-center mb-4">{message}</p>
        <button onClick={onClose} className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Continue
        </button>
      </div>
    </div>
  );
};

const ButtonContentLoading = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center gap-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    <span>{label}</span>
  </div>
);

export default function RegisterForm({ onClose, switchToLogin, language = 'en' }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [username, setUsername] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (name || email) {
      const cleanName = name.replace(/\s+/g, '').toLowerCase();
      const emailName = email.split('@')[0].toLowerCase();
      setUsernameSuggestions([
        `${cleanName}${Math.floor(Math.random() * 1000)}`,
        `${emailName}${Math.floor(Math.random() * 1000)}`,
        `${cleanName}.${Math.floor(Math.random() * 1000)}`,
      ]);
    }
  }, [name, email]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || !email || !contactNumber) {
        setErrorMsg('Please fill all fields.');
        setShowErrorModal(true);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!username) {
        setErrorMsg('Please choose a username.');
        setShowErrorModal(true);
        return;
      }
      setStep(3);
    }
  };

  const handleSendOTP = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setOtpSent(true);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setOtpVerified(true);
      setStep(4);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setShowSuccessModal(true);
      setIsSubmitting(false);
    }, 1500);
  };

  const stepTitles = ['Personal Details', 'Choose Username', 'Verify Account', 'Complete'];

  return (
    <>
      <ErrorModal isOpen={showErrorModal} message={errorMsg} onClose={() => setShowErrorModal(false)} />
      <SuccessModal
        isOpen={showSuccessModal}
        message="Registration successful! You may now log in."
        onClose={() => {
          setShowSuccessModal(false);
          switchToLogin();
        }}
      />

      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-xl font-bold">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-sm text-gray-500">Join us in just a few steps</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      step >= s
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {s}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium text-center ${step >= s ? 'text-red-600' : 'text-gray-400'}`}>
                    {stepTitles[s - 1]}
                  </span>
                </div>
                {s < 4 && (
                  <div className="flex-1 h-0.5 bg-gray-200 mx-1 rounded-full overflow-hidden -mt-4">
                    <div
                      className={`h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ${
                        step > s ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[220px]">
          {step === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="+63 912 345 6789"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Choose a Username</label>
                <p className="text-xs text-gray-500 mb-2">Pick from suggestions or create your own:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {usernameSuggestions.map((u) => (
                    <button
                      key={u}
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                        username === u
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                      onClick={() => setUsername(u)}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type your own username"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 animate-fadeIn">
              {!otpSent ? (
                <>
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">🔐</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Verify Your Account</p>
                    <p className="text-xs text-gray-500">Choose how to receive your code</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-all ${
                        verificationMethod === 'email'
                          ? 'border-red-500 bg-red-50 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setVerificationMethod('email')}
                    >
                      <div className="text-xl mb-1">📧</div>
                      <div className="text-xs font-medium">Email</div>
                    </button>
                    <button
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-all ${
                        verificationMethod === 'sms'
                          ? 'border-red-500 bg-red-50 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setVerificationMethod('sms')}
                    >
                      <div className="text-xl mb-1">📱</div>
                      <div className="text-xs font-medium">SMS</div>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="w-full py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-70 font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <ButtonContentLoading label="Sending..." /> : 'Send Code'}
                  </button>
                </>
              ) : !otpVerified ? (
                <>
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Code Sent!</p>
                    <p className="text-xs text-gray-500">Check your {verificationMethod === 'email' ? 'email' : 'SMS'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Enter Verification Code</label>
                    <input
                      type="text"
                      placeholder="000000"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-center text-lg tracking-widest font-bold"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    className="w-full py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-70 font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <ButtonContentLoading label="Verifying..." /> : 'Verify Code'}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-green-600 font-semibold text-sm">Verified Successfully!</p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4 animate-fadeIn">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Almost There!</h3>
              <p className="text-xs text-gray-600 mb-3">Click below to complete your registration</p>
              <button
                type="button"
                onClick={handleSubmitRegistration}
                className="px-6 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-70 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? <ButtonContentLoading label="Creating Account..." /> : 'Complete Registration'}
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {step < 3 && (
          <div className="flex justify-between gap-2 mt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNextStep}
              className={`px-6 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition font-medium ${step === 1 ? 'w-full' : ''}`}
            >
              Next Step
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center border-t pt-3">
          <p className="text-xs text-gray-600">
            Already have an account?{' '}
            <button onClick={switchToLogin} className="text-red-600 hover:text-red-700 font-semibold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}