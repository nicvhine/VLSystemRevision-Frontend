'use client';
import { useState, useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// Fetch all borrowers
export const useLoanList = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [role, setRole] = useState<'manager' | 'head' | 'loan officer' | 'collector'>('manager');
  const [language, setLanguage] = useState<"en" | "ceb">("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role") as typeof role | null;
    const keyMap: Record<string, string> = {
      head: "headLanguage",
      "loan officer": "loanOfficerLanguage",
      manager: "managerLanguage",
    };
    const langKey = storedRole ? keyMap[storedRole] || "language" : "language";
    const storedLang = localStorage.getItem(langKey) as "en" | "ceb" | null;
    if (storedRole) setRole(storedRole);
    if (storedLang) setLanguage(storedLang);
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
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener);
  }, [role]);

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/loans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to fetch loans");
          return;
        }
        const data = await res.json();
        setLoans(data);
      } catch (err: any) {
        setError(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  return { loans, role, language, loading, error };
};




