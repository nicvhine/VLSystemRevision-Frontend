'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/app/commonComponents/utils/formatters';
import { ArrowRight, Calendar, CheckCircle, Wallet } from 'lucide-react';

// Component imports
import { LoadingSpinner } from './components/LoadingSpinner';
import LoanDetailsBox from './components/LoanDetailsBox';
import ReloanStatusBanner from './components/ReloanStatusBanner';
import PendingPrincipalChangeBanner from './components/PendingPrincipalChangeBanner';
import HowItWorks from './components/HowItWorks';
import DeniedApplication from './components/DeniedApplication';
import WithdrawnApplication from './components/WithdrawnApplication';
import PendingApplication from './components/PendingApplication';
import NoActiveLoan from './components/NoActiveLoan';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
  const [pendingReloanStatus, setPendingReloanStatus] = useState<any | null>(null);

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
        
        // Check for ANY pending applications (not just the current one)
        // A pending application is one with status: Applied, Pending, Cleared, Approved, or Disbursed
        if (data.allApplications && Array.isArray(data.allApplications)) {
          const pendingApp = data.allApplications.find((app: any) => 
            ['Applied', 'Pending', 'Cleared', 'Approved', 'Disbursed'].includes(app.status)
          );
          
          console.log('📋 Checking all applications:', data.allApplications.length, 'applications found');
          console.log('📋 Pending application check:', { 
            hasPending: !!pendingApp,
            pendingStatus: pendingApp?.status,
            pendingId: pendingApp?.applicationId
          });
          
          if (pendingApp) {
            console.log('✅ Found pending application:', pendingApp.applicationId);
            setPendingReloanStatus(pendingApp);
          } else {
            console.log('❌ No pending applications found');
            setPendingReloanStatus(null);
          }
        } else {
          console.log('❌ No allApplications array in response');
          setPendingReloanStatus(null);
        }
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

  const isDisbursed = latestApplication?.status === 'Active';

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
  const isDenied = latestApplication?.status === 'Denied' || latestApplication?.status === 'Denied by LO';
  const isWithdrawn = latestApplication?.status === 'Withdrawn';
  const loan = activeLoan ?? latestApplication?.loan ?? latestApplication?.currentLoan ?? null;
  const isOpenTermLoan = loan?.loanType === 'Open-Term Loan' || loan?.isOpenTerm === true;
  const collections = loanCollections.length > 0 ? loanCollections : (latestApplication?.collections || latestApplication?.upcomingCollections || []);
  const paid = Number(loan?.paidAmount ?? 0);
  const remaining = Number(loan?.balance ?? loan?.balance ?? latestApplication?.appTotalPayable ?? 0);
  const percentPaid = (() => {
    if (isOpenTermLoan) {
      const principal = Number(loan?.principal ?? loan?.originalPrincipal ?? latestApplication?.appLoanAmount ?? 0);
      return principal > 0 ? Math.round(((principal - remaining) / principal) * 100) : 0;
    } else {
      return (paid + remaining) > 0 ? Math.round((paid / (paid + remaining)) * 100) : 0;
    }
  })();
  const upcoming = Array.isArray(collections)
    ? collections
        .filter((c: any) => c.status !== 'Paid')
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Pending Principal Change Banner */}
        {latestApplication?.pendingPrincipalChange && (
          <div className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Principal Change Pending</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Requested change from <span className="font-semibold">{formatCurrency(latestApplication.appLoanAmount ?? 0)}</span> to <span className="font-semibold">{formatCurrency(latestApplication.requestedPrincipal ?? 0)}</span>
                </p>
                <button
                  onClick={() => router.push(`/userPage/borrowerPage/application-details?id=${latestApplication.applicationId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Review Request
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section (hidden when loan is disbursed) */}
        {!isDisbursed && <HowItWorks />}

        {/* Application Status or CTA Section */}
        <div className="relative">
          {checkingApplication ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : isDenied ? (
            <DeniedApplication latestApplication={latestApplication} cooldownSeconds={cooldownSeconds} />
          ) : isWithdrawn ? (
            <WithdrawnApplication latestApplication={latestApplication} />
          ) : isDisbursed ? (
            <div className="space-y-4">
                <LoanDetailsBox loan={loan} latestApplication={latestApplication} />

                {/* Reloan Status Banner (if pending/approved) */}
                {pendingReloanStatus && <ReloanStatusBanner pendingReloanStatus={pendingReloanStatus} />}

                {/* Credit Score and Progress Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                  {/* Credit Score Box */}
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                    <div className="flex flex-col items-center text-center h-full">
                      <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Credit Score</p>
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
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Payment Progress</h4>
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
                      
                      {isOpenTermLoan && (
                        <p className="text-xs text-gray-500 text-center mb-3">
                          For Open-Term loans, progress is based on principal reduction: (Principal - Remaining) / Principal
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 transition-colors duration-300 cursor-default">
                          <p className="text-xs text-gray-600 font-medium mb-1">Paid</p>
                          <p className="text-sm font-bold text-gray-900">₱{paid.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 transition-colors duration-300 cursor-default">
                          <p className="text-xs text-gray-600 font-medium mb-1">Remaining</p>
                          <p className="text-sm font-bold text-gray-900">₱{remaining.toLocaleString()}</p>
                        </div>
                      </div>
                      {percentPaid >= 70 && !pendingReloanStatus ? (
                        <button
                          onClick={() => {
                            const reloanData = {
                              loanType: latestApplication?.loanType,
                              previousLoanAmount: latestApplication?.appLoanAmount,
                              previousLoanTerms: latestApplication?.appLoanTerms,
                              previousInterestRate: latestApplication?.appInterestRate,
                              remainingBalance: remaining,
                              isReloan: true,
                            };
                            router.push(`/userPage/borrowerPage/applyLoan?reloan=${encodeURIComponent(JSON.stringify(reloanData))}`);
                          }}
                          className="w-full mt-4 px-4 py-3 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all hover:shadow-lg hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        >
                          Apply for Restructuring
                        </button>
                      ) : percentPaid >= 70 && pendingReloanStatus ? (
                        <button
                          disabled
                          className="w-full mt-4 px-4 py-3 bg-gray-400 text-white rounded-lg text-sm font-semibold cursor-not-allowed animate-in fade-in slide-in-from-bottom-2 duration-300"
                          title={`You have a ${pendingReloanStatus.status} restructuring application. Please wait for it to be processed.`}
                        >
                          Pending Restructure Application
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Next Payment Due Box - Full Width */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">Next Payment Due</h4>
                      <div className="p-2.5 bg-red-100 rounded-full">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    
                    {upcoming.length > 0 ? (
                      (() => {
                        const nextPayment = upcoming[0];
                        const dueDate = new Date(nextPayment.dueDate);
                        const today = new Date();
                        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        // Determine urgency level
                        let urgencyText = 'On Track';
                        
                        if (daysUntilDue < 0) {
                          urgencyText = 'Overdue';
                        } else if (daysUntilDue <= 3) {
                          urgencyText = 'Due Soon';
                        } else if (daysUntilDue <= 7) {
                          urgencyText = 'Due This Week';
                        }
                        
                        return (
                          <div className="space-y-4">
                            {/* Main Payment Info Card */}
                            <div className="bg-white border-2 border-red-200 rounded-xl p-5">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <p className="text-sm font-bold text-red-600 mb-1">{urgencyText}</p>
                                  <p className="text-2xl font-bold text-gray-900">
                                    ₱{Number(nextPayment.periodBalance ?? nextPayment.periodAmount - (nextPayment.paidAmount ?? 0)).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600 mb-1">Due In</p>
                                  <p className="text-3xl font-bold text-red-600">{Math.max(0, daysUntilDue)}</p>
                                  <p className="text-xs text-gray-600">days</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Calendar className="w-4 h-4 text-red-600" />
                                <span>{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-600 font-medium mb-1">Installment</p>
                                <p className="text-lg font-bold text-gray-900">{nextPayment.collectionNumber ?? '1'} / {collections.length}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-600 font-medium mb-1">Total Remaining</p>
                                <p className="text-lg font-bold text-gray-900">₱{Number(remaining).toLocaleString()}</p>
                              </div>
                            </div>

                            {/* Payment Button */}
                            <button
                              onClick={() => {
                                const targetLoanId = loan?.loanId ?? latestApplication?.loanId;
                                if (targetLoanId) {
                                  router.push(`/userPage/borrowerPage/upcoming-bills?loanId=${encodeURIComponent(targetLoanId)}`);
                                }
                              }}
                              className="w-full bg-red-600 text-white rounded-lg text-base font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg py-3 border-2 border-transparent"
                            >
                              Make Payment
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
                          <CheckCircle className="w-7 h-7 text-gray-700" />
                        </div>
                        <p className="text-base font-semibold text-gray-900 mb-1">All Caught Up! 🎉</p>
                        <p className="text-sm text-gray-600 mb-4">No upcoming payments at this time</p>
                        <button
                          onClick={() => {
                            const targetLoanId = loan?.loanId ?? latestApplication?.loanId;
                            if (targetLoanId) {
                              router.push(`/userPage/borrowerPage/upcoming-bills?loanId=${encodeURIComponent(targetLoanId)}`);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                        >
                          View Bills
                        </button>
                      </div>
                    )}
                </div>
              </div>
          ) : latestApplication && latestApplication.status !== 'Active' ? (
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
                              isCompleted ? 'bg-gray-700 text-white' : 
                              isCurrent ? 'bg-red-600 text-white animate-pulse' : 
                              'bg-gray-300 text-gray-600'
                            }`}>
                              {isCompleted ? '✓' : (isCurrent ? '◉' : '○')}
                            </div>
                            <span className={`text-sm font-medium ${ 
                              isCompleted ? 'text-gray-700' : 
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
                  <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in pulse duration-500">
                    <p className="text-xs text-red-900">
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
          ) : latestApplication && latestApplication.status !== 'Active' ? (
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
                            isCompleted ? 'bg-gray-700 text-white' : 
                            isCurrent ? 'bg-red-600 text-white animate-pulse' : 
                            'bg-gray-300 text-gray-600'
                          }`}>
                            {isCompleted ? '✓' : (isCurrent ? '◉' : '○')}
                          </div>
                          <span className={`text-sm font-medium ${ 
                            isCompleted ? 'text-gray-700' : 
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
                <div className="mb-5 p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in pulse duration-500">
                  <p className="text-xs text-gray-700">
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
          ) : (
            <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gray-100/40 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gray-50/50 rounded-full blur-3xl" />
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-xl mb-4 animate-in bounce duration-500">
                    <Wallet className="w-7 h-7 text-red-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-3 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                  Ready to Get Started?
                </h2>
                
                <p className="text-gray-700 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                  You don't have an active loan. Apply now and get access to flexible loan options tailored to your needs.
                </p>
                
                <button
                  onClick={() => router.push('/userPage/borrowerPage/applyLoan')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 animate-in fade-in duration-500 delay-200"
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