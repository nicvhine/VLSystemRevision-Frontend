'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/app/commonComponents/utils/formatters';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
);

// Helper function to safely display data (data is pre-decrypted from backend)
const safeDisplay = (value: any, placeholder: string = "—") => {
  if (!value) return placeholder;
  return value;
};

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        if (!applicationId) {
          setError('Application ID not provided');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch application details');
        }

        const data = await res.json();
        setApplication(data);
      } catch (err: any) {
        console.error('Error fetching application:', err);
        setError(err.message || 'Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId]);

  if (loading) return <LoadingSpinner />;

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Application not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; text: string; lightBg: string; icon: any }> = {
    Applied: { bg: 'bg-red-600', text: 'text-red-900', lightBg: 'bg-red-50', icon: Clock },
    Pending: { bg: 'bg-red-600', text: 'text-red-900', lightBg: 'bg-red-50', icon: Clock },
    Cleared: { bg: 'bg-red-600', text: 'text-red-900', lightBg: 'bg-red-50', icon: CheckCircle },
    Approved: { bg: 'bg-red-600', text: 'text-red-900', lightBg: 'bg-red-50', icon: CheckCircle },
    Disbursed: { bg: 'bg-red-600', text: 'text-red-900', lightBg: 'bg-red-50', icon: CheckCircle },
    Denied: { bg: 'bg-red-600', text: 'text-red-900', lightBg: 'bg-red-50', icon: XCircle },
  };

  const statusConfig = statusColors[application.status] || statusColors['Applied'];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white py-6 px-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div>
            <p className="text-gray-600">Application ID: <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg font-semibold">{application.applicationId}</span></p>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Status Header Card */}
          <div className={`${statusConfig.bg} rounded-2xl p-6 shadow-lg text-white animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden relative`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="relative z-10 flex items-center justify-between flex-col md:flex-row gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <StatusIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">Application Status</p>
                  <h2 className="text-3xl font-bold">{application.status}</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/80 mb-1">Submitted On</p>
                <p className="text-xl font-bold">
                  {formatDate(application.dateApplied)}
                </p>
              </div>
            </div>
          </div>

          {/* Denial Reason Card */}
          {application.status === 'Denied' && application.denialReason && (
            <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-300 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-100 flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">Reason for Denial</h3>
                  <p className="text-red-800 leading-relaxed">{safeDisplay(application.denialReason)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Loan Information */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-4">
              <h3 className="text-lg font-bold text-white">Loan Information</h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Loan Type</p>
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.loanType)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Loan Amount</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(application.appLoanAmount ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Loan Term</p>
                  <p className="text-sm font-semibold text-gray-900">{application.appLoanTerms ? `${application.appLoanTerms} months` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Interest Rate</p>
                  <p className="text-sm font-semibold text-gray-900">{application.appInterestRate ? `${application.appInterestRate}%` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Total Payable</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(application.appTotalPayable ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Monthly Payment</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {application.appTotalPayable && application.appLoanTerms
                      ? formatCurrency((application.appTotalPayable / application.appLoanTerms).toFixed(2))
                      : '—'}
                  </p>
                </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Loan Purpose</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appLoanPurpose)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Personal Information */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-4">
            <h3 className="text-lg font-bold text-white">Personal Information</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Full Name</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appName)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Date of Birth</p>
                <p className="text-sm font-semibold text-gray-900">{application.appDob ? new Date(application.appDob).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Contact Number</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appContact)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Email Address</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appEmail)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Marital Status</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appMarital)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Number of Children</p>
                <p className="text-sm font-semibold text-gray-900">{application.appChildren ?? '—'}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Address</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appAddress)}</p>
              </div>
              {application.appSpouseName && (
                <>
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Spouse Name</p>
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appSpouseName)}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Spouse Occupation</p>
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appSpouseOccupation)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section: Employment Information */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-4">
            <h3 className="text-lg font-bold text-white">Employment Information</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Source of Income</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.sourceOfIncome)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Occupation</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appOccupation)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Employment Status</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appEmploymentStatus)}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Company Name</p>
                <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appCompanyName)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Monthly Income</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(application.appMonthlyIncome ?? 0)}</p>
              </div>
              {application.appTypeBusiness && (
                <>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Business Type</p>
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appTypeBusiness)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Business Name</p>
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appBusinessName)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Business Location</p>
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.appBusinessLoc)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Date Started</p>
                    <p className="text-sm font-semibold text-gray-900">{application.appDateStarted ? new Date(application.appDateStarted).toLocaleDateString() : '—'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section: Collateral Information */}
        {application.collateralType && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-4">
              <h3 className="text-lg font-bold text-white">Collateral Information</h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Collateral Type</p>
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.collateralType)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Collateral Value</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(application.collateralValue ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Ownership Status</p>
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.ownershipStatus)}</p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Description</p>
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(application.collateralDescription)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: References */}
        {application.appReferences && application.appReferences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">References</h3>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {application.appReferences.map((ref: any, index: number) => (
                  <div key={index} className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-red-300 transition-all">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4">Reference {index + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">NAME</p>
                        <p className="text-sm font-semibold text-gray-900">{safeDisplay(ref.name)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">CONTACT</p>
                        <p className="text-sm font-semibold text-gray-900">{safeDisplay(ref.contact)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">RELATION</p>
                        <p className="text-sm font-semibold text-gray-900">{safeDisplay(ref.relation)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
