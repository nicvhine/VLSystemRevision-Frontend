"use client";

import { useState, useEffect } from "react";
import { Application } from "../../utils/Types/application";
import { authFetch } from "../../utils/fetch";
import translations from "../../translation";

export function useApplicationData(apiUrl: string) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "ceb">("en");
  const [modalContainer, setModalContainer] = useState<Element | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token in localStorage");

        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        const mappedData = data.map((app: any) => ({
          ...app,
          appReferences:
            app.appReferences?.map((ref: any) => ({
              name: ref.name,
              contact: ref.contact,
              relation: ref.relation,
            })) || [],
        }));

        setApplications(mappedData);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [apiUrl]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await authFetch(apiUrl);
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error("Failed to refresh applications:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [apiUrl]);

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

  useEffect(() => {
    setModalContainer(document.getElementById("modal-root"));
  }, []);

  const t = translations.loanTermsTranslator[language];
  const l = translations.viewApplicationTranslation[language];
  const a = translations.applicationActionsTranslation[language];

  return {
    applications,
    setApplications,
    loading,
    role,
    language,
    t,
    l,
    a,
    modalContainer,
  };
}
