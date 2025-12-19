'use client';

import React from 'react';
import { formatDate, translateLoanType } from '@/app/commonComponents/utils/formatters';
import { LoanDetailsCardProps } from '@/app/commonComponents/utils/Types/components';
import translations from '@/app/commonComponents/translation';

export default function LoanDetailsCard({ activeLoan, language }: LoanDetailsCardProps) {
  if (!activeLoan) return null;

  const t = translations.loanTermsTranslator[language];
  const isOpenTerm = activeLoan.loanType === 'Open-Term Loan';

  const formatCurrency = (value?: number | string) =>
    `₱${Number(value ?? 0).toLocaleString()}`;

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="text-black px-6 py-4">
        <h2 className="font-bold text-m">Loan Details</h2>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        
        {/* Left Column */}
        <div className="flex flex-col gap-4 border-b md:border-b-0 pb-4 md:pb-0 md:pr-6">
          <DetailRow label={t.l11 || 'Loan ID'} value={activeLoan.loanId} />

          <DetailRow
            label={t.l10 || 'Loan Type'}
            value={translateLoanType(activeLoan.loanType, language)}
            breakText
          />

          <DetailRow
            label={t.l13 || 'Date Disbursed'}
            value={activeLoan.dateDisbursed ? formatDate(activeLoan.dateDisbursed) : '-'}
          />

          {/* Interest Rate should always show */}
          <DetailRow
            label={t.l5 || 'Interest Rate'}
            value={`${activeLoan.appInterestRate ?? 0}%`}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 md:pl-6">
          <DetailRow
            label={t.l4 || 'Principal'}
            value={formatCurrency(activeLoan.appLoanAmount)}
          />

          {/* Hide only these when open-term */}
          {!isOpenTerm && (
            <>
              <DetailRow
                label={t.l6 || 'Total Interest'}
                value={formatCurrency(activeLoan.appTotalInterestAmount)}
              />

              <DetailRow
                label={t.l7 || 'Total Payable'}
                value={formatCurrency(activeLoan.appTotalPayable)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const DetailRow = ({
  label,
  value,
  bold = false,
  breakText = false,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
  breakText?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span
      className={`text-sm ${bold ? 'font-bold text-gray-800 text-base md:text-lg' : 'text-gray-700'} ${
        breakText ? 'break-words text-right max-w-[160px] md:max-w-none' : ''
      }`}
    >
      {value}
    </span>
  </div>
);
