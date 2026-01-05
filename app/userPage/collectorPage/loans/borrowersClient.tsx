'use client';

import { useEffect, useState } from 'react';
import { useLoanList } from './hook';
import Filter from '@/app/commonComponents/utils/sortAndSearch';
import translations from '@/app/commonComponents/translation';
import { formatCurrency } from '@/app/commonComponents/utils/formatters';
import { Fragment } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function BorrowerClient() {
  const { loans, loading, error, role } = useLoanList();
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Record<string, any[]>>({});
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [currentPage, setCurrentPage] = useState(1);

  const t = translations.borrowerTranslation[language];
  const loanT = translations.loanTermsTranslator[language];

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const keyMap: Record<string, string> = {
      head: "headLanguage",
      "loan officer": "loanOfficerLanguage",
      manager: "managerLanguage",
      collector: "language",
    };
    const langKey = storedRole ? keyMap[storedRole] : null;
    const storedLang = langKey ? localStorage.getItem(langKey) as "en" | "ceb" | null : null;
    const universalLang = localStorage.getItem("language") as "en" | "ceb" | null;
    if (storedLang) {
      setLanguage(storedLang);
    } else if (universalLang) {
      setLanguage(universalLang);
    }

    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail?.language) {
        const targetUserType = event.detail?.userType;
        if (
          !targetUserType ||
          (role === "head" && targetUserType === "head") ||
          (role === "loan officer" && targetUserType === "loanOfficer") ||
          (role === "manager" && targetUserType === "manager") ||
          (role === "collector")
        ) {
          setLanguage(event.detail.language as "en" | "ceb");
        }
      }
    };

    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener);
  }, [role]);

  const filteredLoans = loans
    .filter((loan) => loan.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortBy === 'name' ? a.name.localeCompare(b.name) : a.status.localeCompare(b.status)
    );

  const itemsPerPage = 10;
  const paginatedBorrowers = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = async (loanId: string) => {
    if (expandedLoanId === loanId) {
      setExpandedLoanId(null); // collapse if already expanded
      return;
    }

    setExpandedLoanId(loanId);

    // Fetch payment history only if not already fetched
    if (!paymentHistory[loanId]) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/payments/ledger/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch payment history');
        const data = await res.json();

        // Store only the payments array
        setPaymentHistory((prev) => ({ ...prev, [loanId]: data.payments || [] }));
      } catch (err: any) {
        console.error(err);
        setPaymentHistory((prev) => ({ ...prev, [loanId]: [] }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">{loanT.Loans}</h1>

          <Filter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={(val: string) => setSortBy(val as 'name' | 'status')}
            sortOptions={[
              { value: 'name', label: t.s1 },
              { value: 'status', label: t.s2 },
            ]}
            t={loanT}
          />

          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
            {loading ? (
              <p className="p-4 text-center">{t.m1}</p>
            ) : error ? (
              <p className="p-4 text-center text-red-600">{error}</p>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr>
                  {role === 'collector' 
                    ? [loanT.l11, 'Borrower', loanT.l54, loanT.l14, 'Unpaid Collections'].map((heading) => (
                        <th
                          key={heading}
                          className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {heading}
                        </th>
                      ))
                    : [loanT.l11, loanT.l12, loanT.l54, loanT.l14].map((heading) => (
                        <th
                          key={heading}
                          className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {heading}
                        </th>
                      ))
                  }
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedBorrowers.length > 0 ? (
                    paginatedBorrowers.map((l) => (
                      <Fragment key={l.loanId}>
                        <tr
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleRowClick(l.loanId)}
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">{l.loanId}</td>
                          {role === 'collector' ? (
                            <>
                              <td className="px-6 py-4 text-sm text-gray-900">{l.borrowerName || 'Unknown'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(l.appLoanAmount)}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(l.balance)}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                                  {l.unpaidCollections || 0}
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 text-sm text-gray-900">{l.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(l.appLoanAmount)}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(l.balance)}</td>
                            </>
                          )}
                        </tr>

                        {expandedLoanId === l.loanId && (
                          <tr>
                            <td colSpan={4} className="bg-gray-50 px-6 py-4">
                              <div className="space-y-6">
                                {/* Collections Section */}
                                {l.collections && l.collections.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-3">
                                      {loanT.l53 || 'Collections'} ({l.totalCollections || 0})
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full text-sm">
                                        <thead>
                                          <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">Reference</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">Amount</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">Due Date</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">Paid Amount</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {l.collections.map((c: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-100">
                                              <td className="px-4 py-2 text-gray-900">{c.referenceNumber}</td>
                                              <td className="px-4 py-2 text-gray-900">{formatCurrency(c.periodAmount)}</td>
                                              <td className="px-4 py-2 text-gray-900">
                                                {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '-'}
                                              </td>
                                              <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                  c.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                  c.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-red-100 text-red-800'
                                                }`}>
                                                  {c.status}
                                                </span>
                                              </td>
                                              <td className="px-4 py-2 text-gray-900">{formatCurrency(c.paidAmount)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Payment History Section */}
                                {paymentHistory[l.loanId]?.length ? (
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-3">{loanT.l48 || 'Payment History'}</h4>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full text-sm">
                                        <thead>
                                          <tr className="bg-gray-100">
                                            {[loanT.l49, loanT.l50, loanT.l51].map((heading) => (
                                              <th
                                                key={heading}
                                                className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider"
                                              >
                                                {heading}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {paymentHistory[l.loanId].map((p, idx) => (
                                            <tr key={idx} className="hover:bg-gray-100">
                                              <td className="px-4 py-2 text-gray-900">
                                                {p.datePaid ? new Date(p.datePaid).toLocaleDateString() : '-'}
                                              </td>
                                              <td className="px-4 py-2 text-gray-900">
                                                {formatCurrency(p.amount)}
                                              </td>
                                              <td className="px-4 py-2 text-gray-900">{p.mode || '-'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">{loanT.l52}</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-6 text-sm">
                        {role === 'collector' ? t.m4 : t.m2}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
