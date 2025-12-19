'use client';

import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/formatters";
import ViewEndorsementModal from "../../modals/viewEndorsement";
import ErrorModal from "../../modals/errorModal";
import LoanOfficer from "@/app/userPage/loanOfficerPage/layout";
import Filter from "../../utils/sortAndSearch";
import Pagination from "../../utils/pagination";
import translations from "../../translation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function PenaltyEndorsementTab() {
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [selectedEndorsement, setSelectedEndorsement] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);

  // Pagination & filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [language, setLanguage] = useState<'en' | 'ceb'>(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem("loanOfficerLanguage") || localStorage.getItem("language") || 'en';
      return (storedLang as 'en' | 'ceb') || 'en';
    }
    return 'en';
  });

  const t = translations.endorsementTranslation[language];
  const loanT = translations.loanTermsTranslator[language];

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.userType === "loanOfficer" && e.detail?.language) {
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

      const res = await fetch(`${BASE_URL}/penalty`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(t.m3);
      const data = await res.json();
      setEndorsements(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || t.m5);
      setShowError(true);
    }
  };

  useEffect(() => {
    fetchEndorsements();
  }, []);

  // Filter & sort
  const filtered = endorsements.filter(e =>
    e.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.endorsedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = filtered.sort((a, b) => {
    if (sortBy === "amount") return b.finalAmount - a.finalAmount;
    if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
    return 0;
  });

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (currentPage - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  const handleView = (endorsement: any) => {
    setSelectedEndorsement(endorsement);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEndorsement(null);
    fetchEndorsements();
  };

  return (
    <LoanOfficer>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            {t.h1}
          </h1>

          <ErrorModal isOpen={showError} message={errorMsg} onClose={() => setShowError(false)} />

          {/* Search & Sort */}
          <Filter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOptions={[
              { value: "date", label: t.s1 },
              { value: "amount", label: t.s2 },
            ]}
            t={loanT}
          />

          {/* Endorsements Table */}
          <div className="w-full rounded-lg bg-white shadow-sm border border-gray-100 overflow-x-auto mt-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.p1}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.p2}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.p3}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.p4}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.p5}</th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.p6}</th>
                  <th className="bg-gray-50 px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t.p7}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginated.length > 0 ? (
                  paginated.map(col => (
                    <tr key={col._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{col.referenceNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{col.borrowerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{col.endorsedBy}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(col.penaltyAmount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(col.finalAmount)}</td>
                      <td className="px-6 py-4 text-sm"><span className="px-2 py-1 rounded text-xs">{col.status}</span></td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => handleView(col)} 
                            className="px-4 py-1.5 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors text-xs font-medium"
                          >
                            {t.b1}
                          </button>
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

          {/* Pagination Component */}
          <Pagination
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            setCurrentPage={setCurrentPage}
            setPageSize={setPageSize}
            language={language}
          />

          {/* View Modal */}
          <ViewEndorsementModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            endorsement={selectedEndorsement}
          />
        </div>
      </div>
    </LoanOfficer>
  );
}
