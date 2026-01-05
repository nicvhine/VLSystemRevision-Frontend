"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Calendar, CheckCircle, AlertCircle, Clock, ChevronDown, HelpCircle } from "lucide-react";
import CustomAmountModal from "@/app/commonComponents/modals/payModal";
import { formatDate, formatCurrency } from "@/app/commonComponents/utils/formatters";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
  </div>
);

export default function UpcomingBillsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loanId = searchParams.get("loanId");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loan, setLoan] = useState<any | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pendingRestructuring, setPendingRestructuring] = useState<any | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Calculate summary stats
  const totalAmount = collections.reduce((sum, c) => sum + Number(c.periodAmount ?? 0), 0);
  const totalPaid = collections.reduce((sum, c) => sum + Number(c.paidAmount ?? 0), 0);
  const totalRemaining = totalAmount - totalPaid;
  const paymentProgress = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
  
  const unpaidCollections = collections.filter(c => c.status !== 'Paid');
  const nextDue = unpaidCollections.length > 0 
    ? unpaidCollections.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
    : null;
  
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  useEffect(() => {
    if (!loanId) return;

    const fetchLoan = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        const res = await fetch(`${BASE_URL}/collections/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d?.error || "Failed to load loan");
        }

        const data = await res.json();
        setLoan(data);
        setCollections(Array.isArray(data.collections) ? data.collections : []);

        // Check for pending restructuring application
        const borrowersId = localStorage.getItem("borrowersId");
        if (borrowersId) {
          const borrowerRes = await fetch(`${BASE_URL}/borrowers/${borrowersId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (borrowerRes.ok) {
            const borrowerData = await borrowerRes.json();
            if (borrowerData.allApplications && Array.isArray(borrowerData.allApplications)) {
              const pending = borrowerData.allApplications.find((app: any) => 
                ['Applied', 'Pending', 'Cleared', 'Approved', 'Disbursed'].includes(app.status)
              );
              if (pending) {
                setPendingRestructuring(pending);
              }
            }
          }
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load upcoming bills");
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [loanId]);

  // Refresh collections when modal closes
  const handleModalClose = () => {
    setShowPayModal(false);
    setSelectedCollection(null);
    // Refresh collections after a short delay to ensure payment is processed
    setTimeout(() => {
      if (loanId) {
        fetch(`${BASE_URL}/collections/${loanId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data.collections)) {
              setCollections(data.collections);
            }
          })
          .catch(err => console.error('Failed to refresh collections:', err));
      }
    }, 500);
  };

  if (!loanId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-xl w-full p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Loan ID required</h2>
          <p className="text-sm text-gray-600 mb-4">
            Pass a <code>?loanId=</code> query parameter
          </p>
          <button
            onClick={() => router.push("/userPage/borrowerPage/dashboard")}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/20 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header with Navigation */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <button
            onClick={() => router.push("/userPage/borrowerPage/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 mb-6"
          >
            <ChevronLeft size={18} />
            Back to Dashboard
          </button>
          
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Schedule</h1>
            <p className="text-gray-600">Manage and track your loan installments</p>
          </div>

          {/* Pending Restructuring Banner */}
          {pendingRestructuring && (
            <div className="mb-6 p-5 bg-white border-2 border-gray-200 rounded-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Restructuring Application Pending</p>
                  <p className="text-sm text-gray-600 mb-3">You have a restructuring application ({pendingRestructuring.applicationId}) currently under review. Status: <span className="font-semibold">{pendingRestructuring.status}</span></p>
                </div>
              </div>
              
              {/* Payment Info During Restructuring */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">💡 How Payments Work During Restructuring:</p>
                <ul className="text-sm text-gray-700 space-y-2 ml-4">
                  <li>✓ <span className="font-medium">Continue paying</span> your current loan installments normally</li>
                  <li>✓ <span className="font-medium">All payments</span> will be recorded and applied to your account</li>
                  <li>✓ <span className="font-medium">If approved:</span> Your remaining balance will carry forward based on your selected option</li>
                </ul>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {!loading && !error && collections.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <p className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wider">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₱{totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <p className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wider">Amount Paid</p>
                  <p className="text-2xl font-bold text-gray-900">₱{totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <p className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wider">Remaining</p>
                  <p className="text-2xl font-bold text-red-600">₱{totalRemaining.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Payment Progress</p>
                  <span className="text-sm font-bold text-red-600">{paymentProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="font-semibold">Unable to load bills</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Content */} 
        {!loading && !error && (
          <>

            {/* Collections List */}
            {collections.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-900 mb-2">All Payments Completed!</p>
                <p className="text-gray-600 mb-6">You have no pending collections at this time.</p>
                <button
                  onClick={() => router.push("/userPage/borrowerPage/dashboard")}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  View All Bills
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {/* Pending Collections */}
                {unpaidCollections.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Pending Payments ({unpaidCollections.length})
                    </h2>
                    <div className="space-y-2">
                      {unpaidCollections.map((c, idx) => {
                        const isPartial = c.status === "Partial";
                        // Show the remaining balance, not the original amount
                        const amount = Number(c.periodBalance ?? c.periodAmount - (c.paidAmount ?? 0) );
                        const daysUntilDue = getDaysUntilDue(c.dueDate);
                        const isOverdue = daysUntilDue < 0;
                        const isPriority = idx === 0; // First unpaid is priority
                        
                        return (
                          <div
                            key={c.referenceNumber || c.collectionNumber}
                            onClick={() => {
                              if (isPriority) {
                                setSelectedCollection(c);
                                setShowPayModal(true);
                              }
                            }}
                            className={`group rounded-xl transition-all duration-300 ${
                              isPriority
                                ? 'cursor-pointer bg-gradient-to-br from-red-50 to-red-50/50 border-2 border-red-300 hover:shadow-xl hover:border-red-500 hover:scale-[1.01] p-5 ring-1 ring-red-200/50'
                                : 'cursor-not-allowed bg-gray-50 border-2 border-gray-200 opacity-45 p-5'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              {/* Left: Installment Info */}
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${ 
                                  isPriority
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  {c.collectionNumber}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className={`font-bold text-base ${isPriority ? 'text-gray-900' : 'text-gray-500'}`}>
                                      Installment {c.collectionNumber}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div className={`${isPriority ? 'text-gray-700' : 'text-gray-400'}`}>
                                      <span className="font-semibold">Due Date:</span> <span className="font-medium">{formatDate(c.dueDate)}</span>
                                    </div>
                                    {isPartial && (
                                      <div className={`${isPriority ? 'text-gray-700' : 'text-gray-400'}`}>
                                        <span className="font-semibold">Paid:</span> <span className="font-medium">₱{Number(c.paidAmount ?? 0).toLocaleString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Center: Amount */}
                              <div className="text-center flex-shrink-0">
                                <p className="text-xs text-gray-600 font-semibold mb-1">AMOUNT DUE</p>
                                <p className={`text-2xl font-bold ${isPriority ? 'text-red-600' : 'text-gray-400'}`}>
                                  ₱{amount.toLocaleString()}
                                </p>
                              </div>

                              {/* Right: Status Badge */}
                              <div className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap text-center min-w-fit flex-shrink-0 ${
                                isPriority
                                  ? isOverdue
                                    ? 'bg-red-600 text-white'
                                    : daysUntilDue <= 3
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-green-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {isOverdue ? `${Math.abs(daysUntilDue)}d OVERDUE` : daysUntilDue === 0 ? 'TODAY' : `${daysUntilDue}d LEFT`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Paid Collections */}
                {collections.filter(c => c.status === 'Paid').length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 mt-6">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Completed ({collections.filter(c => c.status === 'Paid').length})
                    </h2>
                    <div className="space-y-2">
                      {collections.filter(c => c.status === 'Paid').map((c) => {
                        const amount = Number(c.periodAmount ?? 0);
                        return (
                          <div
                            key={c.referenceNumber || c.collectionNumber}
                            className="rounded-xl p-5 border-2 border-green-200 bg-green-50/50 transition-all hover:shadow-md hover:border-green-300"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <p className="font-bold text-gray-900 text-base mb-2">Installment {c.collectionNumber}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                                    <div><span className="font-semibold">Due Date:</span> <span className="font-medium">{formatDate(c.dueDate)}</span></div>
                                    {c.datePaid && <div><span className="font-semibold">Paid On:</span> <span className="font-medium text-green-700">{formatDate(c.datePaid)}</span></div>}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <div className="flex flex-col items-end gap-2">
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold mb-0.5">AMOUNT</p>
                                    <p className="font-bold text-green-700 text-lg">₱{amount.toLocaleString()}</p>
                                  </div>
                                  {c.amountPaid && c.amountPaid !== amount && (
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500 font-semibold">PAID</p>
                                      <p className="text-xs font-bold text-green-600">₱{Number(c.amountPaid).toLocaleString()}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedCollection && loan && (
        <CustomAmountModal
          collection={selectedCollection}
          activeLoan={loan}
          setErrorMsg={setErrorMsg}
          setShowErrorModal={setShowErrorModal}
          onClose={handleModalClose}
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[99999] bg-black/30 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 animate-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Error</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">{errorMsg}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
