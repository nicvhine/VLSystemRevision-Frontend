"use client";

import React from "react";

interface CreditScoreCardProps {
  creditScore: number;
  showTip?: boolean;
}

const CreditScoreCard = ({ creditScore, showTip = true }: CreditScoreCardProps) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Score is 1–10 → convert to percent for circle (10 = 100%)
  const value = Math.min(Math.max(creditScore, 0), 10); 
  const percent = (value / 10) * 100;
  const offset = circumference * (1 - percent / 100);

  // Color logic (REVERSED)
  const getGradientId = () => {
    if (value <= 3) return "redGradient";    // LOW
    if (value <= 7) return "yellowGradient"; // MID
    return "greenGradient";                  // HIGH (8–10)
  };

  const getRating = () => {
    if (value <= 3) return "Poor";
    if (value <= 7) return "Fair";
    return "Excellent";
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">

      <h2 className="text-lg font-semibold text-red-700 mb-6">Credit Score</h2>

      <div className="relative w-44 h-44 md:w-52 md:h-52">
        <svg className="w-full h-full -rotate-90">
          <defs>
            <linearGradient id="redGradient" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
            <linearGradient id="yellowGradient" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="greenGradient" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#f3f4f6"
            strokeWidth="14"
            fill="none"
          />

          {/* Progress */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={`url(#${getGradientId()})`}
            strokeWidth="14"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-extrabold text-gray-800">
            {value}
          </span>
          <span className="text-xs text-gray-500 mt-1">{getRating()}</span>
        </div>
      </div>

      {showTip && (
        <div className="mt-3 text-sm text-gray-600 text-center">
          Score ranges from 1 (low) to 10 (high).
        </div>
      )}
    </div>
  );
};

export default CreditScoreCard;
