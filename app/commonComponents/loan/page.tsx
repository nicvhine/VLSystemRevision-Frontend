'use client';

import { LoadingSpinner } from "@/app/commonComponents/utils/loading";
import Link from "next/link";
import Head from "@/app/userPage/headPage/layout";
import Manager from "@/app/userPage/managerPage/layout";
import LoanOfficer from "@/app/userPage/loanOfficerPage/layout";
import Pagination from "../utils/pagination";
import { useLoansPage } from "./hook";
import { formatCurrency, formatDate } from "../utils/formatters";
import Filter from "../utils/sortAndSearch";
import translations from "../translation";

export default function LoansPage() {
  const {
    paginatedLoans,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalCount,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loading,
    role,
    language,
    activeFilter,
    setActiveFilter,
    delinquentSummary,
  } = useLoansPage();

  if (loading) return <LoadingSpinner />;

  const t = translations.loanTermsTranslator[language];

  // Choose which wrapper to render based on role
  const Wrapper =
    role === "loan officer" ? LoanOfficer : role === "head" ? Head : Manager;

  const filterTabs: {
    key: "All" | "Active"  | "Closed" | "Delinquent";
    label: string;
  }[] = [
    { key: "All", label: t.l23 },
    { key: "Active", label: t.l24 },
    { key: "Delinquent", label: t.l56 },
    { key: "Closed", label: t.l26 },
  ];

  return (
    <Wrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            {t.Loans}
          </h1>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-white p-2 sm:p-3 rounded-lg shadow-sm mb-4 sm:mb-6">
            {filterTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveFilter(key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeFilter === key
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Delinquent Loans Summary */}
          {activeFilter === 'Delinquent' && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8">
                {/* Delinquent Count */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2 uppercase tracking-wide">{t.l58}</p>
                    <p className="text-3xl sm:text-4xl font-bold text-red-600">{delinquentSummary.delinquentCount}</p>
                  </div>
                </div>

                {/* Total Active Count */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2 uppercase tracking-wide">{t.l59}</p>
                    <p className="text-3xl sm:text-4xl font-bold text-red-600">{delinquentSummary.activeCount}</p>
                  </div>
                </div>

                {/* Percentage */}
                <div className="flex flex-col items-center justify-center col-span-2 sm:col-span-1">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2 uppercase tracking-wide">{t.l62}</p>
                    <p className="text-3xl sm:text-4xl font-bold text-orange-600">{delinquentSummary.delinquentPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search & Sort */}
          <Filter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOptions={[
              { value: "date", label: t.l13 },
              { value: "amount", label: t.l14 },
            ]}
            t={t}
          />

          {/* Loans Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {[t.l11, t.l12, t.l13, t.l4, t.l14, t.l15, t.l16].map(
                      (heading, i) => (
                        <th
                          key={i}
                          className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedLoans.length > 0 ? (
                    paginatedLoans.map((loan) => (
                      <tr
                        key={loan.loanId}
                        className="hover:bg-blue-50/60 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                          {loan.loanId}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                          {loan.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(loan.dateDisbursed)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium whitespace-nowrap">
                          {formatCurrency(loan.appLoanAmount)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium whitespace-nowrap">
                          {formatCurrency(loan.balance)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-black">
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-blue-600 whitespace-nowrap">
                          <Link
                            href={`/commonComponents/loan/${loan.loanId}`}
                            className="bg-gray-600 text-white px-3 py-1 rounded-md text-xs hover:bg-gray-700 inline-block"
                          >
                            {t.view}
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-gray-500 py-6 text-xs sm:text-sm"
                      >
                        {t.l55}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            setCurrentPage={setCurrentPage}
            setPageSize={setPageSize}
            language={language}
          />
        </div>
      </div>
    </Wrapper>
  );
}
