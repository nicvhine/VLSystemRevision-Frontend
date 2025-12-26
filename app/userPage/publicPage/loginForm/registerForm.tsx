'use client';

import { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import ErrorModal from '@/app/commonComponents/modals/errorModal';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_PUBLIC_KEY;

interface Props {
  onClose: () => void;
  switchToLogin: () => void;
  language?: 'en' | 'ceb';
}

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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [contactError, setContactError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [contactFormatError, setContactFormatError] = useState('');

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

  const checkIfExists = async ({
    email,
    contactNumber,
  }: {
    email?: string;
    contactNumber?: string;
  }) => {
    try {
      const res = await fetch(`${BASE_URL}/borrowers/check-existing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contactNumber }),
      });

      if (!res.ok) return null;

      return await res.json(); // { emailExists, contactExists }
    } catch (err) {
      console.error('Check account error:', err);
      return null;
    }
  };

  const checkUsernameExists = async (username: string) => {
    try {
      const res = await fetch(`${BASE_URL}/borrowers/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) return null;

      return await res.json(); // { usernameExists }
    } catch (err) {
      console.error('Check username error:', err);
      return null;
    }
  };

  const validateContactNumber = (number: string): boolean => {
    // Remove all non-digit characters for validation
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check if it's a valid Philippine mobile number
    // Should start with 09 and have 11 digits total
    const philippinePattern = /^09\d{9}$/;
    
    if (!philippinePattern.test(cleanNumber)) {
      setContactFormatError('Please enter a valid Philippine mobile number (e.g., 09123456789)');
      return false;
    }
    
    setContactFormatError('');
    return true;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      // Clear previous errors
      setEmailError('');
      setContactError('');
      setContactFormatError('');

      if (!name || !email || !contactNumber) {
        setErrorMsg('Please fill all fields.');
        setShowErrorModal(true);
        return;
      }

      // Validate contact number format
      if (!validateContactNumber(contactNumber)) {
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await checkIfExists({ email, contactNumber });

        let hasError = false;

        if (result?.emailExists) {
          setEmailError('This email is already registered.');
          hasError = true;
        }

        if (result?.contactExists) {
          setContactError('This contact number is already registered.');
          hasError = true;
        }

        if (hasError) {
          setIsSubmitting(false);
          return;
        }

        setStep(2);
      } catch (error) {
        setErrorMsg('Error checking account. Please try again.');
        setShowErrorModal(true);
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 2) {
      setUsernameError('');
      setPasswordError('');

      if (!username) {
        setErrorMsg('Please choose a username.');
        setShowErrorModal(true);
        return;
      }

      if (!password || !confirmPassword) {
        setErrorMsg('Please enter and confirm your password.');
        setShowErrorModal(true);
        return;
      }

      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await checkUsernameExists(username);

        if (result?.usernameExists) {
          setUsernameError('This username is already taken.');
          return;
        }

        setStep(3);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const sendEmailWithEmailJS = async (toEmail: string, passcode: string) => {
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString();

    return emailjs.send(
      EMAILJS_SERVICE_ID!,
      EMAILJS_TEMPLATE_ID!,
      {
        to_email: toEmail,
        passcode: passcode,
        time: expiryTime,
      },
      EMAILJS_PUBLIC_KEY!
    );
  };

  const handleSendOTP = async () => {
    setIsSubmitting(true);

    try {
      if (verificationMethod === 'sms') {
        const res = await fetch(`${BASE_URL}/borrowers/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactNumber,
            method: 'sms',
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to send SMS OTP');
      } else {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        await sendEmailWithEmailJS(email, newOtp);
      }

      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP sending failed');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    setIsSubmitting(true);
    try {
      if (verificationMethod === 'email') {
        if (otp === generatedOtp) {
          setOtpVerified(true);
          setStep(4);
        } else {
          setErrorMsg('Invalid verification code. Please try again.');
          setShowErrorModal(true);
        }
      } else {
        const res = await fetch(`${BASE_URL}/borrowers/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ borrowersId: contactNumber, otp }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg('Invalid SMS code. Please try again.');
          setShowErrorModal(true);
        } else {
          setOtpVerified(true);
          setStep(4);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        email,
        contactNumber,
        username,
        password,
        verificationMethod,
        otp: verificationMethod === 'email' ? generatedOtp : otp,
      };

      const res = await fetch(`${BASE_URL}/borrowers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || data?.error || 'Registration failed';
        setErrorMsg(msg);
        setShowErrorModal(true);
      } else {
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if Step 1 can proceed
  const canProceedStep1 = name.trim() !== '' && 
                          email.trim() !== '' && 
                          contactNumber.trim() !== '' && 
                          !emailError && 
                          !contactError && 
                          !contactFormatError;

  // Check if Step 2 can proceed
  const canProceedStep2 = username.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '' && !usernameError && !passwordError;

  const stepTitles = ['Personal Details', 'Username', 'Verify Account', 'Complete'];

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-base text-gray-600">Join us in just a few steps</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((s) => (
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className={`w-full px-4 py-3.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                />
                {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                <input
                  type="text"
                  placeholder="09123456789"
                  className={`w-full px-4 py-3.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm ${
                    contactError || contactFormatError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={contactNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow digits and limit to 11 characters
                    if (value === '' || /^\d{0,11}$/.test(value)) {
                      setContactNumber(value);
                      setContactError('');
                      setContactFormatError('');
                    }
                  }}
                  onBlur={() => {
                    if (contactNumber) {
                      validateContactNumber(contactNumber);
                    }
                  }}
                  maxLength={11}
                />
                {contactFormatError && <p className="text-xs text-red-600 mt-1">{contactFormatError}</p>}
                {contactError && <p className="text-xs text-red-600 mt-1">{contactError}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Choose a Username</label>
                <p className="text-sm text-gray-500 mb-2">Pick from suggestions or create your own:</p>
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
                      onClick={() => {
                        setUsername(u);
                        setUsernameError('');
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type your own username"
                  className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all mb-1 shadow-sm ${
                    usernameError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError('');
                  }}
                />
                {usernameError && <p className="text-xs text-red-600 mt-1 mb-2">{usernameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all mb-2 shadow-sm"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm`}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                />
                {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
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
                    <p className="text-sm text-gray-500">Choose how to receive your code</p>
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
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-base font-semibold rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
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
                      className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-center text-lg tracking-widest font-bold"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-base font-semibold rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-lg disabled:opacity-60"
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
                className="w-full px-6 py-3.5 text-base bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-lg disabled:opacity-60"
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
              className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting || (step === 1 ? !canProceedStep1 : !canProceedStep2)}
            className={`px-6 py-3.5 text-base bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-60 ${
              step === 1 ? 'w-full' : ''
            }`}
          >
            {isSubmitting ? <ButtonContentLoading label="Checking..." /> : 'Next Step'}
          </button>
        </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center border-t pt-3">
          <p className="text-base text-gray-600">
            Already have an account?{' '}
            <button onClick={switchToLogin} className="text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors">
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