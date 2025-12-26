'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
import { FileText, CheckCircle, Wallet, ArrowRight } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* How It Works Section */}
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

        {/* Application Status or CTA Section */}
        <div className="relative">
          {checkingApplication ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <LoadingSpinner />
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