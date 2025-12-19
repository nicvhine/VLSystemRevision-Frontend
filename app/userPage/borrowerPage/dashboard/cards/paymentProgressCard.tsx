'use client';

import React, { useState, useEffect } from 'react';
import { Collection } from '@/app/commonComponents/utils/Types/collection';
import { useReloan } from '../function';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface PaymentProgressCardProps {
  collections: Collection[];
  paymentProgress: number; // only for regular loans
  borrowerId: string;
}

export default function PaymentProgressCard({
  collections,
  paymentProgress,
  borrowerId,
}: PaymentProgressCardProps) {
  const { handleReloan } = useReloan();

  const [loanType, setLoanType] = useState<string | null>(null);
  const [principal, setPrincipal] = useState<number>(0);
  const [remainingBalance, setRemainingBalance] = useState<number>(0);

  // Regular loan stats
  const paidCount = collections.filter(c => c.status === 'Paid').length;
  const remainingCount = collections.filter(c => c.status !== 'Paid').length;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const fetchLoanType = async () => {
      if (!collections.length) return;

      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null;

      try {
        const loanId = collections[0].loanId;

        const res = await fetch(`${BASE_URL}/loans/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data?.currentLoan) {
          setLoanType(data.currentLoan.type);
          setPrincipal(Number(data.currentLoan.principal));
          setRemainingBalance(Number(data.currentLoan.remainingBalance));
        }
      } catch (err) {
        console.error('Failed to fetch loan type:', err);
      }
    };

    fetchLoanType();
  }, [collections]);

  // OPEN TERM FORMULA
  const openTermProgress = principal
    ? Math.min(
        100,
        Math.round(((principal - remainingBalance) / principal) * 100)
      )
    : 0;  

  // CHOOSE WHICH % TO USE
  const displayProgress =
    loanType === 'Open-Term Loan' ? openTermProgress : paymentProgress;

  // Circle stroke offset
  const offset = circumference * (1 - displayProgress / 100);

  // Reloan rule
  const isReloanAllowed = displayProgress >= 70;

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center relative hover:shadow-xl duration-300">

      <h2 className="text-m font-semibold text-gray-900 mb-6">Payment Progress</h2>

      {/* CIRCLE PROGRESS */}
      <div className="relative w-44 h-44 md:w-52 md:h-52">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#f3f4f6"
            strokeWidth="14"
            fill="none"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="14"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-800 ease-out"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-700">
            {displayProgress}%
          </span>
        </div>
      </div>

      {/* -------- OPEN TERM VIEW -------- */}
      {loanType === 'Open-Term Loan' && (
        <div className="w-full mt-6">
          <p className="text-xs text-gray-500 mb-3 text-center">
            For Open-Term Loans, progress is based on the principal paid.
          </p>

          <div className="text-center mb-4">
            <span className="text-xl font-bold text-emerald-600">
              ₱{remainingBalance.toLocaleString()}
            </span>
            <p className="text-sm text-gray-500">Remaining Balance</p>
          </div>

          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${openTermProgress}%` }}
            ></div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-2">
            {openTermProgress}% of principal paid
          </p>
        </div>
      )}

      {/* -------- REGULAR LOAN VIEW -------- */}
      {loanType !== 'Open-Term Loan' && (
        <div className="mt-6 w-full flex justify-around">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-green-600">{paidCount}</span>
            <span className="text-sm text-gray-500">Paid</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-red-500">{remainingCount}</span>
            <span className="text-sm text-gray-500">Remaining</span>
          </div>
        </div>
      )}

      {/* RELOAN BUTTON */}
      <div className="mt-8 flex flex-col items-center">
        <button
          onClick={() => handleReloan(displayProgress, borrowerId)}
          disabled={!isReloanAllowed}
          className={`px-8 py-3 rounded-xl font-semibold text-white duration-300 ${
            isReloanAllowed
              ? 'bg-emerald-500 hover:bg-emerald-600'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Reloan
        </button>

        {!isReloanAllowed && (
          <span className="text-xs text-gray-400 mt-2 text-center">
            You may only reloan once progress reaches 70%
          </span>
        )}
      </div>
    </div>
  );
}
