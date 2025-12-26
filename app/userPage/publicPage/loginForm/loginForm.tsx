'use client';

import { FormEvent, useState, useEffect } from 'react';
import { loginHandler } from './loginHandlers';
import ErrorModal from '@/app/commonComponents/modals/errorModal';
import { ButtonContentLoading } from '@/app/commonComponents/utils/loading';
import translationData from '@/app/commonComponents/translation';
import { AlertTriangle, Eye, EyeOff, Lock, User } from 'lucide-react';

interface Props {
  onClose: () => void;
  router: any;
  setShowForgotModal: React.Dispatch<React.SetStateAction<boolean>>;
  setForgotRole: React.Dispatch<React.SetStateAction<'borrower' | 'staff' | '' | null>>;
  setShowSMSModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOtpRole?: React.Dispatch<React.SetStateAction<'borrower' | 'staff'>>;
  setShowRegisterModal: React.Dispatch<React.SetStateAction<boolean>>;
  language?: 'en' | 'ceb';
}

export default function LoginFormWithSMS({
  onClose,
  router,
  setShowForgotModal,
  setForgotRole,
  setOtpRole,
  setShowSMSModal,
  setShowRegisterModal,
  language = 'en',
}: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [attemptCount, setAttemptCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  const auth = translationData.authTranslation[language];
  const e = translationData.errorTranslation[language];

  useEffect(() => {
    const savedLockout = localStorage.getItem('loginLockout');
    if (savedLockout) {
      const lockoutData = JSON.parse(savedLockout);
      const remainingTime = Math.floor((lockoutData.unlockTime - Date.now()) / 1000);
      if (remainingTime > 0) {
        setIsLockedOut(true);
        setCooldownTime(remainingTime);
        setAttemptCount(3);
      } else {
        localStorage.removeItem('loginLockout');
      }
    }
  }, []);

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setAttemptCount(0);
            localStorage.removeItem('loginLockout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  const formatCooldownTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isLockedOut) {
      setErrorMsg(`Too many failed attempts. Wait ${formatCooldownTime(cooldownTime)} before retry.`);
      setShowErrorModal(true);
      return;
    }

    if (!username || !password) {
      setErrorMsg(e.usernamePasswordRequired);
      setShowErrorModal(true);
      return;
    }

    if (isLoggingIn) return;

    setIsLoggingIn(true);

    try {
      const result = await loginHandler({
        username,
        password,
        onClose,
        setErrorMsg,
        setShowErrorModal,
        setShowSMSModal,
        setOtpRole,
        router,
      });

      if (result === false) {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= 3) {
          const unlockTime = Date.now() + 30 * 1000;
          localStorage.setItem('loginLockout', JSON.stringify({ unlockTime }));
          setIsLockedOut(true);
          setCooldownTime(30);
          setErrorMsg('Maximum login attempts reached. Locked for 30 seconds.');
          setShowErrorModal(true);
        } else {
          const remaining = 3 - newAttemptCount;
          setErrorMsg(
            `Invalid credentials. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
          );
          setShowErrorModal(true);
        }
      } else {
        setAttemptCount(0);
        localStorage.removeItem('loginLockout');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const remainingAttempts = 3 - attemptCount;

  return (
    <>
      <ErrorModal
        isOpen={showErrorModal}
        message={errorMsg}
        onClose={() => setShowErrorModal(false)}
      />

      <div className="py-2">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{auth.welcomeBack}</h2>
          <p className="text-base text-gray-600">{auth.loginSubtitle}</p>
        </div>

        {/* Warning Banners */}
        {attemptCount > 0 && !isLockedOut && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  Security Warning
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {remainingAttempts} attempt{remainingAttempts > 1 ? 's' : ''} remaining before account lockout
                </p>
              </div>
            </div>
          </div>
        )}

        {isLockedOut && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-600 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Lock className="w-5 h-5 text-red-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Account Temporarily Locked</p>
                <p className="text-xs text-red-800 mt-1">
                  Please wait {formatCooldownTime(cooldownTime)} before trying again
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {auth.username}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLockedOut}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {auth.password}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full pl-12 pr-14 py-3.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLockedOut}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLockedOut}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
              onClick={() => {
                setShowForgotModal(true);
                setForgotRole('');
              }}
            >
              {auth.forgotPrompt}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoggingIn || isLockedOut}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-base font-semibold rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            {isLoggingIn ? (
              <ButtonContentLoading label={auth.loggingIn} />
            ) : isLockedOut ? (
              'Account Locked'
            ) : (
              auth.login
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">or</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-base text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors"
              >
                Create Account
              </button>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}