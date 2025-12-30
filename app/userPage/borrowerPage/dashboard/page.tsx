'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/app/commonComponents/utils/formatters';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
import { FileText, CheckCircle, Wallet, ArrowRight, Calendar, TrendingUp } from 'lucide-react';

// Mock components - replace with your actual imports
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
);

export default function BorrowerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [borrowersId, setBorrowersId] = useState<string | null>(null);
  const [latestApplication, setLatestApplication] = useState<any | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [activeLoan, setActiveLoan] = useState<any | null>(null);
  const [loanCollections, setLoanCollections] = useState<any[]>([]);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const steps = [
    {
      icon: FileText,
      title: 'Apply',
      description: 'Complete your loan application in minutes',
    },
    {
      icon: CheckCircle,
      title: 'Review',
      description: 'Fast approval process by our team',
    },
    {
      icon: Wallet,
      title: 'Get Funded',
      description: 'Visit our office to receive your funds',
    },
  ];

  if (loading) return <LoadingSpinner />;

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('borrowersId') : null;
    if (!id) {
      setCheckingApplication(false);
      return;
    }
    setBorrowersId(id);

    const fetchBorrower = async () => {
      setCheckingApplication(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/borrowers/${id}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('Failed to fetch borrower');
        const data = await res.json();
        console.debug('Borrower fetch response:', data);
        setLatestApplication(data.latestApplication || null);
      } catch (err: any) {
        console.error('Error fetching borrower details:', err);
        setError(err?.message || 'Failed to load application status');
      } finally {
        setCheckingApplication(false);
      }
    };

    fetchBorrower();
  }, []);

  // Fetch collections for the logged-in borrower and derive active loan
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${BASE_URL}/collections`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const cols = await res.json();

        // Group by loanId
        const byLoan: Record<string, any[]> = {};
        for (const c of cols) {
          if (!c.loanId) continue;
          byLoan[c.loanId] = byLoan[c.loanId] || [];
          byLoan[c.loanId].push(c);
        }

        // Choose loan with highest loanBalance (likely active)
        const loans = Object.keys(byLoan).map((loanId) => ({ loanId, collections: byLoan[loanId], loanBalance: byLoan[loanId][0]?.loanBalance ?? 0 }));
        loans.sort((a, b) => (b.loanBalance || 0) - (a.loanBalance || 0));
        if (loans.length > 0) {
          // Fetch full loan details to get creditScore and other info
          const loanRes = await fetch(`${BASE_URL}/loans/${loans[0].loanId}`, { headers: { Authorization: `Bearer ${token}` } });
          if (loanRes.ok) {
            const loanData = await loanRes.json();
            setActiveLoan(loanData);
          } else {
            setActiveLoan({ loanId: loans[0].loanId, balance: loans[0].loanBalance });
          }
          setLoanCollections(loans[0].collections);
        }
      } catch (err) {
        console.error('Failed to load collections for borrower', err);
      }
    };

    fetchCollections();
  }, [borrowersId]);

  // Handle cooldown timer for denied applications
  useEffect(() => {
    if (latestApplication?.status === 'Denied') {
      const timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Initialize cooldown to 5 seconds for testing
      setCooldownSeconds(5);

      return () => clearInterval(timer);
    }
  }, [latestApplication?.status]);

  // Derived loan UI data when disbursed
  const isDisbursed = latestApplication?.status === 'Disbursed';
  const isDenied = latestApplication?.status === 'Denied';
  const loan = activeLoan ?? latestApplication?.loan ?? latestApplication?.currentLoan ?? null;
  const collections = loanCollections.length > 0 ? loanCollections : (latestApplication?.collections || latestApplication?.upcomingCollections || []);
  const paid = Number(loan?.paidAmount ?? 0);
  const remaining = Number(loan?.balance ?? loan?.balance ?? latestApplication?.appTotalPayable ?? 0);
  const percentPaid = (paid + remaining) > 0 ? Math.round((paid / (paid + remaining)) * 100) : 0;
  const upcoming = Array.isArray(collections)
    ? collections
        .filter((c: any) => c.status !== 'Paid')
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Pending Principal Change Banner */}
        {latestApplication?.pendingPrincipalChange && (
          <div className="relative bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-600 rounded-lg p-5 shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-600 rounded-full flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 text-lg mb-1">Principal Change Endorsement</h3>
                <p className="text-amber-800 text-sm mb-3">
                  A loan officer has requested to change your principal amount from <span className="font-semibold">{formatCurrency(latestApplication.appLoanAmount ?? 0)}</span> to <span className="font-semibold">{formatCurrency(latestApplication.requestedPrincipal ?? 0)}</span>
                </p>
                <button
                  onClick={() => router.push(`/userPage/borrowerPage/application-details?id=${latestApplication.applicationId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700 transition-all shadow-md hover:shadow-lg"
                >
                  Review & Approve
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section (hidden when loan is disbursed) */}
        {!isDisbursed && (
          <div className="mb-14 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/60 hover:border-red-400 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-red-200 transition-all duration-300 group-hover:scale-110">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-400">
                            Step {index + 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-gray-200 to-transparent" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Application Status or CTA Section */}
        <div className="relative">
          {checkingApplication ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : isDenied ? (
            <div className="relative bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 border-2 border-red-300 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-200/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-100/40 rounded-full blur-2xl" />
              
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                {/* Denial Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6 animate-in bounce duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>

                {/* Denial Message */}
                <h2 className="text-2xl font-bold text-red-900 mb-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                  Application Denied
                </h2>
                
                <p className="text-red-700 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                  Unfortunately, your application did not meet our approval criteria at this time. Please try again after the cooldown period.
                </p>

                {/* Cooldown Timer */}
                <div className="bg-white rounded-xl p-6 mb-6 border-2 border-red-300 shadow-md animate-in fade-in duration-500 delay-200">
                  <p className="text-sm text-gray-600 mb-3">You can apply again in:</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="6"
                          strokeDasharray={`${(cooldownSeconds / 5) * 2 * Math.PI * 45}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-red-600">{cooldownSeconds}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Seconds</p>
                      <p className="text-xs text-gray-500">Until next application</p>
                    </div>
                  </div>
                </div>

                {/* Pending Principal Change Notification */}
                {latestApplication?.pendingPrincipalChange && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Principal Change Request Pending</p>
                        <p className="text-xs text-amber-700">A loan officer requested to change your principal amount. Review and approve the request in application details.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col gap-3 justify-center">
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => router.push('/userPage/borrowerPage/applyLoan')}
                      disabled={cooldownSeconds > 0}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md ${
                        cooldownSeconds > 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                          : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:scale-105 active:scale-95'
                      }`}
                    >
                      Apply Again
                    </button>
                    <button
                      onClick={() => router.push('/userPage/borrowerPage/application-details?id=' + latestApplication.applicationId)}
                      className="px-6 py-3 bg-white border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : latestApplication && latestApplication.status !== 'Active' ? (
            isDisbursed ? (
              <div className="space-y-4">
                {/* Loan Details Box - Now on Top */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 shadow-xl border border-red-500 text-white animate-in fade-in slide-in-from-top-8 duration-500 delay-100">
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="text-xs text-red-100 mb-1">Loan Type</p>
                      <p className="font-semibold text-sm">{loan?.loanType ?? latestApplication.loanType ?? '—'}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="text-xs text-red-100 mb-1">Disbursed</p>
                      <p className="font-semibold text-sm">{loan?.dateDisbursed ? new Date(loan.dateDisbursed).toLocaleDateString() : (latestApplication.dateDisbursed ? new Date(latestApplication.dateDisbursed).toLocaleDateString() : '—')}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="text-xs text-red-100 mb-1">Principal Amount</p>
                      <p className="font-semibold text-sm">{formatCurrency(loan?.appLoanAmount ?? latestApplication.appLoanAmount ?? '—')}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="text-xs text-red-100 mb-1">Loan Term</p>
                      <p className="font-semibold text-sm">{loan?.appLoanTerms ?? latestApplication.appLoanTerms ?? '—'}</p>
                    </div>
                     <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="text-xs text-red-100 mb-1">Interest Rate</p>
                      <p className="font-semibold text-sm">{loan?.appInterestRate ?? latestApplication.appInterestRate ?? '—'}%</p>
                    </div>
                     <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="text-xs text-red-100 mb-1">Total Payable</p>
                      <p className="font-semibold text-sm">{formatCurrency(loan?.appTotalPayable ?? latestApplication.appTotalPayable ?? '—')}</p>
                    </div>
                  </div>
                </div>

                {/* Credit Score and Progress Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                  {/* Credit Score Box */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                    <div className="flex flex-col items-center text-center h-full">
                      <p className="text-xs font-semibold text-gray-600 mb-3">CREDIT SCORE</p>
                      <div className="w-40 h-40 relative mb-4">
                        <svg width="100%" height="100%" viewBox="0 0 140 140">
                          <circle cx="70" cy="70" r="60" stroke="#f3f4f6" strokeWidth="14" fill="none" />
                          <circle
                            cx="70"
                            cy="70"
                            r="60"
                            strokeWidth="14"
                            strokeLinecap="round"
                            fill="none"
                            stroke={(() => {
                              const score = loan?.creditScore ?? latestApplication?.creditScore ?? 0;
                              if (score >= 8) return '#10b981'; // Green for Excellent
                              if (score >= 6) return '#f59e0b'; // Amber for Good
                              if (score >= 4) return '#f97316'; // Orange for Fair
                              return '#ef4444'; // Red for Poor
                            })()}
                            strokeDasharray={`${2 * Math.PI * 60}`}
                            strokeDashoffset={`${(() => {
                              const score = loan?.creditScore ?? latestApplication?.creditScore ?? 0;
                              return ((10 - Math.min(Math.max(score, 0), 10)) / 10) * 2 * Math.PI * 60;
                            })()}`}
                            transform="rotate(-90 70 70)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">{loan?.creditScore ?? latestApplication?.creditScore ?? '—'}</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mt-auto">
                        {(() => {
                          const score = loan?.creditScore ?? latestApplication?.creditScore;
                          if (!score) return '—';
                          if (score >= 8) return 'Excellent';
                          if (score >= 6) return 'Good';
                          if (score >= 4) return 'Fair';
                          return 'Poor';
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Box */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-gray-600">PAYMENT PROGRESS</h4>
                      </div>
                      
                      <div className="flex items-center justify-center mb-4">
                        <svg width="140" height="140" viewBox="0 0 140 140">
                          <circle cx="70" cy="70" r="60" stroke="#f3f4f6" strokeWidth="14" fill="none" />
                          <circle
                            cx="70"
                            cy="70"
                            r="60"
                            stroke="#10b981"
                            strokeWidth="14"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 60}`}
                            strokeDashoffset={`${((100 - Math.min(Math.max(percentPaid, 0), 100)) / 100) * 2 * Math.PI * 60}`}
                            transform="rotate(-90 70 70)"
                          />
                          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fill="#111827" fontWeight={700}>{percentPaid}%</text>
                        </svg>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200 hover:border-green-400 transition-colors duration-300 cursor-default hover:bg-green-100/50\">
                          <p className="text-xs text-green-600 font-medium mb-1\">Paid</p>
                          <p className="text-sm font-bold text-green-700\">₱{paid.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200 hover:border-red-400 transition-colors duration-300 cursor-default hover:bg-red-100/50\">
                          <p className="text-xs text-red-600 font-medium mb-1\">Remaining</p>
                          <p className="text-sm font-bold text-red-700\">₱{remaining.toLocaleString()}</p>
                        </div>
                      </div>
                      {percentPaid >= 70 && (
                        <button
                          onClick={() => {
                            const reloanData = {
                              loanType: latestApplication?.loanType,
                              previousLoanAmount: latestApplication?.appLoanAmount,
                              previousLoanTerms: latestApplication?.appLoanTerms,
                              previousInterestRate: latestApplication?.appInterestRate,
                              isReloan: true,
                            };
                            router.push(`/userPage/borrowerPage/applyLoan?reloan=${encodeURIComponent(JSON.stringify(reloanData))}`);
                          }}
                          className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all hover:shadow-lg hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        >
                          Apply for Reloan
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Next Payment Due Box - Full Width */}
                <div className="bg-gradient-to-br from-white to-red-50/20 rounded-2xl p-6 shadow-lg border border-red-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h4 className="text-base font-bold text-gray-900">Next Payment Due</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Stay on top of your schedule</p>
                      </div>
                      <Calendar className="w-6 h-6 text-red-600" />
                    </div>
                    
                    {upcoming.length > 0 ? (
                      (() => {
                        const nextPayment = upcoming[0];
                        const dueDate = new Date(nextPayment.dueDate);
                        const today = new Date();
                        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        // Determine urgency level
                        let urgencyColor = 'bg-green-100 text-green-700 border-green-300';
                        let urgencyBgColor = 'bg-green-50';
                        let urgencyText = 'On Track';
                        let urgencyIcon = '✓';
                        
                        if (daysUntilDue < 0) {
                          urgencyColor = 'bg-red-100 text-red-700 border-red-300';
                          urgencyBgColor = 'bg-red-50';
                          urgencyText = 'Overdue';
                          urgencyIcon = '⚠';
                        } else if (daysUntilDue <= 3) {
                          urgencyColor = 'bg-red-100 text-red-700 border-red-300';
                          urgencyBgColor = 'bg-red-50';
                          urgencyText = 'Due Soon';
                          urgencyIcon = '!';
                        } else if (daysUntilDue <= 7) {
                          urgencyColor = 'bg-yellow-100 text-yellow-700 border-yellow-300';
                          urgencyBgColor = 'bg-yellow-50';
                          urgencyText = 'Due This Week';
                          urgencyIcon = '◷';
                        }
                        
                        return (
                          <div className="space-y-4">
                            {/* Urgency Badge */}
                            <div className={`${urgencyColor} border-2 rounded-xl p-4 flex items-center gap-3 animate-in fade-in pulse duration-300`}>
                              <span className="text-2xl animate-bounce">{urgencyIcon}</span>
                              <div className="flex-1">
                                <p className="text-sm font-bold">{urgencyText}</p>
                                <p className="text-xs opacity-85">
                                  {daysUntilDue < 0 
                                    ? `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`
                                    : daysUntilDue === 0
                                    ? '🔴 Due today'
                                    : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} remaining`
                                  }
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-opacity-70">Days</p>
                                <p className="text-2xl font-bold">{Math.max(0, daysUntilDue)}</p>
                              </div>
                            </div>

                            {/* Payment Details - Enhanced */}
                            <div className={`${urgencyBgColor} p-6 rounded-xl border-2 border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100`}>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                                    {nextPayment.collectionNumber ?? '1'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {nextPayment.collectionNumber ? `Installment ${nextPayment.collectionNumber}` : 'Next Payment'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {nextPayment.referenceNumber || 'Regular payment'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600 mb-1">Amount Due</p>
                                  <p className="text-2xl font-bold text-red-600">
                                    ₱{Number(nextPayment.periodAmount ?? nextPayment.periodBalance ?? nextPayment.amount ?? 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-lg p-3 flex items-center justify-between border border-gray-200 hover:border-red-400 hover:bg-red-50/30 transition-all duration-300">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-red-600 animate-in bounce" />
                                  <span className="text-xs font-medium text-gray-700">Due Date</span>
                                </div>
                                <span className="font-bold text-gray-900">
                                  {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300 delay-200">
                              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 hover:shadow-md">
                                <p className="text-xs text-gray-600 mb-1">Paid on Time</p>
                                <p className="text-lg font-bold text-green-600">
                                  {collections.filter((c: any) => c.status === 'Paid').length}/{collections.length}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 hover:shadow-md">
                                <p className="text-xs text-gray-600 mb-1">Total Due</p>
                                <p className="text-lg font-bold text-gray-900">
                                  ₱{Number(remaining).toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 hover:shadow-md">
                                <p className="text-xs text-gray-600 mb-1">Installments</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {collections.length}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">All Caught Up! 🎉</p>
                        <p className="text-sm text-gray-600">No upcoming payments at this time</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-5 animate-in fade-in duration-300 delay-300">
                      <button
                        onClick={() => {
                          const targetLoanId = loan?.loanId ?? latestApplication?.loanId;
                          if (targetLoanId) {
                            router.push(`/userPage/borrowerPage/upcoming-bills?loanId=${encodeURIComponent(targetLoanId)}`);
                          } else {
                            router.push(`/commonComponents/loanApplication/${latestApplication.applicationId}`);
                          }
                        }}
                        className="px-4 py-3 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95\"
                      >
                        View All Bills
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const targetLoanId = loan?.loanId ?? latestApplication?.loanId;
                          if (targetLoanId) {
                            router.push(`/userPage/borrowerPage/upcoming-bills?loanId=${encodeURIComponent(targetLoanId)}`);
                          }
                        }}
                        className="px-4 py-3 bg-white text-red-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all border-2 border-red-600 hover:shadow-lg hover:scale-105 active:scale-95\"
                      >
                        Make Payment
                      </button>
                    </div>
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-white to-red-50 rounded-2xl p-7 border border-red-200/50 shadow-lg">
                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-50/50 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  {/* Header with tracking label */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-red-600">TRACKING</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Application Status</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Reference</p>
                      <p className="text-lg font-bold text-red-600 font-mono">{latestApplication.applicationId}</p>
                    </div>
                  </div>

                  {/* Application Status Timeline */}
                  <div className="mb-6">
                    <div className="space-y-3">
                      {/* Status Steps */}
                      {['Applied', 'Pending', 'Cleared', 'Approved', 'Disbursed'].map((step, index) => {
                        const statusLower = latestApplication.status?.toLowerCase() || '';
                        const stepLower = step.toLowerCase();
                        
                        // Determine if step is completed, current, or pending
                        const statusOrder = ['applied', 'pending', 'cleared', 'approved', 'disbursed'];
                        const currentIndex = statusOrder.indexOf(statusLower);
                        const stepIndex = statusOrder.indexOf(stepLower);
                        
                        const isCompleted = stepIndex < currentIndex;
                        const isCurrent = stepIndex === currentIndex;
                        const isPending = stepIndex > currentIndex;
                        
                        return (
                          <div key={step} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both\" style={{animationDelay: `${index * 50}ms`}}>
                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${ 
                              isCompleted ? 'bg-green-500 text-white' : 
                              isCurrent ? 'bg-red-600 text-white animate-pulse' : 
                              'bg-gray-300 text-gray-600'
                            }`}>
                              {isCompleted ? '✓' : (isCurrent ? '◉' : '○')}
                            </div>
                            <span className={`text-sm font-medium ${ 
                              isCompleted ? 'text-green-600' : 
                              isCurrent ? 'text-red-600' : 
                              'text-gray-400'
                            }`}>
                              {step}
                            </span>
                            {isCurrent && <span className="ml-auto text-xs font-semibold text-red-600">Currently here</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Compact Info Message */}
                  <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in pulse duration-500">
                    <p className="text-xs text-blue-900">
                      Your application is <span className="font-semibold">{latestApplication.status}</span>. We'll notify you of updates.
                    </p>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => router.push(`/userPage/borrowerPage/application-details?id=${latestApplication.applicationId}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    View Full Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 rounded-2xl p-8 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-400/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-800/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-4 animate-in bounce duration-500">
                    <Wallet className="w-7 h-7 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                  Ready to Get Started?
                </h2>
                
                <p className="text-red-100 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                  You don't have an active loan. Apply now and get access to flexible loan options tailored to your needs.
                </p>
                
                <button
                  onClick={() => router.push('/userPage/borrowerPage/applyLoan')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md border border-red-200 hover:shadow-lg hover:scale-105 active:scale-95 animate-in fade-in duration-500 delay-200"
                >
                  Apply for a Loan
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}