'use client';

import { useState, useEffect } from "react";
import { Loan } from "@/app/commonComponents/utils/Types/loan";
import { Collection, Payment } from "@/app/commonComponents/utils/Types/collection";
import translations from "@/app/commonComponents/translation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function useBorrowerDashboard(borrowersId: string | null) {
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [displayedLoan, setDisplayedLoan] = useState<Loan | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [paidPayments, setPaidPayments] = useState<Payment[]>([]);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"en" | "ceb">("en");
  const [role, setRole] = useState<string | null>(null);

  // Terms & Modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showTosContent, setShowTosContent] = useState(false);
  const [showPrivacyContent, setShowPrivacyContent] = useState(false);
  const [tosRead, setTosRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [termsReady, setTermsReady] = useState(false);

  // Payment
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalAnimateIn, setPaymentModalAnimateIn] = useState(false);

  // Receipt Modal for PayMongo payments
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const t = translations.loanTermsTranslator[language];

  /** LANGUAGE SETTINGS **/
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);

    const keyMap: Record<string, string> = {
      head: "headLanguage",
      "loan officer": "loanOfficerLanguage",
      manager: "managerLanguage",
      borrower: "language",
    };
    const langKey = keyMap[storedRole || ""] as keyof typeof keyMap;
    const storedLanguage = localStorage.getItem(langKey) as "en" | "ceb";
    if (storedLanguage) setLanguage(storedLanguage);
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const validRoles = ["borrower", "head", "loan officer", "manager"];
      if (validRoles.includes(role || "") && event.detail.language) {
        setLanguage(event.detail.language as "en" | "ceb");
      }
    };
    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener);
  }, [role]);

  /** TERMS & MODAL **/
  useEffect(() => {
    const mustChange = localStorage.getItem("forcePasswordChange") === "true";
    if (!mustChange) setTermsReady(true);

    const handleCompleted = () => setTermsReady(true);
    window.addEventListener("forcePasswordChangeCompleted", handleCompleted);
    return () => window.removeEventListener("forcePasswordChangeCompleted", handleCompleted);
  }, []);

  useEffect(() => {
    if (!termsReady) return;
    const key = "termsReminderSeenAt";
    const lastSeen = localStorage.getItem(key);
    const now = Date.now();
    const threshold = 24 * 60 * 60 * 1000; // 24 hours

    if (!lastSeen || isNaN(Number(lastSeen)) || now - Number(lastSeen) > threshold) {
      setShowTermsModal(true);
    }
  }, [termsReady]);

 /** FETCH ALL LOANS **/
useEffect(() => {
  if (!borrowersId) return;
  const controller = new AbortController();

  const fetchAllLoans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/loans/all/${borrowersId}`, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch loans");
      const data: Loan[] = await res.json();

      console.log("Fetched loans:", data);

      // Find active loan
      const active = data
        .filter(l => l.status === "Active")
        .sort((a, b) => new Date(b.dateDisbursed ?? 0).getTime() - new Date(a.dateDisbursed ?? 0).getTime())[0] || null;

      console.log("Active loan found:", active);
      debugger; // <-- pause here in dev tools

      setActiveLoan(active);

      // Determine displayed loan
      const displayed = active || data
        .filter(l => l.status !== "Active")
        .sort((a, b) => new Date(b.dateDisbursed ?? 0).getTime() - new Date(a.dateDisbursed ?? 0).getTime())[0] || null;

      console.log("Displayed loan selected:", displayed);
      debugger; // <-- pause here in dev tools

      if (displayed) {
        const mergedLoan = {
          ...displayed, // loan fields
          ...displayed, // app fields (already merged in API)
        };
        setDisplayedLoan(mergedLoan);
      }

      setAllLoans(data);

    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Error fetching all loans:", err);
      setError("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  fetchAllLoans();
  return () => controller.abort();
}, [borrowersId]);


  /** FETCH LOAN DETAILS, COLLECTIONS, PAYMENTS BASED ON DISPLAYED LOAN **/
  useEffect(() => {
    if (!displayedLoan?.loanId || !borrowersId) return;
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    const fetchCollections = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/collections/schedule/${borrowersId}/${displayedLoan.loanId}`,
          { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch collections");
        const data: Collection[] = await res.json();
        setCollections(data);
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    const fetchPayments = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/payments/ledger/${displayedLoan.loanId}`,
          { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch payments");
        const data = await res.json();
        const payments = Array.isArray(data.payments) ? data.payments : data;
        setPaidPayments(payments);
      } catch (err) {
        console.error("Error fetching payments:", err);
      }
    };

    fetchCollections();
    fetchPayments();

    return () => controller.abort();
  }, [displayedLoan?.loanId, borrowersId]);

  /** PAYMENT PROGRESS **/
  useEffect(() => {
    if (collections.length === 0) return setPaymentProgress(0);
    const total = collections.reduce((sum, c) => sum + c.periodAmount, 0);
    const paid = collections
      .filter(c => c.status === "Paid")
      .reduce((sum, c) => sum + c.periodAmount, 0);
    setPaymentProgress(total > 0 ? Math.round((paid / total) * 100) : 0);
  }, [collections]);

  /** PAYMENT MODAL ANIMATION **/
  useEffect(() => {
    if (isPaymentModalOpen) {
      setPaymentModalAnimateIn(false);
      const timer = setTimeout(() => setPaymentModalAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setPaymentModalAnimateIn(false);
    }
  }, [isPaymentModalOpen]);

  /** CHECK FOR PENDING PAYMONGO RECEIPT **/
  useEffect(() => {
    const pendingReceipt = localStorage.getItem('pendingPaymentReceipt');
    if (pendingReceipt) {
      try {
        const receiptPaymentData = JSON.parse(pendingReceipt);
        setReceiptData(receiptPaymentData);
        setShowReceiptModal(true);
        // Clear the pending receipt from localStorage
        localStorage.removeItem('pendingPaymentReceipt');
      } catch (err) {
        console.error('Error parsing pending receipt:', err);
        localStorage.removeItem('pendingPaymentReceipt');
      }
    }
  }, []); // Run once on component mount

  return {
    allLoans,
    activeLoan,
    displayedLoan,
    collections,
    paidPayments,
    paymentProgress,
    loading,
    error,
    showTermsModal,
    setShowTermsModal,
    showTosContent,
    setShowTosContent,
    showPrivacyContent,
    setShowPrivacyContent,
    tosRead,
    setTosRead,
    privacyRead,
    setPrivacyRead,
    termsReady,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentModalAnimateIn,
    showReceiptModal,
    setShowReceiptModal,
    receiptData,
    showErrorModal,
    setShowErrorModal,
    errorMsg,
    setErrorMsg,
    language,
    setLanguage,
    role,
    t,
  };
}
