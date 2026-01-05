'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/app/commonComponents/utils/formatters';
import SuccessModal from '@/app/commonComponents/modals/successModal';

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
  const [approvingPrincipal, setApprovingPrincipal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [userRole, setUserRole] = useState<string>('borrower');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Withdrawal reasons
  const withdrawalReasons = [
    'Found better loan terms elsewhere',
    'Financial situation changed',
    'No longer need the loan',
    'Application processing is taking too long',
    'Personal reasons',
    'Other',
  ];

  // Loan tables for auto-calculation
  const withCollateralTable = [
    { amount: 20000, months: 8, interest: 7 },
    { amount: 50000, months: 10, interest: 5 },
    { amount: 100000, months: 18, interest: 4 },
    { amount: 200000, months: 24, interest: 3 },
    { amount: 300000, months: 36, interest: 2 },
    { amount: 500000, months: 60, interest: 1.5 },
  ];

  const withoutCollateralTable = [
    { amount: 10000, months: 5, interest: 10 },
    { amount: 15000, months: 6, interest: 10 },
    { amount: 20000, months: 8, interest: 10 },
    { amount: 30000, months: 10, interest: 10 },
  ];

  const openTermTable = [
    { amount: 50000, interest: 6 },
    { amount: 100000, interest: 5 },
    { amount: 200000, interest: 4 },
    { amount: 500000, interest: 3 },
  ];

  // Get loan terms based on amount and collateral status
  const getLoanTerms = (amount: number, hasCollateral: boolean) => {
    const table = hasCollateral ? withCollateralTable : withoutCollateralTable;
    const match = table.find(item => item.amount === amount);
    return match || null;
  };

  // Calculate total payable using correct formula
  const calculateTotalPayable = (loanAmount: number, interestRate: number, loanTerms: number) => {
    if (!loanAmount || !interestRate || !loanTerms) return 0;
    // Interest Amount = Loan Amount * (Interest Rate / 100)
    const interestAmount = loanAmount * (interestRate / 100);
    // Total Interest Amount = Interest Amount * Loan Terms
    const totalInterestAmount = interestAmount * loanTerms;
    // Total Payable = Loan Amount + Total Interest Amount
    return loanAmount + totalInterestAmount;
  };

  // Calculate monthly due
  const calculateMonthlyDue = (totalPayable: number, loanTerms: number) => {
    if (!totalPayable || !loanTerms) return 0;
    return totalPayable / loanTerms;
  };

  const handleApprovePrincipalChange = async () => {
    if (!applicationId) return;
    setApprovingPrincipal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}/approve-principal-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Failed to approve principal change');

      const data = await res.json();
      setApplication(data.updatedApp);
      setSuccessMessage('Principal change approved successfully!');
      setSuccessModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setSuccessMessage(err.message || 'Error approving principal change');
      setSuccessModalOpen(true);
    } finally {
      setApprovingPrincipal(false);
    }
  };

  const handleRejectPrincipalChange = async () => {
    if (!applicationId) return;
    setApprovingPrincipal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}/reject-principal-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Failed to reject principal change');

      const data = await res.json();
      setApplication(data.updatedApp);
      setSuccessMessage('Principal change rejected');
      setSuccessModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setSuccessMessage(err.message || 'Error rejecting principal change');
      setSuccessModalOpen(true);
    } finally {
      setApprovingPrincipal(false);
    }
  };

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        if (!applicationId) {
          setError('Application ID not provided');
          setLoading(false);
          return;
        }

        // Get user role from localStorage
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setUserRole(tokenPayload.role || 'borrower');
          } catch (e) {
            console.warn('Could not parse token role');
          }
        }

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
        setEditFormData(data);
      } catch (err: any) {
        console.error('Error fetching application:', err);
        setError(err.message || 'Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId]);

  const handleStartEdit = () => {
    setEditFormData({ ...application });
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData(null);
  };

  const handleSaveEdit = async () => {
    if (!applicationId) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) throw new Error('Failed to update application');

      const data = await res.json();
      setApplication(data);
      setIsEditMode(false);
      setSuccessMessage('Application details updated successfully!');
      setSuccessModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setSuccessMessage(err.message || 'Error updating application');
      setSuccessModalOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdrawApplication = async () => {
    if (!applicationId) return;
    setWithdrawalModalOpen(true);
  };

  const handleSubmitWithdrawal = async () => {
    if (!applicationId || !withdrawalReason.trim()) {
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}/withdrawal-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ withdrawalReason }),
      });

      if (!res.ok) throw new Error('Failed to submit withdrawal request');

      const data = await res.json();
      setApplication(data);
      setWithdrawalModalOpen(false);
      setWithdrawalReason('');
      setSuccessMessage('Application withdrawn successfully.');
      setSuccessModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setSuccessMessage(err.message || 'Error submitting withdrawal request');
      setSuccessModalOpen(true);
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const handleApproveWithdrawal = async () => {
    if (!applicationId) return;

    const confirm = window.confirm('Are you sure you want to approve this withdrawal request?');
    if (!confirm) return;

    setApprovingPrincipal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}/approve-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Failed to approve withdrawal');

      const data = await res.json();
      setApplication(data);
      setSuccessMessage('Withdrawal request approved successfully!');
      setSuccessModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setSuccessMessage(err.message || 'Error approving withdrawal');
      setSuccessModalOpen(true);
    } finally {
      setApprovingPrincipal(false);
    }
  };

  const handleDenyWithdrawal = async () => {
    if (!applicationId) return;

    const reason = window.prompt('Enter reason for denying withdrawal request:');
    if (!reason) return;

    setApprovingPrincipal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/loan-applications/${applicationId}/deny-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ denialReason: reason }),
      });

      if (!res.ok) throw new Error('Failed to deny withdrawal');

      const data = await res.json();
      setApplication(data);
      setSuccessMessage('Withdrawal request denied successfully!');
      setSuccessModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setSuccessMessage(err.message || 'Error denying withdrawal');
      setSuccessModalOpen(true);
    } finally {
      setApprovingPrincipal(false);
    }
  };

  const handleEditFieldChange = (field: string, value: any) => {
    const updatedData = {
      ...editFormData,
      [field]: value,
    };

    // Auto-calculate loan terms and interest when amount changes
    if (field === 'appLoanAmount' && value) {
      const hasCollateral = editFormData.collateralType && editFormData.collateralType.length > 0;
      const terms = getLoanTerms(value, hasCollateral);
      
      if (terms) {
        updatedData.appLoanTerms = terms.months;
        updatedData.appInterestRate = terms.interest;
        updatedData.appTotalPayable = calculateTotalPayable(value, terms.interest, terms.months);
      }
    }

    // Auto-calculate total payable when interest or terms change
    if ((field === 'appInterestRate' || field === 'appLoanTerms') && updatedData.appLoanAmount && updatedData.appInterestRate && updatedData.appLoanTerms) {
      updatedData.appTotalPayable = calculateTotalPayable(updatedData.appLoanAmount, updatedData.appInterestRate, updatedData.appLoanTerms);
    }

    setEditFormData(updatedData);
  };

  const handleEditReferenceChange = (refIndex: number, field: string, value: any) => {
    const updatedData = { ...editFormData };
    if (!updatedData.appReferences) {
      updatedData.appReferences = [];
    }
    if (!updatedData.appReferences[refIndex]) {
      updatedData.appReferences[refIndex] = {};
    }
    updatedData.appReferences[refIndex] = {
      ...updatedData.appReferences[refIndex],
      [field]: value,
    };
    setEditFormData(updatedData);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/20 to-white py-8 px-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600">App ID:</p>
            <p className="font-mono text-sm bg-red-100/50 text-red-900 px-3 py-1 rounded-lg font-semibold border border-red-200">{application.applicationId}</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Status Header Card */}
          <div className={`${statusConfig.bg} rounded-2xl p-6 shadow-lg text-white animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden relative`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="relative z-10 flex items-center justify-between flex-col md:flex-row gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/20">
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-0.5">Status</p>
                  <h2 className="text-2xl font-bold">{application.status}</h2>
                </div>
              </div>
              <div className="text-right md:border-l md:border-white/20 md:pl-6">
                <p className="text-xs text-white/70 uppercase tracking-widest mb-1">Submitted</p>
                <p className="text-lg font-bold">
                  {formatDate(application.dateApplied)}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Details Button - Only for Applied Status */}
          {application.status === 'Applied' && !isEditMode && (
            <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-red-900 mb-0.5">Application in Applied Status</h3>
                  <p className="text-xs text-red-700">Make changes before submission</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={handleStartEdit}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-xs whitespace-nowrap"
                  >
                    Edit
                  </button>
                  {!application.pendingWithdrawalRequest && (
                    <button
                      onClick={handleWithdrawApplication}
                      disabled={approvingPrincipal}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors text-xs whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {approvingPrincipal ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Withdrawal Request Modal */}
          {withdrawalModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Withdraw Application?</h2>
                <p className="text-sm text-gray-600 mb-4">This action cannot be undone. Your application will be permanently withdrawn.</p>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Withdrawal</label>
                  <select
                    value={withdrawalReason}
                    onChange={(e) => setWithdrawalReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select a reason...</option>
                    {withdrawalReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  {!withdrawalReason && (
                    <p className="text-xs text-red-600 mt-1">Please select a reason for withdrawal</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitWithdrawal}
                    disabled={isSubmittingWithdrawal || !withdrawalReason.trim()}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmittingWithdrawal ? 'Withdrawing...' : 'Yes, Withdraw'}
                  </button>
                  <button
                    onClick={() => {
                      setWithdrawalModalOpen(false);
                      setWithdrawalReason('');
                    }}
                    disabled={isSubmittingWithdrawal}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form - Shows when in Edit Mode - Save/Cancel Buttons */}
          {isEditMode && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}

         
          {/* Pending Withdrawal Request Card */}
          {application.pendingWithdrawalRequest && (
            <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200 animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-orange-100 flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-orange-900 mb-2">Withdrawal Request Pending</h3>
                  <p className="text-sm text-orange-800 mb-4">
                    <strong>Reason:</strong> {safeDisplay(application.withdrawalReason)}
                  </p>
                  
                  {userRole === 'loan_officer' || userRole === 'manager' ? (
                    <div className="mt-4 pt-4 border-t border-orange-300">
                      <p className="text-sm font-semibold text-orange-900 mb-3">Loan Officer Action Required:</p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleApproveWithdrawal}
                          disabled={approvingPrincipal}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {approvingPrincipal ? 'Processing...' : 'Approve Withdrawal'}
                        </button>
                        <button
                          onClick={handleDenyWithdrawal}
                          disabled={approvingPrincipal}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {approvingPrincipal ? 'Processing...' : 'Deny Withdrawal'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-orange-700 italic">Awaiting loan officer approval or denial</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Denial Reason Card */}
          {application.status === 'Denied' && application.denialReason && (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200 animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-red-100 flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-900 mb-3">Reason for Denial</h3>
                  
                  {/* Main Denial Reason */}
                  <div className="mb-4 p-4 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-900 leading-relaxed">{safeDisplay(application.denialReason)}</p>
                  </div>

                  {/* Missing Documents if available */}
                  {application.missingDocuments && Object.values(application.missingDocuments).some((v: any) => v) && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-red-900 uppercase mb-2">Missing/Invalid Documents:</p>
                      <div className="space-y-2">
                        {application.missingDocuments.basicInformation && (
                          <div className="flex items-center gap-2 text-sm text-red-800">
                            <span className="w-5 h-5 rounded border border-red-500 flex items-center justify-center text-xs font-bold text-red-600">✕</span>
                            <span>Basic Information</span>
                          </div>
                        )}
                        {application.missingDocuments.sourceOfIncome && (
                          <div className="flex items-center gap-2 text-sm text-red-800">
                            <span className="w-5 h-5 rounded border border-red-500 flex items-center justify-center text-xs font-bold text-red-600">✕</span>
                            <span>Source of Income</span>
                          </div>
                        )}
                        {application.missingDocuments.references && (
                          <div className="flex items-center gap-2 text-sm text-red-800">
                            <span className="w-5 h-5 rounded border border-red-500 flex items-center justify-center text-xs font-bold text-red-600">✕</span>
                            <span>References</span>
                          </div>
                        )}
                        {application.missingDocuments.loanDetails && (
                          <div className="flex items-center gap-2 text-sm text-red-800">
                            <span className="w-5 h-5 rounded border border-red-500 flex items-center justify-center text-xs font-bold text-red-600">✕</span>
                            <span>Loan Details</span>
                          </div>
                        )}
                        {application.missingDocuments.photo2x2 && (
                          <div className="flex items-center gap-2 text-sm text-red-800">
                            <span className="w-5 h-5 rounded border border-red-500 flex items-center justify-center text-xs font-bold text-red-600">✕</span>
                            <span>2x2 Photo</span>
                          </div>
                        )}
                        {application.missingDocuments.supportingDocuments && (
                          <div className="flex items-center gap-2 text-sm text-red-800">
                            <span className="w-5 h-5 rounded border border-red-500 flex items-center justify-center text-xs font-bold text-red-600">✕</span>
                            <span>Supporting Documents</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Details if available */}
                  {application.dismissalDescription && (
                    <div className="p-3 bg-red-100/50 rounded-lg border border-red-300">
                      <p className="text-xs font-semibold text-red-900 mb-1">Additional Notes:</p>
                      <p className="text-xs text-red-800">{application.dismissalDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pending Principal Change Card */}
          {application.pendingPrincipalChange && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-100 flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900 mb-4">Pending Principal Change Request</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase mb-1.5">Current Principal</p>
                      <p className="text-sm font-bold text-amber-900">{formatCurrency(application.appLoanAmount ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase mb-1.5">Requested Principal</p>
                      <p className="text-sm font-bold text-amber-900">{formatCurrency(application.requestedPrincipal ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase mb-1.5">Requested By</p>
                      <p className="text-sm font-semibold text-amber-900">{safeDisplay(application.principalChangeRequestedByName)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase mb-1.5">Requested On</p>
                      <p className="text-sm font-semibold text-amber-900">
                        {application.principalChangeRequestedAt ? formatDate(application.principalChangeRequestedAt) : '—'}
                      </p>
                    </div>
                  </div>
                  {application.status === 'Pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleApprovePrincipalChange}
                        disabled={approvingPrincipal}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {approvingPrincipal ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={handleRejectPrincipalChange}
                        disabled={approvingPrincipal}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {approvingPrincipal ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  )}
                  {application.status !== 'Pending' && (
                    <p className="text-xs text-amber-700 italic">⏳ You can approve this request once the application is in Pending status</p>
                  )}
                  {application.status === 'Pending' && (
                    <p className="text-xs text-amber-700 mt-4 italic">⏳ Awaiting your approval</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section: Loan Information */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="bg-red-600 px-8 py-3">
              <h3 className="text-base font-bold text-white">Loan Information</h3>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Loan Type</p>
                  {isEditMode ? (
                    <select
                      value={editFormData.loanType || ''}
                      onChange={(e) => handleEditFieldChange('loanType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="">Select loan type</option>
                      <option value="Regular Loan">Regular Loan</option>
                      <option value="Open-Term Loan">Open-Term Loan</option>
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.loanType || application.loanType)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Loan Amount</p>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editFormData.appLoanAmount || ''}
                      onChange={(e) => handleEditFieldChange('appLoanAmount', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(editFormData?.appLoanAmount ?? application.appLoanAmount ?? 0)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Loan Term</p>
                  <p className="text-sm font-semibold text-gray-900">{(editFormData?.appLoanTerms || application.appLoanTerms) ? `${editFormData?.appLoanTerms || application.appLoanTerms} months` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Interest Rate</p>
                  <p className="text-sm font-semibold text-gray-900">{(editFormData?.appInterestRate || application.appInterestRate) ? `${editFormData?.appInterestRate || application.appInterestRate}%` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Total Payable</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(editFormData?.appTotalPayable ?? application.appTotalPayable ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Monthly Payment</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {(editFormData?.appTotalPayable || application.appTotalPayable) && (editFormData?.appLoanTerms || application.appLoanTerms)
                      ? formatCurrency(calculateMonthlyDue(editFormData?.appTotalPayable || application.appTotalPayable, editFormData?.appLoanTerms || application.appLoanTerms))
                      : '—'}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Loan Purpose</p>
                  {isEditMode ? (
                    <textarea
                      value={editFormData.appLoanPurpose || ''}
                      onChange={(e) => handleEditFieldChange('appLoanPurpose', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appLoanPurpose || application.appLoanPurpose)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Section: Personal Information */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="bg-red-600 px-8 py-3">
            <h3 className="text-base font-bold text-white">Personal Information</h3>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Full Name</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.appName || ''}
                    onChange={(e) => handleEditFieldChange('appName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appName || application.appName)}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Date of Birth</p>
                {isEditMode ? (
                  <input
                    type="date"
                    value={editFormData.appDob ? editFormData.appDob.split('T')[0] : ''}
                    onChange={(e) => handleEditFieldChange('appDob', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{(editFormData?.appDob || application.appDob) ? new Date(editFormData?.appDob || application.appDob).toLocaleDateString() : '—'}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Contact Number</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.appContact || ''}
                    onChange={(e) => handleEditFieldChange('appContact', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appContact || application.appContact)}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Email Address</p>
                {isEditMode ? (
                  <input
                    type="email"
                    value={editFormData.appEmail || ''}
                    onChange={(e) => handleEditFieldChange('appEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appEmail || application.appEmail)}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Marital Status</p>
                {isEditMode ? (
                  <select
                    value={editFormData.appMarital || ''}
                    onChange={(e) => handleEditFieldChange('appMarital', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appMarital || application.appMarital)}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Number of Children</p>
                {isEditMode ? (
                  <input
                    type="number"
                    value={editFormData.appChildren || ''}
                    onChange={(e) => handleEditFieldChange('appChildren', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{editFormData?.appChildren ?? application.appChildren ?? '—'}</p>
                )}
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Address</p>
                {isEditMode ? (
                  <textarea
                    value={editFormData.appAddress || ''}
                    onChange={(e) => handleEditFieldChange('appAddress', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appAddress || application.appAddress)}</p>
                )}
              </div>
              {(editFormData?.appSpouseName || application.appSpouseName) && (
                <>
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Spouse Name</p>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editFormData.appSpouseName || ''}
                        onChange={(e) => handleEditFieldChange('appSpouseName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appSpouseName || application.appSpouseName)}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Spouse Occupation</p>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editFormData.appSpouseOccupation || ''}
                        onChange={(e) => handleEditFieldChange('appSpouseOccupation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appSpouseOccupation || application.appSpouseOccupation)}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section: Employment Information */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="bg-red-600 px-8 py-3">
            <h3 className="text-base font-bold text-white">Employment Information</h3>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Source of Income</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.sourceOfIncome || ''}
                    onChange={(e) => handleEditFieldChange('sourceOfIncome', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.sourceOfIncome || application.sourceOfIncome)}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Occupation</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.appOccupation || ''}
                    onChange={(e) => handleEditFieldChange('appOccupation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appOccupation || application.appOccupation)}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Employment Status</p>
                {isEditMode ? (
                  <select
                    value={editFormData.appEmploymentStatus || ''}
                    onChange={(e) => handleEditFieldChange('appEmploymentStatus', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Select</option>
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appEmploymentStatus || application.appEmploymentStatus)}</p>
                )}
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Company Name</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.appCompanyName || ''}
                    onChange={(e) => handleEditFieldChange('appCompanyName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appCompanyName || application.appCompanyName)}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Monthly Income</p>
                {isEditMode ? (
                  <input
                    type="number"
                    value={editFormData.appMonthlyIncome || ''}
                    onChange={(e) => handleEditFieldChange('appMonthlyIncome', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(editFormData?.appMonthlyIncome ?? application.appMonthlyIncome ?? 0)}</p>
                )}
              </div>
              {(editFormData?.appTypeBusiness || application.appTypeBusiness) && (
                <>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Business Type</p>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editFormData.appTypeBusiness || ''}
                        onChange={(e) => handleEditFieldChange('appTypeBusiness', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appTypeBusiness || application.appTypeBusiness)}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Business Name</p>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editFormData.appBusinessName || ''}
                        onChange={(e) => handleEditFieldChange('appBusinessName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appBusinessName || application.appBusinessName)}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Business Location</p>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editFormData.appBusinessLoc || ''}
                        onChange={(e) => handleEditFieldChange('appBusinessLoc', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.appBusinessLoc || application.appBusinessLoc)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Date Started</p>
                    {isEditMode ? (
                      <input
                        type="date"
                        value={editFormData.appDateStarted ? editFormData.appDateStarted.split('T')[0] : ''}
                        onChange={(e) => handleEditFieldChange('appDateStarted', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{(editFormData?.appDateStarted || application.appDateStarted) ? new Date(editFormData?.appDateStarted || application.appDateStarted).toLocaleDateString() : '—'}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section: Collateral Information */}
        {(editFormData?.collateralType || application.collateralType) && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="bg-red-600 px-8 py-3">
              <h3 className="text-base font-bold text-white">Collateral Information</h3>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Collateral Type</p>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editFormData.collateralType || ''}
                      onChange={(e) => handleEditFieldChange('collateralType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.collateralType || application.collateralType)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Collateral Value</p>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editFormData.collateralValue || ''}
                      onChange={(e) => handleEditFieldChange('collateralValue', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(editFormData?.collateralValue ?? application.collateralValue ?? 0)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Ownership Status</p>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editFormData.ownershipStatus || ''}
                      onChange={(e) => handleEditFieldChange('ownershipStatus', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.ownershipStatus || application.ownershipStatus)}</p>
                  )}
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Description</p>
                  {isEditMode ? (
                    <textarea
                      value={editFormData.collateralDescription || ''}
                      onChange={(e) => handleEditFieldChange('collateralDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{safeDisplay(editFormData?.collateralDescription || application.collateralDescription)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: References */}
        {editFormData && isEditMode && editFormData.appReferences && editFormData.appReferences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <div className="bg-red-600 px-8 py-3 flex items-center gap-3">
              <h3 className="text-base font-bold text-white">References (Edit Mode)</h3>
            </div>
            <div className="p-6 md:p-8">
              <div className="space-y-4">
                {editFormData.appReferences.map((ref: any, index: number) => (
                  <div key={index} className="p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-300">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4">Reference {index + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-gray-700 font-semibold mb-2 block">NAME</label>
                        <input
                          type="text"
                          value={ref.name || ''}
                          onChange={(e) => handleEditReferenceChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-600 transition-all"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-700 font-semibold mb-2 block">CONTACT</label>
                        <input
                          type="text"
                          value={ref.contact || ''}
                          onChange={(e) => handleEditReferenceChange(index, 'contact', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-600 transition-all"
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-700 font-semibold mb-2 block">RELATION</label>
                        <input
                          type="text"
                          value={ref.relation || ''}
                          onChange={(e) => handleEditReferenceChange(index, 'relation', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-600 transition-all"
                          placeholder="Relationship"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(!isEditMode || !editFormData) && application.appReferences && application.appReferences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <div className="bg-red-600 px-8 py-3 flex items-center gap-3">
              <h3 className="text-base font-bold text-white">References</h3>
            </div>
            <div className="p-6 md:p-8">
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

      {/* Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Success</h2>
            <p className="text-center text-gray-600 mb-6">{successMessage}</p>
            <button
              onClick={() => setSuccessModalOpen(false)}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

