import { useState, useEffect } from "react";
import { Language } from "../utils/Types/language";

// -------------------- Role & Language Hook --------------------
export function useRoleLanguage() {
  const [role, setRole] = useState<"manager" | "head" | "loan officer">("manager");
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const storedRole = localStorage.getItem("role") as "manager" | "head" | "loan officer" | null;
    if (storedRole) setRole(storedRole);

    const storedLang = localStorage.getItem("language") as Language | null;
    if (storedLang) setLanguage(storedLang);
  }, []);

  return { role, language, setLanguage };
}

// -------------------- Active Filter Hook --------------------
export function useActiveFilter(initialFilter: string = "All") {
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  return { activeFilter, setActiveFilter };
}

// -------------------- Combined Loan Application Hook --------------------
export function useLoanApplicationPage() {
  const { role, language, setLanguage } = useRoleLanguage();
  const { activeFilter, setActiveFilter } = useActiveFilter("All");

  // Listen for languageChange events
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const { userType, language } = event.detail;
      if (
        (role === "head" && userType === "head") ||
        (role === "loan officer" && userType === "loanOfficer") ||
        (role === "manager" && userType === "manager")
      ) {
        setLanguage(language);
      }
    };
    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    return () =>
      window.removeEventListener("languageChange", handleLanguageChange as EventListener);
  }, [role, setLanguage]);

  return { role, language, activeFilter, setActiveFilter };
}
