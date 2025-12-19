'use client';

import React, { useState, useEffect } from "react";

// Modals
import ErrorModal from "@/app/commonComponents/modals/errorModal";

// Utilities
import Filter from "@/app/commonComponents/utils/sortAndSearch";
import Pagination from "@/app/commonComponents/utils/pagination";
import { formatDate } from "@/app/commonComponents/utils/formatters";
import translations from "@/app/commonComponents/translation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function HeadEndorsementsPage() {
  const [closureEndorsements, setClosureEndorsements] = useState<any[]>([]);
  const [penaltyEndorsements, setPenaltyEndorsements] = useState<any[]>([]);
  const [loanBalances, setLoanBalances] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<"Closure" | "Penalty">("Closure");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const [language, setLanguage] = useState<'en' | 'ceb'>(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem("headLanguage") || localStorage.getItem("language") || 'en';
      return (storedLang as 'en' | 'ceb') || 'en';
    }
    return 'en';
  });

  const t = translations.endorsementTranslation[language];
  const b = translations.buttonTranslation[language];

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.userType === "head" && e.detail?.language) {
        setLanguage(e.detail.language);
      }
    };
    window.addEventListener("languageChange", handler as EventListener);
    return () => window.removeEventListener("languageChange", handler as EventListener);
  }, []);

  const fetchEndorsements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // Fetch closure endorsements
      const closureRes = await fetch(`${BASE_URL}/closure`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!closureRes.ok) throw new Error(t.m4);
      const closureData = await closureRes.json();
      setClosureEndorsements(Array.isArray(closureData?.data) ? closureData.data : []);

      // Fetch penalty endorsements
      const penaltyRes = await fetch(`${BASE_URL}/penalty`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!penaltyRes.ok) throw new Error(t.m3);
      const penaltyData = await penaltyRes.json();
      setPenaltyEndorsements(Array.isArray(penaltyData) ? penaltyData : penaltyData?.data ?? []);

      setShowError(false);
      setErrorMsg("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || t.m5);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndorsements();
  }, []);

  // Fetch loan balances for closure endorsements
  useEffect(() => {
    const fetchBalances = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const balances: Record<string, number> = {};
        await Promise.all(
          closureEndorsements.map(async (e) => {
            const res = await fetch(`${BASE_URL}/loans/${e.loanId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const loan = await res.json();
            balances[e.loanId] = loan.balance ?? 0;
          })
        );
        setLoanBalances(balances);
      } catch (err) {
        console.error("Failed to fetch loan balances", err);
      }
    };

    if (closureEndorsements.length > 0) fetchBalances();
  }, [closureEndorsements]);

  // Get current endorsements based on filter
  const currentEndorsements = filterType === "Closure" ? closureEndorsements : penaltyEndorsements;

  // Filter and sort
  const filtered = currentEndorsements.filter((e) =>
    (e.clientName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (e.reason?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (e.loanId?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const sorted = filtered.sort((a, b) => {
    if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "client") return a.clientName.localeCompare(b.clientName);
    return 0;
  });

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (currentPage - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  // Reset to page 1 when changing filter
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          {language === 'en' ? 'Endorsements' : 'Mga Endorsement'}
        </h1>

        <ErrorModal
          isOpen={showError}
          message={errorMsg}
          onClose={() => setShowError(false)}
        />

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={() => setFilterType("Closure")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === "Closure"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.h2}
          </button>
          <button
            onClick={() => setFilterType("Penalty")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === "Penalty"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.h1}
          </button>
        </div>

        <Filter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOptions={[
            { value: "date", label: t.s1 },
            { value: "client", label: t.s3 },
          ]}
          t={translations.loanTermsTranslator[language]}
        />

        <div className="w-full rounded-lg bg-white shadow-sm border border-gray-100 overflow-x-auto mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              {language === 'en' ? 'Loading...' : 'Nagload...'}
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c1}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c2}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c3}</th>
                  {filterType === "Closure" && (
                    <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c4}</th>
                  )}
                  {filterType === "Penalty" && (
                    <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.p4}</th>
                  )}
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c5}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c6}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginated.length > 0 ? (
                  paginated.map((e) => (
                    <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{e.endorsementId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{e.loanId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {e.clientName || e.borrowerName || '—'}
                      </td>
                      {filterType === "Closure" && (
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ₱{loanBalances[e.loanId]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </td>
                      )}
                      {filterType === "Penalty" && (
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {e.reason || '—'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(e.dateEndorsed || e.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={filterType === "Closure" ? 6 : 6} className="text-center text-gray-500 py-6 text-sm">{t.m1}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
  );
}
