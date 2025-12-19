'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/app/commonComponents/navbarComponents/navbar';
import { useBorrowersList } from './hooks';
import Filter from '../utils/sortAndSearch';
import Pagination from '../utils/pagination';
import translations from '../translation';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function BorrowerPageClient() {
  const { borrowers, loading, error, role } = useBorrowersList();
  const [overview, setOverview] = useState<any>(null);
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const t = translations.borrowerTranslation[language];
  const loanT = translations.loanTermsTranslator[language];

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const keyMap: Record<string, string> = {
      head: "headLanguage",
      "loan officer": "loanOfficerLanguage",
      manager: "managerLanguage",
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
          (role === "manager" && targetUserType === "manager")
        ) {
          setLanguage(event.detail.language as "en" | "ceb");
        }
      }
    };

    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener);
  }, [role]);

  // Map role to navbar role format
  const navbarRole = role === 'loan officer' ? 'loanOfficer' : role === 'head' ? 'head' : 'manager';

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/borrowers/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOverview(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOverview();
  }, []);

  const filteredBorrowers = borrowers
    .filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortBy === 'name' ? a.name.localeCompare(b.name) : a.status.localeCompare(b.status)
    );

  const totalCount = filteredBorrowers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedBorrowers = filteredBorrowers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar role={navbarRole} />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">{t.h1}</h1>

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
                  {[t.t1, t.t2, t.t3, t.t4, t.t5, t.t6].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedBorrowers.length > 0 ? (
                  paginatedBorrowers.map((b) => {
                    const topData = overview?.topBorrowers?.find(
                      (tb: any) => tb.borrowersId === b.borrowersId
                    );
                    return (
                      <tr
                        key={b.borrowersId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">{b.borrowersId}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.phoneNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ₱
                          {topData?.totalBorrowedAmount
                            ? topData.totalBorrowedAmount.toLocaleString()
                            : '0'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/commonComponents/borrower/${b.borrowersId}`}
                            className="bg-gray-600 text-white px-3 py-1 rounded-md text-xs hover:bg-gray-700 inline-block whitespace-nowrap"
                          >
                            {loanT.view}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-6 text-sm">
                      {t.m2}
                    </td>
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
    </div>
  );
}
