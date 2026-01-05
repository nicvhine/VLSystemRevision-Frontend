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

const StatCard = ({ label, value, valueColor = "text-gray-900", icon: Icon }: { label: string; value: string; valueColor?: string; icon?: any }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between gap-3 mb-2">
      <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest">{label}</p>
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
    </div>
    <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
  </div>
);

type InstallmentCardProps = {
  collection: any;
  isPriority?: boolean;
  onClick?: () => void;
  daysUntilDue?: number;
  isPartial?: boolean;
};

const InstallmentCard = ({ collection, isPriority = false, onClick, daysUntilDue = 0, isPartial = false }: InstallmentCardProps) => {
  const amount = isPriority ? Number(collection.periodBalance ?? collection.periodAmount - (collection.paidAmount ?? 0)) : Number(collection.periodAmount ?? 0);
  const isOverdue = daysUntilDue < 0;

  if (collection.status === 'Paid') {
    return (
      <div className="rounded-xl p-4 border border-gray-300 bg-gray-100 opacity-60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="font-semibold text-gray-700 text-sm mb-3">Installment {collection.collectionNumber}</p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Due: {formatDate(collection.dueDate)}
                </div>
                {collection.paidAt && (
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Paid: {formatDate(collection.paidAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-gray-700 text-sm">₱{Number(collection.periodAmount ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group rounded-2xl transition-all duration-300 ${
        isPriority
          ? 'cursor-pointer bg-gradient-to-br from-red-50/80 to-orange-50/40 border-2 border-red-300 hover:shadow-xl hover:border-red-400 hover:scale-[1.01] p-5 ring-1 ring-red-200/50'
          : 'cursor-not-allowed bg-gray-50 border-2 border-gray-200 opacity-40 p-5'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-sm ${ 
            isPriority
              ? 'bg-gradient-to-br from-red-600 to-red-700 text-white'
              : 'bg-gray-300 text-gray-600'
          }`}>
            {collection.collectionNumber}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className={`font-bold text-base mb-3 ${isPriority ? 'text-gray-900' : 'text-gray-500'}`}>
              Installment {collection.collectionNumber}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className={`flex items-center gap-2 ${isPriority ? 'text-gray-700' : 'text-gray-400'}`}>
                <Calendar className={`w-4 h-4 ${isPriority ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className="font-medium">Due {formatDate(collection.dueDate)}</span>
              </div>
              {isPartial && (
                <div className={`flex items-center gap-2 ${isPriority ? 'text-gray-700' : 'text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Paid ₱{Number(collection.paidAmount ?? 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center flex-shrink-0">
          <p className="text-xs text-gray-600 font-semibold mb-1 uppercase">Amount Due</p>
          <p className={`text-2xl font-bold ${isPriority ? 'text-red-600' : 'text-gray-400'}`}>
            ₱{amount.toLocaleString()}
          </p>
        </div>

        <div className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap text-center min-w-fit flex-shrink-0 shadow-sm ${
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
};

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/10 to-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header with Navigation */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push("/userPage/borrowerPage/dashboard")}
              className="p-2 hover:bg-white rounded-lg transition shadow-sm hover:shadow-md"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-red-600" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Payment Schedule</h1>
              <p className="text-sm text-gray-600 mt-1">Track and manage your loan installments</p>
            </div>
          </div>

          {/* Pending Restructuring Banner */}
          {pendingRestructuring && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-xl animate-in fade-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2.5 bg-blue-100 rounded-full flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg mb-1">Restructuring Application Pending</p>
                  <p className="text-sm text-gray-700 mb-3">Your restructuring request ({pendingRestructuring.applicationId}) is under review. Status: <span className="font-semibold text-blue-600">{pendingRestructuring.status}</span></p>
                </div>
              </div>
              
              {/* Payment Info During Restructuring */}
              <div className="bg-white rounded-lg p-4 border border-blue-200/50">
                <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">💡</span> How Payments Work During Restructuring
                </p>
                <ul className="text-sm text-gray-700 space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><span className="font-medium">Continue paying</span> your current loan installments normally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><span className="font-medium">All payments</span> will be recorded and applied to your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><span className="font-medium">If approved:</span> Your remaining balance will carry forward based on your selected option</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {!loading && !error && collections.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Loan Amount" value={`₱${totalAmount.toLocaleString()}`} icon={Calendar} />
                <StatCard label="Amount Paid" value={`₱${totalPaid.toLocaleString()}`} valueColor="text-green-600" icon={CheckCircle} />
                <StatCard label="Remaining Balance" value={`₱${totalRemaining.toLocaleString()}`} valueColor="text-red-600" icon={AlertCircle} />
              </div>
              
              {/* Progress Bar */}
              <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-900">Payment Progress</p>
                  <span className="text-2xl font-bold text-red-600">{paymentProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-700 shadow-lg"
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
              <div className="text-center py-12 px-6 bg-gray-50 rounded-xl border border-gray-200">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900 mb-2">All Payments Completed</p>
                <p className="text-sm text-gray-600 mb-6">No pending collections at this time.</p>
                <button
                  onClick={() => router.push("/userPage/borrowerPage/dashboard")}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                >
                  View Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {/* Pending Collections */}
                {unpaidCollections.length > 0 && (
                  <div>
                    <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Pending ({unpaidCollections.length})
                    </h2>
                    <div className="space-y-2">
                      {unpaidCollections.map((c, idx) => {
                        const daysUntilDue = getDaysUntilDue(c.dueDate);
                        const isPriority = idx === 0;
                        const isPartial = c.status === "Partial";
                        
                        return (
                          <InstallmentCard
                            key={c.referenceNumber || c.collectionNumber}
                            collection={c}
                            isPriority={isPriority}
                            onClick={() => {
                              if (isPriority) {
                                setSelectedCollection(c);
                                setShowPayModal(true);
                              }
                            }}
                            daysUntilDue={daysUntilDue}
                            isPartial={isPartial}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Paid Collections */}
                {collections.filter(c => c.status === 'Paid').length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      Completed ({collections.filter(c => c.status === 'Paid').length})
                    </h2>
                    <div className="space-y-2">
                      {collections.filter(c => c.status === 'Paid').map((c) => (
                        <InstallmentCard
                          key={c.referenceNumber || c.collectionNumber}
                          collection={c}
                        />
                      ))}
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
