'use client';

import { useState, useEffect } from "react";
import { 
  LoanStats, CollectionStats, TypeStats, ApplicationStats, LoanTypeStat, 
  TopBorrower, TopCollector, TopAgent 
} from "../utils/Types/statsType";
import translations from "../translation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function useLoanStats(userType: "manager" | "loanOfficer" | "head") {
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "ceb">("en");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);

    const keyMap: Record<string, string> = {
      head: "headLanguage",
      "loan officer": "loanOfficerLanguage",
      manager: "managerLanguage",
    };

    const langKey = keyMap[storedRole || ""] as keyof typeof keyMap;
    const storedLanguage = localStorage.getItem(langKey) as "en" | "ceb";
    if (storedLanguage) setLanguage(storedLanguage);
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<{ userType: string; language: "en" | "ceb" }>) => {
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

  const t = translations.statisticTranslation[language];
  const s = translations.loanTermsTranslator[language];

  const [loanStats, setLoanStats] = useState<LoanStats>({
    totalPrincipal: 0,
    totalInterest: 0,
    typeStats: [] as LoanTypeStat[],
  });

  const [collectionStats, setCollectionStats] = useState<CollectionStats>({
    totalCollectables: 0,
    totalCollected: 0,
    totalUnpaid: 0,
  });

  const [typeStats, setTypeStats] = useState<TypeStats>({
    withCollateral: 0,
    withoutCollateral: 0,
    openTerm: 0,
  });

  const [applicationStats, setApplicationStats] = useState<ApplicationStats>({
    applied: 0,
    approved: 0,
    denied: 0,
  });

  const [monthlyInterest, setMonthlyInterest] = useState<{ month: number; totalInterest: number }[]>(
    Array.from({ length: 12 }, (_, i) => ({ month: i + 1, totalInterest: 0 }))
  );

  const [topBorrowers, setTopBorrowers] = useState<TopBorrower[]>([]);
  const [topCollectors, setTopCollectors] = useState<TopCollector[]>([]);
  const [topAgents, setTopAgents] = useState<TopAgent[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchMainStats = async () => {
      try {
        if (userType === "manager" || userType === "head") {
          // Fetch main stats
          const [typeRes, loanRes, collectionRes, appRes] = await Promise.all([
            fetch(`${BASE_URL}/stat/loan-type-stats`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${BASE_URL}/stat/loan-stats`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${BASE_URL}/stat/collection-stats`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${BASE_URL}/stat/application-statuses`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          const typeDataRes: any = await typeRes.json();
          const typeData: LoanTypeStat[] = Array.isArray(typeDataRes)
            ? typeDataRes
            : typeDataRes?.typeStats || [];

          const loanData: LoanStats = await loanRes.json();
          const collectionData: CollectionStats = await collectionRes.json();
          const appData: ApplicationStats = await appRes.json();

          setLoanStats({
            ...loanData,
            typeStats: typeData,
          });          
          setCollectionStats(collectionData);
          setApplicationStats(appData);

          const withCollateral = typeData.find((t: LoanTypeStat) => t.loanType === "Regular Loan With Collateral")?.count || 0;
          const withoutCollateral = typeData.find((t: LoanTypeStat) => t.loanType === "Regular Loan Without Collateral")?.count || 0;
          const openTerm = typeData.find((t: LoanTypeStat) => t.loanType === "Open-Term Loan")?.count || 0;

          setTypeStats({ withCollateral, withoutCollateral, openTerm });
        } else {
          // Loan officer stats
          const [typeRes, appRes] = await Promise.all([
            fetch(`${BASE_URL}/stat/applied-loan-type-stats`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${BASE_URL}/stat/application-statuses`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          const typeData: LoanTypeStat[] = await typeRes.json();
          const appData: ApplicationStats = await appRes.json();

          const withCollateral = typeData.find((t: LoanTypeStat) => t.loanType === "Regular Loan With Collateral")?.count || 0;
          const withoutCollateral = typeData.find((t: LoanTypeStat) => t.loanType === "Regular Loan Without Collateral")?.count || 0;
          const openTerm = typeData.find((t: LoanTypeStat) => t.loanType === "Open-Term Loan")?.count || 0;

          setTypeStats({ withCollateral, withoutCollateral, openTerm });
          setApplicationStats(appData);
        }
      } catch (err) {
        console.error("Failed to fetch main loan stats:", err);
      }
    };

    const fetchTopLists = async () => {
      try {
          const [borrowerRes, collectorRes, agentRes] = await Promise.all([
            fetch(`${BASE_URL}/stat/top-borrowers`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${BASE_URL}/stat/top-collectors`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${BASE_URL}/stat/top-agents`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          const borrowerData: { topBorrowers: TopBorrower[] } = await borrowerRes.json();
          const collectorData: TopCollector[] = await collectorRes.json();
          const agentData: TopAgent[] = await agentRes.json();

          setTopBorrowers(borrowerData.topBorrowers || []);
          setTopCollectors(collectorData || []);
          setTopAgents(agentData || []);
      } catch (err) {
        console.error("Failed to fetch top lists:", err);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchMainStats(), fetchTopLists()]);
      setLoading(false);
    };

    fetchAll();
  }, [userType]);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ userType: string; language: "en" | "ceb" }>;
      if (customEvent.detail?.userType === userType) {
        setLanguage(customEvent.detail.language);
      }
    };
  
    if (typeof window !== "undefined") {
      window.addEventListener("languageChange", handler as EventListener);
    }
  
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("languageChange", handler as EventListener);
      }
    };
  }, [userType]);
  

  return { 
    s, 
    t, 
    loading, 
    loanStats, 
    collectionStats, 
    typeStats, 
    applicationStats, 
    monthlyInterest, 
    language, 
    topBorrowers, 
    topCollectors, 
    topAgents  
  };
}
