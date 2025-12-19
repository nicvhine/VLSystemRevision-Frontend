"use client";

import React, { useState } from "react";
import { LoadingSpinner } from "@/app/commonComponents/utils/loading";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

interface LoanDetails {
  loanId: string;
  name: string;
  interestRate: number;
  dateDisbursed: string;
  principal: number;
  startDate: string;
  endDate: string;
  monthlyDue: number;
  totalPayable: number;
  termsInMonths: string;
  numberOfPeriods: number;
  status: string;
  balance: number;
  paidAmount: number;
  creditScore: number;
  paymentHistory: any[];
  paymentProgress: number;
}

interface LoanHistoryProps {
  loans: LoanDetails[];
  translations: any;
  language: 'en' | 'ceb';
}

export default function LoanHistory({ loans, translations, language }: LoanHistoryProps) {
  const historyLoans = loans;
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState<string | null>(null);

  if (historyLoans.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 text-gray-800 mt-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">{translations[language].loanHistory || 'Loan History'}</h2>
        <div className="text-gray-500 text-sm">{translations[language].noHistory || 'No previous loans found.'}</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    Number(amount).toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCardClick = async (loanId: string) => {
    if (expandedLoanId === loanId) {
      setExpandedLoanId(null);
      return;
    }

    setExpandedLoanId(loanId);
    setLoadingPayments(loanId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/payments/?loanId=${loanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const payments = await response.json();
        setAllPayments(payments);
      } else {
        console.error('Failed to fetch payments');
        setAllPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setAllPayments([]);
    } finally {
      setLoadingPayments(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Closed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Active':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {historyLoans.map((loan) => (
        <div key={loan.loanId} className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
          {/* Loan Card Header */}
          <div 
            className="p-6 sm:p-8 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleCardClick(loan.loanId)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-800">{translations[language].loanId}: {loan.loanId}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                  {loan.status === 'Closed' ? (translations[language].completed || 'Closed') : 
                   loan.status === 'Overdue' ? (translations[language].overdue || 'Overdue') : 
                   loan.status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{formatDate(loan.dateDisbursed)}</span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedLoanId === loan.loanId ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Loan Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">{translations[language].principalAmount}</p>
                <p className="font-bold text-lg text-gray-800">{formatCurrency(loan.principal)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">{translations[language].totalPayable}</p>
                <p className="font-bold text-lg text-gray-800">{formatCurrency(loan.totalPayable)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-600 text-xs uppercase tracking-wide mb-1">{translations[language].totalPayments}</p>
                <p className="font-bold text-lg text-green-700">{formatCurrency(loan.paidAmount)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600 text-xs uppercase tracking-wide mb-1">{translations[language].remainingBalance}</p>
                <p className="font-bold text-lg text-red-700">{formatCurrency(loan.balance)}</p>
              </div>
            </div>
          </div>
          
          {/* Expanded Details */}
          {expandedLoanId === loan.loanId && (
            <div className="border-t border-gray-200 bg-gray-50">
              <div className="p-6 sm:p-8">
                {/* Detailed Loan Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-600">{translations[language].loanPeriod}:</span> {loan.termsInMonths} {translations[language].months}</p>
                    <p><span className="font-medium text-gray-600">{translations[language].interestRate}:</span> {loan.interestRate}%</p>
                    <p><span className="font-medium text-gray-600">{translations[language].monthlyDue}:</span> {formatCurrency(loan.monthlyDue)}</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-600">{translations[language].startDate}:</span> {formatDate(loan.startDate)}</p>
                    <p><span className="font-medium text-gray-600">{translations[language].endDate}:</span> {formatDate(loan.endDate)}</p>
                    <p><span className="font-medium text-gray-600">{translations[language].paymentProgress}:</span> {loan.paymentProgress}%</p>
                  </div>
                </div>
                
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
