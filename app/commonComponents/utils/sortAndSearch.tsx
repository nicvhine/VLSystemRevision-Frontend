'use client';

import { FiSearch, FiChevronDown } from "react-icons/fi";
import { FilterProps } from "./Types/pagination";

export default function Filter({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOptions,
  t,
  isMobile = false,
  onSearchChange,
  onSortChange
}: FilterProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange?.(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    onSortChange?.(e.target.value);
  };

  return (
    <div className={isMobile ? "flex flex-col gap-2 mb-4" : "flex flex-col sm:flex-row sm:items-center gap-4 mb-6"}>
      <div className="relative w-full">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          placeholder={t?.l22 || "Search..."}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-600 
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>

      <div className="relative w-full sm:w-[200px]">
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-600 
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition-all"
        >
          <option value="">{t?.l38 || "Sort by"}</option>
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      </div>
    </div>
  );
}
