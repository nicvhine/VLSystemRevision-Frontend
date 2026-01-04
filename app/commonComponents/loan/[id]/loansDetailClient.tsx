"use client";

import React, { useState, useEffect } from "react";
import { useLoanDetails } from "./hooks";
import Head from "@/app/userPage/headPage/layout";
import Manager from "@/app/userPage/managerPage/layout";
import LoanOfficer from "@/app/userPage/loanOfficerPage/layout";
import EndorseInputModal from "./components/EndorseInputModal";
import EndorseLetterModal from "./components/EndorseLetterModal";
import ErrorModal from "../../modals/errorModal";
import { formatDateTime, formatCurrency} from "../../utils/formatters";
import translations from "@/app/commonComponents/translation";
import CreditScoreCard from "./cards/creditScoreCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface LoansDetailClientProps {
  loanId: string;
}

// ------------------- Progress Circle -------------------
interface ProgressCircleProps {
  value: number;
  label: string;
  subLabel?: string;
  displayValue?: string;
  centerSubLabel?: string;
}

const ProgressCircle = ({ value, label, subLabel, displayValue, centerSubLabel }: ProgressCircleProps) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  const getGradientId = () =>
    value < 50 ? "redGradient" : value < 75 ? "yellowGradient" : "greenGradient";

  return (
    <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-red-100">
      <h2 className="text-base font-semibold text-red-700 mb-6 uppercase tracking-wide">{label}</h2>
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
            stroke={`url(#${getGradientId()})`}
            strokeWidth="14"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl md:text-5xl font-extrabold text-gray-800">
            {displayValue || `${value}%`}
          </span>
          {centerSubLabel && (
            <span className="text-xs text-gray-500 mt-1">{centerSubLabel}</span>
          )}
        </div>
      </div>
      {subLabel && <div className="mt-4 text-sm text-gray-600 text-center font-medium">{subLabel}</div>}
    </div>
  );
};

interface PaymentProgressCardProps {
  paidAmount: number;
  balance: number;
  loanType: string; 
  appTotalPayable?: number; 
  appLoanAmount?: number; 
  t1: any;
}

// ------------------- Payment Progress Card -------------------

const PaymentProgressCard = ({
  paidAmount,
  balance,
  loanType,
  appLoanAmount,
  appTotalPayable,
  t1
}: PaymentProgressCardProps) => {
  const isOpenTerm = loanType?.toLowerCase() === "open-term loan";
  
  // totalLoan is what we divide by
  const totalLoan = loanType?.toLowerCase() === "open-term loan"
  ? appLoanAmount || 0       // Open-Term Loan
  : appTotalPayable || 0;    // Regular Loan

  const amountPaid = loanType?.toLowerCase() === "open-term loan"
    ? (appLoanAmount || 0) - (balance || 0)   // Open-Term Loan
    : (appTotalPayable || 0) - (balance || 0)                     // Regular Loan

  const percentage = totalLoan > 0 ? (amountPaid / totalLoan) * 100 : 0;

  return (
    <ProgressCircle
      value={Number(percentage.toFixed(2))}
      label={t1.t15}
      displayValue={`${Number(percentage.toFixed(0))}%`}
      centerSubLabel="out of 100"
      subLabel={`${formatCurrency(amountPaid)} / ${formatCurrency(totalLoan)}`}
      />
  );
};

// ------------------- Status Badge -------------------
const StatusBadge = ({ status }: { status: string }) => {
  const colors =
    status === "Paid"
      ? "bg-red-100 text-red-700 border border-red-300"
      : status === "Unpaid"
      ? "bg-red-50 text-red-600 border border-red-200"
      : "bg-orange-50 text-orange-600 border border-orange-200";

  return <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${colors}`}>{status}</span>;
};

// ------------------- Delinquency Status Card -------------------
const DelinquencyCard = ({ collections }: { collections: any[] }) => {
  // Calculate delinquency metrics
  const now = new Date();
  let delinquentCount = 0;
  let totalUnpaid = 0;
  let oldestDelinquentDays = 0;
  let totalDelinquentAmount = 0;

  collections.forEach((collection) => {
    if (collection.status === "Unpaid") {
      totalUnpaid++;
      const dueDate = new Date(collection.dueDate);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue > 0) {
        delinquentCount++;
        totalDelinquentAmount += collection.periodAmount || 0;
        if (daysOverdue > oldestDelinquentDays) {
          oldestDelinquentDays = daysOverdue;
        }
      }
    }
  });

  // Determine severity level
  let severity = "low";
  let severityColor = "bg-blue-50 border-blue-200";
  let badgeColor = "bg-blue-100 text-blue-700";
  let iconColor = "text-blue-600";
  let icon = "ℹ️";
  
  if (delinquentCount === 0) {
    severity = "good";
    severityColor = "bg-green-50 border-green-200";
    badgeColor = "bg-green-100 text-green-700";
    iconColor = "text-green-600";
    icon = "✓";
  } else if (delinquentCount <= 2) {
    severity = "low";
    severityColor = "bg-yellow-50 border-yellow-200";
    badgeColor = "bg-yellow-100 text-yellow-700";
    iconColor = "text-yellow-600";
    icon = "⚠️";
  } else if (delinquentCount <= 5) {
    severity = "medium";
    severityColor = "bg-orange-50 border-orange-200";
    badgeColor = "bg-orange-100 text-orange-700";
    iconColor = "text-orange-600";
    icon = "⚠️";
  } else {
    severity = "high";
    severityColor = "bg-red-50 border-red-200";
    badgeColor = "bg-red-100 text-red-700";
    iconColor = "text-red-600";
    icon = "🔴";
  }

  const statusText =
    severity === "good" ? "Good Standing" :
    severity === "low" ? "Low Delinquency" :
    severity === "medium" ? "Medium Delinquency" :
    "High Delinquency";

  return (
    <div className={`rounded-2xl p-6 border ${severityColor}`}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Delinquency Status</h3>
            <p className="text-xs text-gray-600">Payment overdue analysis</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badgeColor}`}>
          {statusText}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {/* Overdue Payments */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-2">OVERDUE</p>
          <p className={`text-3xl font-bold ${delinquentCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {delinquentCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {delinquentCount === 1 ? 'payment' : 'payments'} past due
          </p>
        </div>

        {/* Total Unpaid */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-2">UNPAID</p>
          <p className="text-3xl font-bold text-orange-600">
            {totalUnpaid}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            total due
          </p>
        </div>

        {/* Days Overdue */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-2">OLDEST</p>
          <p className={`text-3xl font-bold ${oldestDelinquentDays > 30 ? 'text-red-600' : oldestDelinquentDays > 7 ? 'text-yellow-600' : oldestDelinquentDays > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {oldestDelinquentDays > 0 ? oldestDelinquentDays : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            days overdue
          </p>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-2">AMOUNT</p>
          <p className={`text-lg font-bold ${delinquentCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {delinquentCount > 0 ? `₱${totalDelinquentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            at risk
          </p>
        </div>
      </div>

      {/* Status Message */}
      {delinquentCount > 0 && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mt-4">
          <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Immediate Action Required</p>
          <p className="text-sm text-red-700">
            {delinquentCount} {delinquentCount === 1 ? 'payment is' : 'payments are'} overdue by {oldestDelinquentDays} {oldestDelinquentDays === 1 ? 'day' : 'days'}. 
            Total overdue amount: <span className="font-bold">₱{totalDelinquentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </p>
        </div>
      )}

      {delinquentCount === 0 && totalUnpaid > 0 && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">
            ℹ️ <span className="font-semibold">{totalUnpaid}</span> {totalUnpaid === 1 ? 'payment is' : 'payments are'} due but not yet overdue. Monitor closely.
          </p>
        </div>
      )}

      {delinquentCount === 0 && totalUnpaid === 0 && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mt-4">
          <p className="text-sm text-green-800">
            ✓ <span className="font-semibold">All payments are up to date.</span> Excellent standing!
          </p>
        </div>
      )}
    </div>
  );
};

// ------------------- Info Component -------------------
const Info = ({ label, value }: { label: string; value: any }) => (
  <div className="group">
    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{label}</p>
    <p className="text-gray-900 text-base font-semibold group-hover:text-red-600 transition">{value}</p>
  </div>
);

// ------------------- Payment Tracker -------------------
const PaymentTrackerCard = ({ collection, isOpenTerm }: { collection: any; isOpenTerm: boolean }) => {
  const paidPercentage =
    collection.periodAmount > 0 ? (collection.paidAmount / collection.periodAmount) * 100 : 0;

  const isOverdue = new Date(collection.dueDate) < new Date() && collection.status === "Unpaid";
  const progressColor = collection.status === "Paid" ? "bg-red-600" : isOverdue ? "bg-red-700" : "bg-red-400";

  return (
    <div className={`w-full bg-white rounded-2xl p-4 border transition-all hover:shadow-md mb-3 ${
      isOverdue ? "border-red-300 bg-red-50" : collection.status === "Paid" ? "border-red-200" : "border-gray-200"
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Ref: <span className="text-red-700 font-bold">{collection.referenceNumber}</span></p>
          <div className="flex gap-3 mt-1 text-xs text-gray-600">
            <span>Due: {new Date(collection.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {collection.status === "Paid" && <span className="text-red-700 font-medium">Mode: {collection.mode}</span>}
          </div>
        </div>
        <StatusBadge status={collection.status} />
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-gray-900">
            {formatCurrency(collection.paidAmount)}
          </p>
          <span className="text-xs text-gray-500">{Math.round(paidPercentage)}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-2 ${progressColor} rounded-full transition-all duration-500`} style={{ width: `${paidPercentage}%` }}></div>
        </div>
      </div>

      {isOverdue && (
        <p className="text-xs text-red-700 font-semibold mt-2">⚠️ Overdue</p>
      )}
      {collection.note && (
        <p className="text-xs text-gray-600 italic mt-2 border-t border-gray-200 pt-2">{collection.note}</p>
      )}
    </div>
  );
};

const PaymentTrackerCards = ({ collections, t1, isOpenTerm }: { collections: any[]; t1: any; isOpenTerm: boolean }) => {
  if (!collections || collections.length === 0)
    return <p className="text-center py-6 text-gray-500 text-sm">{t1.t18}</p>;

  return (
    <div className="flex flex-col">
      {collections.map((c) => (
        <PaymentTrackerCard key={c.referenceNumber} collection={c} isOpenTerm={isOpenTerm} />
      ))}
    </div>
  );
};


// ------------------- Loans Detail Client -------------------
export default function LoansDetailClient({ loanId }: LoansDetailClientProps) {
  const { loan, loading, role, language, t: t1 } = useLoanDetails(loanId);
  const e = translations.endorsementTranslation[language];

  const [collections, setCollections] = useState<any[]>([]);
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [endorsementData, setEndorsementData] = useState<{ reason: string; date: string } | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const [closureStatus, setClosureStatus] = useState<string | null>(null);
  const [loanType, setLoanType] = useState<string | null>(null); // Store loan type
  const [refreshClosureStatus, setRefreshClosureStatus] = useState(0); // Trigger to refresh closure status
  const pendingSubmissionRef = React.useRef(false); // Use ref to persist across re-renders

  useEffect(() => {
    if (!loan) return;
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/collections/${loan.loanId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setCollections(data.collections || []))
      .catch(err => console.error(err));

    // Completely skip closure status fetch if we have a pending submission
    if (pendingSubmissionRef.current) {
      console.log('🚫 Skipping closure status fetch - pending submission');
      return;
    }

    console.log('📡 Fetching closure status for loan:', loan.loanId);
    fetch(`${BASE_URL}/closure/by-loan/${loan.loanId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const newStatus = data.hasClosure ? data.status : null;
        console.log('✅ Closure status from backend:', newStatus);
        setClosureStatus(newStatus);
      })
      .catch(err => console.error(err));
  }, [loan, refreshClosureStatus]);

   // Fetch loan type using the first payment's loanId
   useEffect(() => {
    const fetchLoanType = async () => {
      if (!collections.length) return;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      try {
        const loanId = collections[0].loanId;
        const res = await fetch(`${BASE_URL}/loans/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data && data.currentLoan) {
          setLoanType(data.currentLoan.type); // e.g., "Open-Term Loan"
        }
      } catch (err) {
        console.error("Failed to fetch loan type:", err);
      }
    };

    fetchLoanType();
  }, [collections]);

  const isOpenTerm = loanType?.toLowerCase() === "open-term loan";

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">{t1.t19}</div>;
  if (!loan) return <div className="p-10 text-center text-red-500">{t1.t20}</div>;

  const Wrapper: React.ComponentType<{ children: React.ReactNode }> =
    role === "loan officer" ? LoanOfficer : role === "head" ? Head : Manager;

  const handleGenerate = (reason: string) => {
    setEndorsementData({ reason, date: new Date().toLocaleDateString() });
    setInputModalOpen(false);
    setLetterModalOpen(true);
  };

  const handleEndorsementSuccess = () => {
    console.log('✅ Endorsement submitted successfully! Setting status to Pending');
    // Immediately update closure status to Pending and block future fetches
    setClosureStatus('Pending');
    pendingSubmissionRef.current = true;
    
    // After 5 seconds, allow fetching again to verify from backend
    setTimeout(() => {
      console.log('⏰ Timeout complete - allowing status fetch');
      pendingSubmissionRef.current = false;
      setRefreshClosureStatus(prev => prev + 1);
    }, 5000);
  };

  return (
    <Wrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
        {/* Page Header */}
        <div className="mx-auto max-w-7xl px-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left: Back + Title */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <button
                onClick={() => (typeof window !== 'undefined' ? window.history.back() : null)}
                className="mt-1 p-2 rounded-full hover:bg-gray-100 text-gray-500 flex-shrink-0"
                aria-label="Go back"
              >
                {/* Left chevron icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L9.06 12l6.72 6.72a.75.75 0 11-1.06 1.06l-7.25-7.25a.75.75 0 010-1.06l7.25-7.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="break-words">{loan.name}</span>
                  <span className="text-red-700 hidden sm:inline">|</span>
                  <span className="text-red-700 text-lg sm:text-2xl">{loan.loanId}</span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase ${loan.status === 'Active' ? 'bg-green-100 text-green-700' : loan.status === 'Closed' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {loan.status}
                  </span>
                  <span className="text-sm text-gray-900 font-medium">{loan.loanType}</span>
                </div>
              </div>
            </div>
            {/* Right: Action */}
            <div className="flex items-center justify-start sm:justify-end flex-shrink-0">
              {role === "loan officer" && loan.status === "Active" && closureStatus !== "Pending" && (
                <button
                  onClick={() => setInputModalOpen(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 shadow transition whitespace-nowrap"
                >
                  {e.f1}
                </button>
              )}

              {closureStatus === "Pending" && (
                <p className="text-sm text-gray-500 italic">
                  {e.m6}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {inputModalOpen && <EndorseInputModal onClose={() => setInputModalOpen(false)} onGenerate={handleGenerate} language={language} />}
        {endorsementData && (
          <EndorseLetterModal
            isOpen={letterModalOpen}
            onClose={() => setLetterModalOpen(false)}
            clientName={loan.name}
            reason={endorsementData.reason}
            date={endorsementData.date}
            loanId={loan.loanId}
            onSuccess={handleEndorsementSuccess}
          />
        )}
        <ErrorModal isOpen={showWarning} message={warningMsg} onClose={() => setShowWarning(false)} />

        {/* Main Content */}
  <div className="mx-auto max-w-7xl px-4 space-y-8">
          {/* Progress Cards - Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CreditScoreCard creditScore={loan.creditScore || 0} showTip={false} />
            <PaymentProgressCard
              paidAmount={loan.currentLoan?.paidAmount ?? 0}
              balance={loan.currentLoan?.remainingBalance ?? 0}
              loanType={loan.loanType}
              appLoanAmount={Number(loan.appLoanAmount) || 0}
              appTotalPayable={Number(loan.appTotalPayable) || 0}
              t1={t1}
            />
          </div>

          {/* Delinquency Status Card */}
          <DelinquencyCard collections={collections} />

          {/* Loan Details + Payment Tracker - Full Width with 4 Col Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Loan Details - Left Panel */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-all">
              <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-600 rounded"></span>
                {t1.t16}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                <Info label={t1.t21} value={loan.loanId} />
                <Info label={t1.t22} value={`₱${Number(loan.appLoanAmount).toLocaleString()}`} />
                <Info label={t1.t23} value={loan.loanType} />
                <Info label={t1.t24} value={`${loan.appLoanTerms ?? '—'} months`} />
                <Info label={t1.t25} value={`${loan.appInterestRate ?? '—'}%`} />
                <Info label={t1.t26} value={formatDateTime(loan.dateDisbursed)} />
                <div className="sm:col-span-2">
                  <Info label={language === 'en' ? 'Assigned Agent' : 'Itinalagang Ahente'} value={(loan as any).appAgent?.name || '—'} />
                </div>
              </div>
            </div>

            {/* Payment Tracker - Right Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 h-auto lg:h-[550px] overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 sticky top-0 bg-white pb-4 z-10">
                  <span className="w-1 h-6 bg-red-600 rounded"></span>
                  {t1.t17}
                </h2>
                <PaymentTrackerCards collections={collections} t1={t1} isOpenTerm={isOpenTerm} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
