'use client';

import ConfirmModal from '@/app/commonComponents/modals/confirmModal';
import { useState } from 'react';
import translations from '@/app/commonComponents/translation';

type Props = {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (val: string) => void;
  setConfirmPassword: (val: string) => void;
  error: string;
  showResetConfirm: boolean;
  setShowResetConfirm: (show: boolean) => void;
  doResetPassword: () => void;
  resetLoading: boolean;
};

export default function StepReset({
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  error,
  showResetConfirm,
  setShowResetConfirm,
  doResetPassword,
  resetLoading,
}: Props) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ceb'>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("language") as 'en' | 'ceb') || 'en';
    }
    return 'en';
  });
  const auth = translations.authTranslation[language];

  return (
    <>
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Reset Password</h2>
      <div className="relative mb-3">
        <input
          type={showNewPassword ? 'text' : 'password'}
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2 pr-10"
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 text-xs"
          onClick={() => setShowNewPassword(!showNewPassword)}
        >
          {showNewPassword ? auth.hide : auth.show}
        </button>
      </div>
      <div className="relative mb-4">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2 pr-10"
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 text-xs"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? auth.hide : auth.show}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <button
        disabled={!newPassword || !confirmPassword}
        onClick={() => setShowResetConfirm(true)}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
      >
        Reset Password
      </button>

      <ConfirmModal
        show={showResetConfirm}
        message="Are you sure you want to reset your password?"
        onConfirm={doResetPassword}
        onCancel={() => setShowResetConfirm(false)}
        loading={resetLoading}
      />
    </>
  );
}
