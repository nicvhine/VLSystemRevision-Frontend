"use client";

import React from "react";
import translations from "../translation";
import { PaginationProps } from "./Types/pagination";

const Pagination: React.FC<PaginationProps> = ({
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  setCurrentPage,
  setPageSize,
  language,
}) => {
  const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd = totalCount === 0 ? 0 : Math.min(totalCount, currentPage * pageSize);
  const t = translations.loanTermsTranslator[language];
  const tPagination = {
    en: { showing: "Showing" },
    ceb: { showing: "Nagpakita" }
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3 text-black">
      <div className="text-sm text-gray-700">
        {totalCount === 0 ? (
          <>
            {tPagination[language].showing} <span className="font-medium">0</span> {t.l37}
          </>
        ) : (
          <>
            {tPagination[language].showing}{" "}
            <span className="font-medium">{showingStart}</span>–<span className="font-medium">{showingEnd}</span>{" "}
            {t.l37} <span className="font-medium">{totalCount}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {t.l33}
          </span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
          >
            {t.l34}
          </button>
          <span className="px-1 py-1 text-gray-700">
            {t.l35} <span className="font-medium">{currentPage}</span>{" "}
            {t.l37} <span className="font-medium">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
          >
            {t.l36}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
