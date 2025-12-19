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

      // Fetch payments (instead of collections)
      try {
        const payRes = await fetch(`${BASE_URL}/payments/ledger/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (payRes.ok) {
          const payData = await payRes.json();
          // Expect backend returns { success: true, payments: [...] }
          data.payments = Array.isArray(payData.payments) ? payData.payments : [];
        } else {
          console.warn('Could not fetch payments');
          data.payments = [];
        }
      } catch (err) {
        console.warn('Error fetching payments:', err);
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
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <div
                        className={`p-5 flex items-start justify-between cursor-pointer ${
                          isExpanded ? 'bg-gray-50' : ''
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

                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              loan.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : loan.status === 'Closed' 
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-blue-50 text-blue-700'
                            } border`}
                          >
                            {loan.status}
                          </span>
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
                                      Payment History
                                    </p>
                                    {payments.length === 0 ? (
                                      <p className="text-gray-500">{t.t12}</p>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                          <thead className="bg-white text-gray-700">
                                            <tr>
                                              <th className="p-2 text-left">Date</th>
                                              <th className="p-2 text-left">Reference Number</th>
                                              <th className="p-2 text-left">{t.t14}</th>
                                              <th className="p-2 text-left">Mode</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {payments.map((p: any, idx: number) => (
                                              <tr key={p._id || idx} className="border-t border-gray-100">
                                                <td className="p-2">{formatDate(p.datePaid)}</td>
                                                <td className="p-2">
                                                  {p.referenceNumber  }
                                                </td>
                                                <td className="p-2">{formatCurrency(p.amount ?? 0)}</td>
                                                <td className="p-2">{p.mode}</td>
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
