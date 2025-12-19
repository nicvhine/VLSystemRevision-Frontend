'use client';

import { FormEvent, useState, useEffect } from 'react';
import { loginHandler } from './loginHandlers';
import ErrorModal from '@/app/commonComponents/modals/errorModal';
import { ButtonContentLoading } from '@/app/commonComponents/utils/loading';
import translationData from '@/app/commonComponents/translation';
import { AlertTriangle } from 'lucide-react';

interface Props {
  onClose: () => void;
  router: any;
  setShowForgotModal: React.Dispatch<React.SetStateAction<boolean>>;
  setForgotRole: React.Dispatch<React.SetStateAction<'borrower' | 'staff' | '' | null>>;
  setShowSMSModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOtpRole?: React.Dispatch<React.SetStateAction<'borrower' | 'staff'>>; 
  language?: 'en' | 'ceb';
}

export default function LoginFormWithSMS({
  onClose,
  router,
  setShowForgotModal,
  setForgotRole,
  setOtpRole,
  setShowSMSModal,
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
        router 
      });

      if (result === false) {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= 3) {
          const unlockTime = Date.now() + 30 * 1000; // replace with 5 * 60 * 1000 in prod
          localStorage.setItem('loginLockout', JSON.stringify({ unlockTime }));
          setIsLockedOut(true);
          setCooldownTime(30);
          setErrorMsg('Maximum login attempts reached. Locked for 30 seconds.');
          setShowErrorModal(true);
        } else {
          const remaining = 3 - newAttemptCount;
          setErrorMsg(`Invalid credentials. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
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
      <ErrorModal isOpen={showErrorModal} message={errorMsg} onClose={() => setShowErrorModal(false)} />
      
      <div>
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-center">{auth.welcomeBack}</h2>
          <p className="mb-4 text-center text-gray-600">{auth.loginSubtitle}</p>

          {attemptCount > 0 && !isLockedOut && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm font-medium">
                  Warning: {remainingAttempts} attempt{remainingAttempts > 1 ? 's' : ''}
                </p>
              </div>
              <p className="text-xs text-red-700 mt-1 text-center">
                Account locks after {remainingAttempts} more failed attempt{remainingAttempts > 1 ? 's' : ''}.
              </p>
            </div>
          )}

          {isLockedOut && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm font-medium">Account Temporarily Locked</p>
              </div>
              <p className="text-xs text-red-700 mt-1 text-center">
                Wait {formatCooldownTime(cooldownTime)} before trying again.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder={auth.username}
              className="w-full px-4 py-2.5 mb-3 border border-gray-200 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLockedOut}
            />
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={auth.password}
                className="w-full px-4 py-2.5 pr-16 border border-gray-200 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLockedOut}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 text-xs disabled:opacity-50"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLockedOut}
              >
                {showPassword ? auth.hide : auth.show}
              </button>
            </div>

            <p
              className="text-sm text-blue-600 hover:underline cursor-pointer text-center mb-3"
              onClick={() => {
                setShowForgotModal(true);
                setForgotRole('');
              }}
            >
              {auth.forgotPrompt}
            </p>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoggingIn || isLockedOut}
                className="w-36 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? <ButtonContentLoading label={auth.loggingIn} /> : isLockedOut ? 'Locked' : auth.login}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
