'use client';

import { useState, useEffect } from "react";
import { Application } from "../utils/Types/application";
import { authFetch } from "../loanApplication/function";
import { formatCurrency, formatDate, translateLoanType } from "../utils/formatters";
import translations from "../translation";
import { useLoanApplicationPage } from "../loanApplication/hooks";
import Pagination from "../utils/pagination";
import SuccessModal from "../modals/successModal";
import ErrorModal from "../modals/errorModal";
import useIsMobile from "../utils/useIsMobile";

import Head from "@/app/userPage/headPage/layout";
import Manager from "@/app/userPage/managerPage/layout";
import LoanOfficer from "@/app/userPage/loanOfficerPage/layout";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ArchivePageClient() {
  const { role, language } = useLoanApplicationPage();
  const t = translations.loanTermsTranslator[language];
  const isMobile = useIsMobile();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const Wrapper = role === "loan officer" ? LoanOfficer : role === "head" ? Head : Manager;

  useEffect(() => {
    const fetchArchivedApplications = async () => {
      try {
        const response = await authFetch(`${BASE_URL}/loan-applications/archive`);
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error("Failed to fetch archived applications:", error);
        setModalMsg("Failed to load archived applications.");
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArchivedApplications();
  }, []);

  const totalPages = Math.max(1, Math.ceil(applications.length / pageSize));
  const paginatedApplications = applications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Wrapper>
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          message={modalMsg}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          message={modalMsg}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() =>
                typeof window !== "undefined" ? window.history.back() : null
              }
              className="mt-1 p-2 rounded-full hover:bg-gray-100 text-gray-500"
              aria-label="Go back"
            >
              {/* Left chevron icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M15.78 4.22a.75.75 0 010 1.06L9.06 12l6.72 6.72a.75.75 0 11-1.06 1.06l-7.25-7.25a.75.75 0 010-1.06l7.25-7.25a.75.75 0 011.06 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <h1 className="ml-2 text-2xl font-semibold text-gray-800">
              Archived Applications
            </h1>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full">
              <thead>
                <tr>
                  {[
                    t.l11,
                    t.l12,
                    t.l10,
                    t.l17,
                    t.l4,
                    t.l5,
                    t.l7,
                    t.l15,
                    t.l16,
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-gray-500 text-sm">
                      Loading archived applications...
                    </td>
                  </tr>
                ) : paginatedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-gray-500 text-sm">
                      No archived (Denied) applications found.
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map((application) => (
                    <tr
                      key={application.applicationId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {application.applicationId}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {application.appName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {translateLoanType(application.loanType, language)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(application.dateApplied)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(application.appLoanAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {application.appInterestRate}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatCurrency(application.appTotalPayable)}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                        {application.status}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`/commonComponents/loanApplication/${application.applicationId}`}
                          className="bg-gray-600 text-white px-3 py-1 rounded-md text-xs hover:bg-gray-700"
                        >
                          {t.view}
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalCount={applications.length}
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
