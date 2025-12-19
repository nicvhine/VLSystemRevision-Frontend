'use client';

import { useEffect, useState } from 'react';

type Props = {
  countdownSeconds: number;
  onStay: () => void;
  onLogout: () => void;
};

export default function AreYouStillThereModal({ countdownSeconds, onStay, onLogout }: Props) {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    setCountdown(countdownSeconds);
    setPercentage(100);

    let remaining = countdownSeconds;

    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      setPercentage((remaining / countdownSeconds) * 100);

      if (remaining <= 0) {
        clearInterval(interval);
        onLogout(); // trigger logout when countdown ends
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownSeconds, onLogout]);

  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl p-6 flex flex-col items-center animate-scaleIn">
        <h3 className="text-m font-bold text-gray-900 mb-3 text-center">Are you still there?</h3>

        <div className="relative w-24 h-24 mb-4">
          <svg className="rotate-[-90deg]" width="100%" height="100%" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#ef4444"
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-red-600">
            {countdown}
          </span>
        </div>

        <p className="text-gray-600 text-center mb-6 px-4 text-sm">
          You will be logged out automatically if no action is taken.
        </p>

        <div className="flex justify-center gap-4 w-full">
          <button
            className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
            onClick={onLogout}
          >
            Logout Now
          </button>
          <button
            className="flex-1 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
            onClick={onStay}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
