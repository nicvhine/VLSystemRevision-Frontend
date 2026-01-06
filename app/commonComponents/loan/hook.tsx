'use client';

import { useState, useEffect, useCallback } from 'react';
import { LoanDetails } from '../utils/Types/loan';
import { fetchLoans } from './function';
import translations from '../translation';

export const useLoansPage = () => {
  const [loans, setLoans] = useState<LoanDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Overdue' | 'Closed' | 'Delinquent'>('All');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [role, setRole] = useState<'manager' | 'head' | 'loan officer'>('manager');
  const [language, setLanguage] = useState<"en" | "ceb">("en");

  // Fetch loan data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await fetchLoans(token);
      setLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = Object.values(loan).some((v) =>
      v?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (!matchesSearch) return false;

    if (activeFilter === 'Active') return loan.status?.toLowerCase() === 'active';
    if (activeFilter === 'Overdue') return loan.status?.toLowerCase() === 'overdue';
    if (activeFilter === 'Closed') return loan.status?.toLowerCase() === 'closed';
    if (activeFilter === 'Delinquent') {
      // A loan is delinquent if credit score is <= 3 AND status is active
      return (loan.creditScore || 0) <= 3 && loan.status?.toLowerCase() === 'active';
    }
    return true;
  });

  // Sort loans
  const sortedLoans = [...filteredLoans].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.dateDisbursed).getTime() - new Date(a.dateDisbursed).getTime();
    }
    if (sortBy === 'amount') {
      const aBalance = a.currentLoan?.remainingBalance ?? 0;
      const bBalance = b.currentLoan?.remainingBalance ?? 0;
      return bBalance - aBalance;
    }
    return 0;
  });

  // Pagination
  const totalCount = sortedLoans.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedLoans = sortedLoans.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd = totalCount === 0 ? 0 : Math.min(totalCount, currentPage * pageSize);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole === "manager" || storedRole === "head" || storedRole === "loan officer") {
      setRole(storedRole);
    } else {
      setRole("manager"); 
    }

    const keyMap: Record<string, string> = {
      head: "headLanguage",
      "loan officer": "loanOfficerLanguage",
      manager: "managerLanguage",
    };

    const langKey = keyMap[storedRole || ""] as keyof typeof keyMap;
    const storedLanguage = localStorage.getItem(langKey) as "en" | "ceb";
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      if (
        (role === "head" && event.detail.userType === "head") ||
        (role === "loan officer" && event.detail.userType === "loanOfficer") ||
        (role === "manager" && event.detail.userType === "manager")
      ) {
        setLanguage(event.detail.language);
      }
    };

    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    return () =>
      window.removeEventListener("languageChange", handleLanguageChange as EventListener);
  }, [role]);
  
  const t = translations.loanTermsTranslator[language];

  // Calculate delinquent loan summary (credit score <= 3, status = active)
  const activeLoans = loans.filter((loan) => loan.status?.toLowerCase() === 'active');
  const delinquentLoans = activeLoans.filter((loan) => (loan.creditScore || 0) <= 3);
  
  const delinquentSummary = {
    delinquentCount: delinquentLoans.length,
    delinquentTotalAmount: delinquentLoans.reduce((sum, loan) => {
      const balance = typeof loan.balance === 'string' ? parseFloat(loan.balance) : (loan.balance || 0);
      return sum + balance;
    }, 0),
    activeCount: activeLoans.length,
    activeTotalAmount: activeLoans.reduce((sum, loan) => {
      const balance = typeof loan.balance === 'string' ? parseFloat(loan.balance) : (loan.balance || 0);
      return sum + balance;
    }, 0),
    delinquentPercentage: activeLoans.length > 0 ? (delinquentLoans.length / activeLoans.length) * 100 : 0,
  };

  return {
    role,
    language,
    setLanguage,
    loans,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    activeFilter,
    setActiveFilter,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    showingStart,
    showingEnd,
    paginatedLoans,
    sortedLoans,
    delinquentSummary,
    t,
  };
};
