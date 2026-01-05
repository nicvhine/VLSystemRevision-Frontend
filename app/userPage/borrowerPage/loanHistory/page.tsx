'use client';

import React, { useEffect, useState } from 'react';
import { Loan } from '@/app/commonComponents/utils/Types/loan';
import { LoadingSpinner } from '@/app/commonComponents/utils/loading';
import { formatDate, formatCurrency } from '@/app/commonComponents/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '@/app/commonComponents/utils/pagination';
import translations from '@/app/commonComponents/translation';
import BorrowerClient from '../borrowerClient';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function LoanHistoryPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [loanDetailsMap, setLoanDetailsMap] = useState<Record<string, any>>({});
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [lastDetailsAttemptId, setLastDetailsAttemptId] = useState<string | null>(null);
  const [currentLoansPage, setCurrentLoansPage] = useState<number>(1);
  const [loansPageSize, setLoansPageSize] = useState<number>(10);
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');

  const borrowersId =
    typeof window !== 'undefined' ? localStorage.getItem('borrowersId') : null;

  const t = translations.borrowerPageTranslation[language];

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as 'en' | 'ceb';
    if (storedLanguage) setLanguage(storedLanguage);

    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail?.language) {
        setLanguage(event.detail.language as 'en' | 'ceb');
      }
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  useEffect(() => {
    if (!borrowersId) return;

    const fetchLoans = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/loans/all/${borrowersId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch loans');
        const data: Loan[] = await res.json();
        setLoans(
          data.sort(
            (a, b) =>
              new Date(b.dateDisbursed ?? 0).getTime() -
              new Date(a.dateDisbursed ?? 0).getTime()
          )
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading loans');
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [borrowersId]);

  const totalLoanAmount = loans.reduce(
    (sum, loan) => sum + Number(loan.appLoanAmount ?? 0),
    0
  );

  // helper to fetch loan details with payments
  const fetchLoanDetails = async (loanId: string) => {
    if (!loanId) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setError(t.t20);
      return;
    }

    setLoadingDetailsId(loanId);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/loans/details/${loanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = `Failed to load loan details (${res.status})`;
        setError(msg);
        setLoadingDetailsId(null);
        return;
      }

      const data = await res.json();

      // Fetch collections and payments together
      try {
        const colRes = await fetch(`${BASE_URL}/collections/schedule/${borrowersId}/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payRes = await fetch(`${BASE_URL}/payments/ledger/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let collections = [];
        let payments = [];

        if (colRes.ok) {
          const colData = await colRes.json();
          collections = Array.isArray(colData) ? colData : [];
        }

        if (payRes.ok) {
          const payData = await payRes.json();
          payments = Array.isArray(payData.payments) ? payData.payments : [];
        }

        // Filter to show only Paid and Partial collections with their payment info
        const paidCollections = collections.filter((c: any) => c.status === 'Paid' || c.status === 'Partial');
        
        // Map payment mode to each paid collection
        data.payments = paidCollections.map((col: any) => {
          // Find the payment(s) for this collection
          const collectionPayments = payments.filter((p: any) => p.paidToCollection === col.collectionNumber || p.referenceNumber?.includes(col.referenceNumber));
          const paymentMode = collectionPayments.length > 0 ? collectionPayments[0].mode : 'Unknown';
          
          return {
            ...col,
            paymentMode
          };
        });
      } catch (err) {
        console.warn('Error fetching collections and payments:', err);
        data.payments = [];
      }

      setLoanDetailsMap((p) => ({ ...p, [loanId]: data }));
      setExpandedLoanId(loanId);
    } catch (err) {
      console.error('Error fetching loan details:', err);
      setError(t.t21);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  return (
    <BorrowerClient>
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-screen-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800">{t.t1}</h1>
          </div>

          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">{t.t2}</p>
              <p className="mt-2 text-2xl font-bold text-gray-800">{loans.length}</p>
            </div>

            <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{t.t3}</p>
                <p className="mt-2 text-2xl font-bold text-green-700">
                  {formatCurrency(totalLoanAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Loan List */}
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex items-start gap-4">
              <p className="text-red-600">{error}</p>
              {lastDetailsAttemptId && (
                <button
                  onClick={() => fetchLoanDetails(lastDetailsAttemptId)}
                  className="ml-2 inline-flex items-center px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  {t.t17}
                </button>
              )}
            </div>
          ) : loans.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-600">{t.t4}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans
                .slice((currentLoansPage - 1) * loansPageSize, currentLoansPage * loansPageSize)
                .map((loan) => {
                  const isExpanded = expandedLoanId === loan.loanId;
                  const det = loanDetailsMap[loan.loanId] || {};
                  const payments = det.payments || [];

                  return (
                    <div
                      key={loan.loanId}
                      className={`rounded-2xl shadow-sm border overflow-hidden ${
                        loan.status === 'Active'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <div
                        className={`p-5 flex items-start justify-between cursor-pointer ${
                          isExpanded ? 'bg-gray-50/50' : ''
                        }`}
                        onClick={async () => {
                          if (isExpanded) {
                            setExpandedLoanId(null);
                            return;
                          }
                          if (loanDetailsMap[loan.loanId]) {
                            setExpandedLoanId(loan.loanId);
                            return;
                          }
                          setLastDetailsAttemptId(loan.loanId);
                          await fetchLoanDetails(loan.loanId);
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-700">{loan.loanId}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {loan.dateDisbursed ? formatDate(loan.dateDisbursed) : '-'}
                          </p>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key={`${loan.loanId}-details`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="border-t border-gray-100 bg-gray-50 overflow-hidden"
                          >
                            <div className="p-5 text-sm text-gray-700">
                              {loadingDetailsId === loan.loanId ? (
                                <div className="flex items-center justify-center py-4">
                                  <LoadingSpinner />
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Summary */}
                                  <div className={`grid gap-4 ${(det.loanType || loan.loanType)?.toLowerCase().includes('open') ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-4'}`}>
                                    <div>
                                      <p className="text-xs text-gray-500">{t.t5}</p>
                                      <p className="font-medium text-gray-800">
                                        {det.loanType || loan.loanType || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">{t.t6}</p>
                                      <p className="font-medium text-gray-800">
                                        {formatCurrency(
                                          det.appTotalPayable ?? loan.appTotalPayable ?? loan.appLoanAmount ?? 0
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Interest</p>
                                      <p className="font-medium text-gray-800">
                                        {det.appInterestRate ?? loan.appInterestRate ?? 0}%
                                      </p>
                                    </div>
                                    {/* COMPLETELY HIDE Terms if Open-Term */}
                                    {!(det.loanType || loan.loanType)?.toLowerCase().includes('open') && (
                                      <div>
                                        <p className="text-xs text-gray-500">Terms</p>
                                        <p className="font-medium text-gray-800">
                                          {det.appLoanTerms ?? (loan as any).appLoanTerms ?? '-'} months
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Payment Table */}
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                      Paid Collections
                                    </p>
                                    {payments.length === 0 ? (
                                      <p className="text-gray-500">No collections paid yet</p>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                          <thead className="bg-white text-gray-700">
                                            <tr>
                                              <th className="p-2 text-left">Collection Ref</th>
                                              <th className="p-2 text-left">Due Date</th>
                                              <th className="p-2 text-left">Amount</th>
                                              <th className="p-2 text-left">Paid Amount</th>
                                              <th className="p-2 text-left">Payment Mode</th>
                                              <th className="p-2 text-left">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {payments.map((p: any, idx: number) => (
                                              <tr key={p._id || idx} className="border-t border-gray-100">
                                                <td className="p-2 font-mono text-xs">{p.referenceNumber}</td>
                                                <td className="p-2">{formatDate(p.dueDate)}</td>
                                                <td className="p-2">{formatCurrency(p.periodAmount ?? 0)}</td>
                                                <td className="p-2 font-medium">{formatCurrency(p.paidAmount ?? 0)}</td>
                                                <td className="p-2">
                                                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {p.paymentMode || 'Unknown'}
                                                  </span>
                                                </td>
                                                <td className="p-2">
                                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    p.status === 'Paid' 
                                                      ? 'bg-green-100 text-green-800'
                                                      : 'bg-yellow-100 text-yellow-800'
                                                  }`}>
                                                    {p.status}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

              <div className="mt-4">
                <Pagination
                  totalCount={loans.length}
                  currentPage={currentLoansPage}
                  totalPages={Math.max(1, Math.ceil(loans.length / loansPageSize))}
                  pageSize={loansPageSize}
                  setCurrentPage={(p) => {
                    setCurrentLoansPage(p);
                    setExpandedLoanId(null);
                  }}
                  setPageSize={(size) => {
                    setLoansPageSize(size);
                    setCurrentLoansPage(1);
                    setExpandedLoanId(null);
                  }}
                  language={language}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </BorrowerClient>
  );
}
