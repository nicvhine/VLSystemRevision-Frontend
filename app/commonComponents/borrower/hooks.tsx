'use client';
import { useState, useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// Fetch all borrowers
export const useBorrowersList = () => {
  const [borrowers, setBorrowers] = useState<any[]>([]);
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
    const fetchBorrowers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/borrowers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to fetch borrowers");
          return;
        }
        const data = await res.json();
        setBorrowers(data);
      } catch (err: any) {
        setError(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowers();
  }, []);

  return { borrowers, role, language, loading, error };
};

// Fetch single borrower + latest application + stats
export const useBorrowerDetails = (borrowersId: string) => {
  const [borrower, setBorrower] = useState<any>(null);
  const [latestApplication, setLatestApplication] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!borrowersId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Fetch borrower + latest application
        const res = await fetch(`${BASE_URL}/borrowers/${borrowersId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch borrower details");
        const borrowerData = await res.json();
        setBorrower(borrowerData.borrowerDetails);
        setLatestApplication(borrowerData.latestApplication);

        const resStats = await fetch(`${BASE_URL}/borrowers/${borrowersId}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resStats.ok) throw new Error("Failed to fetch borrower stats");
        const statsData = await resStats.json();
        setStats(statsData);
      } catch (err: any) {
        setError(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [borrowersId]);

  return { borrower, latestApplication, stats, loading, error };
};


