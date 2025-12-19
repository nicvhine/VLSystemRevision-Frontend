'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Modals
import ErrorModal from "../../modals/errorModal";
import SuccessModal from "../../modals/successModal";
import ConfirmModal from "../../modals/confirmModal";

// Utilities
import Filter from "../../utils/sortAndSearch";
import Pagination from "../../utils/pagination";
import { formatDate } from "../../utils/formatters";
import translations from "../../translation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Dynamically import Manager layout to avoid server/client conflict
const Manager = dynamic(() => import('@/app/userPage/managerPage/layout'), { ssr: false });

export default function ClosureEndorsement() {
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [loanBalances, setLoanBalances] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    action: "approve" | "reject";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [language, setLanguage] = useState<'en' | 'ceb'>(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem("managerLanguage") || localStorage.getItem("language") || 'en';
      return (storedLang as 'en' | 'ceb') || 'en';
    }
    return 'en';
  });

  const t = translations.endorsementTranslation[language];
  const loanT = translations.loanTermsTranslator[language];

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.userType === "manager" && e.detail?.language) {
        setLanguage(e.detail.language);
      }
    };
    window.addEventListener("languageChange", handler as EventListener);
    return () => window.removeEventListener("languageChange", handler as EventListener);
  }, []);

  const fetchEndorsements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${BASE_URL}/closure`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(t.m4);

      const data = await res.json();
      setEndorsements(Array.isArray(data?.data) ? data.data : []);
      setShowError(false);
      setErrorMsg("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || t.m5);
      setShowError(true);
    }
  };

  useEffect(() => {
    fetchEndorsements();
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const balances: Record<string, number> = {};
        await Promise.all(
          endorsements.map(async (e) => {
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

    if (endorsements.length > 0) fetchBalances();
  }, [endorsements]);

  const handleAction = async (endorsementId: string, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setShowError(false);
      setErrorMsg("");
      setShowSuccess(false);
      setSuccessMsg("");

      const res = await fetch(`${BASE_URL}/closure/${endorsementId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action === "approve" ? "Approved" : "Rejected" }),
      });

      if (!res.ok) {
        let apiMsg = t.m2;
        try {
          const errBody = await res.json();
          apiMsg = errBody?.message || apiMsg;
        } catch {}
        throw new Error(apiMsg);
      }

      setEndorsements((prev) =>
        prev.map((e) =>
          e.endorsementId === endorsementId ? { ...e, status: action === "approve" ? "Approved" : "Rejected" } : e
        )
      );

      setSuccessMsg(action === "approve" ? "Endorsement approved." : "Endorsement rejected.");
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : t.m2);
      setShowError(true);
    }
  };

  const filtered = endorsements.filter((e) =>
    (e.clientName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (e.reason?.toLowerCase() || "").includes(searchQuery.toLowerCase())
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

  return (
    <Manager>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">{t.h2}</h1>

          <ErrorModal
            isOpen={showError}
            message={errorMsg}
            onClose={() => setShowError(false)}
          />

          <SuccessModal
            isOpen={showSuccess}
            message={successMsg}
            onClose={() => setShowSuccess(false)}
          />

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
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c1}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c2}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c3}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c4}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c5}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.c6}</th>
                  <th className="bg-gray-50 px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-40">{t.c7}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginated.length > 0 ? (
                  paginated.map((e) => (
                    <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{e.endorsementId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{e.loanId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{e.clientName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₱{loanBalances[e.loanId]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(e.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{e.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 w-40">
                        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                          {e.status === "Pending" && (
                            <>
                              <button
                                onClick={() => {
                                  setPendingAction({ id: e.endorsementId, action: "approve" });
                                  setShowConfirm(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                              >
                                {t.b2}
                              </button>
                              <button
                                onClick={() => {
                                  setPendingAction({ id: e.endorsementId, action: "reject" });
                                  setShowConfirm(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                              >
                                {t.b3}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-6 text-sm">{t.m1}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <ConfirmModal
            show={showConfirm}
            loading={actionLoading}
            message={
              pendingAction
                ? `Are you sure you want to ${pendingAction.action === "approve" ? "approve" : "reject"} this closure endorsement?`
                : undefined
            }
            onCancel={() => {
              if (!actionLoading) {
                setShowConfirm(false);
                setPendingAction(null);
              }
            }}
            onConfirm={async () => {
              if (!pendingAction) return;
              try {
                setActionLoading(true);
                await handleAction(pendingAction.id, pendingAction.action);
              } finally {
                setActionLoading(false);
                setShowConfirm(false);
                setPendingAction(null);
              }
            }}
          />

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
    </Manager>
  );
}
