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
          setActiveLoan({ loanId: loans[0].loanId, balance: loans[0].loanBalance });
          setLoanCollections(loans[0].collections);
        }
      } catch (err) {
        console.error('Failed to load collections for borrower', err);
      }
    };

    fetchCollections();
  }, [borrowersId]);

  // Derived loan UI data when disbursed
  const isDisbursed = latestApplication?.status === 'Disbursed';
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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* How It Works Section (hidden when loan is disbursed) */}
        {!isDisbursed && (
          <div className="mb-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/60 hover:border-red-400"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-red-200 transition-shadow">
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
          ) : latestApplication && latestApplication.status !== 'Active' ? (
            isDisbursed ? (
              <div className="space-y-4">
                {/* Loan Details Box - Now on Top */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 shadow-xl border border-red-500 text-white">
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

                {/* Progress and Collections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Progress Box */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-gray-900">Payment Progress</h4>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {percentPaid}% Complete
                      </span>
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
                        <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fontSize="24" fill="#111827" fontWeight={700}>{percentPaid}%</text>
                        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="#6b7280">PAID</text>
                      </svg>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-green-600 font-medium mb-1">Paid</p>
                        <p className="text-lg font-bold text-green-700">₱{paid.toLocaleString()}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <p className="text-xs text-red-600 font-medium mb-1">Remaining</p>
                        <p className="text-lg font-bold text-red-700">₱{remaining.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Next Collections Box */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-gray-900">Next Payment Due</h4>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    {upcoming.length > 0 ? (
                      (() => {
                        const nextPayment = upcoming[0];
                        const dueDate = new Date(nextPayment.dueDate);
                        const today = new Date();
                        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        // Determine urgency level
                        let urgencyColor = 'bg-green-100 text-green-700 border-green-200';
                        let urgencyText = 'On Track';
                        let urgencyIcon = '✓';
                        
                        if (daysUntilDue < 0) {
                          urgencyColor = 'bg-red-100 text-red-700 border-red-200';
                          urgencyText = 'Overdue';
                          urgencyIcon = '!';
                        } else if (daysUntilDue <= 3) {
                          urgencyColor = 'bg-red-100 text-red-700 border-red-200';
                          urgencyText = 'Due Soon';
                          urgencyIcon = '⚠';
                        } else if (daysUntilDue <= 7) {
                          urgencyColor = 'bg-yellow-100 text-yellow-700 border-yellow-200';
                          urgencyText = 'Due This Week';
                          urgencyIcon = '◷';
                        }
                        
                        return (
                          <div className="space-y-4">
                            {/* Urgency Badge */}
                            <div className={`${urgencyColor} border rounded-lg p-3 flex items-center gap-2`}>
                              <span className="text-lg font-bold">{urgencyIcon}</span>
                              <div className="flex-1">
                                <p className="text-xs font-semibold">{urgencyText}</p>
                                <p className="text-xs opacity-80">
                                  {daysUntilDue < 0 
                                    ? `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`
                                    : daysUntilDue === 0
                                    ? 'Due today'
                                    : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} remaining`
                                  }
                                </p>
                              </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {nextPayment.collectionNumber ?? '1'}
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                      {nextPayment.collectionNumber ? `Installment ${nextPayment.collectionNumber}` : 'Payment'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {nextPayment.referenceNumber || 'Next payment'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mb-3 pb-3 border-b border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Amount Due</p>
                                <p className="text-3xl font-bold text-gray-900">
                                  ₱{Number(nextPayment.periodAmount ?? nextPayment.periodBalance ?? nextPayment.amount ?? 0).toLocaleString()}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due Date</span>
                                </div>
                                <span className="font-semibold">
                                  {dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <CheckCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">All Caught Up!</p>
                        <p className="text-xs mt-1">No upcoming payments at this time</p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const targetLoanId = loan?.loanId ?? latestApplication?.loanId;
                        if (targetLoanId) {
                          router.push(`/userPage/borrowerPage/upcoming-bills?loanId=${encodeURIComponent(targetLoanId)}`);
                        } else {
                          router.push(`/commonComponents/loanApplication/${latestApplication.applicationId}`);
                        }
                      }}
                      className="w-full mt-4 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      View All Bills
                      <ArrowRight className="w-4 h-4" />
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
                          <div key={step} className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${ 
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
                  <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-900">
                      Your application is <span className="font-semibold">{latestApplication.status}</span>. We'll notify you of updates.
                    </p>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => router.push(`/userPage/borrowerPage/application/${latestApplication.applicationId}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-semibold hover:bg-red-700 transition-all shadow-sm"
                  >
                    View Full Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 rounded-2xl p-8 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-400/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-800/20 rounded-full blur-3xl" />
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-4">
                    <Wallet className="w-7 h-7 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">
                  Ready to Get Started?
                </h2>
                
                <p className="text-red-100 mb-6">
                  You don't have an active loan. Apply now and get access to flexible loan options tailored to your needs.
                </p>
                
                <button
                  onClick={() => router.push('/userPage/borrowerPage/applyLoan')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md border border-red-200"
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