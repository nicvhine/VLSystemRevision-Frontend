'use client';

import { useBorrowerDetails } from "../hooks";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { User } from "lucide-react";
import { FiEdit2 } from "react-icons/fi";
import translations from "../../translation";
import ChangeCollectorModal from "../../modals/changeCollectorModal";
import { formatCurrency } from "../../utils/formatters";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Dynamically import layouts to prevent server/client conflicts
const Head = dynamic(() => import("@/app/userPage/headPage/layout"), { ssr: false });
const Manager = dynamic(() => import("@/app/userPage/managerPage/layout"), { ssr: false });
const LoanOfficer = dynamic(() => import("@/app/userPage/loanOfficerPage/layout"), { ssr: false });

interface Props {
  borrowersId: string;
}

export default function BorrowerDetailClient({ borrowersId }: Props) {
  const { borrower, latestApplication, stats, loading, error } = useBorrowerDetails(borrowersId);

  const [role, setRole] = useState<"manager" | "head" | "loan officer">("manager");
  const [language, setLanguage] = useState<"en" | "ceb">("en");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignedCollector, setAssignedCollector] = useState(borrower?.assignedCollector || "");
  const [assignedCollectorId, setAssignedCollectorId] = useState(borrower?.assignedCollectorId || "");

  useEffect(() => {
    if (borrower?.assignedCollector) setAssignedCollector(borrower.assignedCollector);
  }, [borrower]);

  // Load role and language from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role") as typeof role | null;
    if (storedRole) setRole(storedRole);

    const keyMap: Record<string, string> = {
      head: "headLanguage",
      "loan officer": "loanOfficerLanguage",
      manager: "managerLanguage",
    };

    const langKey = storedRole ? keyMap[storedRole] || "language" : "language";
    const storedLang =
      localStorage.getItem(langKey) || localStorage.getItem("language") || "en";
    setLanguage(storedLang as "en" | "ceb");
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handler = (e: any) => {
      if (
        (role === "head" && e.detail?.userType === "head") ||
        (role === "loan officer" && e.detail?.userType === "loanOfficer") ||
        (role === "manager" && e.detail?.userType === "manager")
      ) {
        if (e.detail?.language) setLanguage(e.detail.language);
      }
    };
    window.addEventListener("languageChange", handler as EventListener);
    return () => window.removeEventListener("languageChange", handler as EventListener);
  }, [role]);

  const t = translations.viewBorrowerTranslation[language];
  const Wrapper = role === "loan officer" ? LoanOfficer : role === "head" ? Head : Manager;

  if (loading)
    return (
      <Wrapper>
        <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
          {t.m1}
        </div>
      </Wrapper>
    );

  if (error)
    return (
      <Wrapper>
        <div className="text-center text-red-600 mt-10 text-lg font-semibold">{error}</div>
      </Wrapper>
    );

  if (!borrower)
    return (
      <Wrapper>
        <div className="text-center text-gray-900 mt-10 text-lg">{t.m2}</div>
      </Wrapper>
    );

  // Use borrower data for personal info, fallback to latest application only if borrower data is missing
  const personalData = {
    name: borrower.name || latestApplication?.appName || "—",
    email: borrower.email || latestApplication?.appEmail || "—",
    phoneNumber: borrower.phoneNumber || latestApplication?.appContact || "—",
    address: borrower.address || latestApplication?.appAddress || "—",
    dob: borrower.dob || latestApplication?.appDob || "—",
    maritalStatus: borrower.maritalStatus || latestApplication?.appMarital || "—",
    children: borrower.children || latestApplication?.appChildren || "—",
    spouseName: borrower.spouseName || latestApplication?.appSpouseName || "",
    spouseOccupation: borrower.spouseOccupation || latestApplication?.appSpouseOccupation || "",
  };

  // Use latest application data for income/business info (this is application-specific)
  const incomeData = {
    monthlyIncome: latestApplication?.appMonthlyIncome || "—",
    sourceOfIncome: latestApplication?.sourceOfIncome?.toLowerCase() || "",
    typeBusiness: latestApplication?.appTypeBusiness || "—",
    businessName: latestApplication?.appBusinessName || "—",
    dateStarted: latestApplication?.appDateStarted || "—",
    businessLoc: latestApplication?.appBusinessLoc || "—",
    occupation: latestApplication?.appOccupation || "—",
    employmentStatus: latestApplication?.appEmploymentStatus || "—",
    companyName: latestApplication?.appCompanyName || "—",
  };

  // Profile picture and agent from latest application
  const hasProfilePic = latestApplication?.profilePic?.filePath;
  const imageSrc =
    hasProfilePic && latestApplication.profilePic.filePath.startsWith("https")
      ? latestApplication.profilePic.filePath
      : hasProfilePic
      ? `${BASE_URL}/${latestApplication.profilePic.filePath}`
      : null;

  const latestLoanId = stats?.latestLoan?.loanId;
  const latestAppId =
    latestApplication?.applicationId || stats?.latestLoan?.applicationId;

  return (
    <Wrapper>
      <div className="min-h-screen bg-white flex justify-center">
        <div className="mx-auto px-4 sm:px-6 py-10 max-w-7xl w-full">
          {/* HEADER */}
          <div className="bg-gray-600 py-5 text-center text-white rounded-3xl shadow-lg mb-5">
            <div className="flex flex-col items-center">
              <div className="h-36 w-36 rounded-full overflow-hidden border-4 border-white mb-5 bg-white flex items-center justify-center">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={personalData.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <User className="text-red-600 w-16 h-16" />
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{personalData.name}</h1>
              <p className="text-sm opacity-80 mt-1">{borrowersId}</p>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PERSONAL */}
            <Card title={t.t1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <LabeledField label={t.p1} value={personalData.email} />
                <LabeledField label={t.p2} value={personalData.phoneNumber} />
                <LabeledField label={t.p3} value={personalData.address} span />
                <LabeledField label={t.p4} value={personalData.dob} />
                <LabeledField label={t.p5} value={personalData.maritalStatus} />

                {/* Assigned Collector */}
                <div className="flex flex-col bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
                  <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">
                    Assigned Collector
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-800 text-sm font-medium">
                      {assignedCollector || "—"}
                    </p>
                    {role === "manager" && (
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                        title="Edit Collector"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Agent */}
                <div className="flex flex-col bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
                  <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">
                    {language === 'en' ? 'Agent' : 'Ahente'}
                  </p>
                  <p className="text-gray-800 text-sm font-medium">
                    {latestApplication?.appAgent?.name || "—"}
                  </p>
                </div>

                {personalData.children && personalData.children !== "0" && (
                  <LabeledField label={t.p6} value={personalData.children} />
                )}
                {personalData.spouseName && (
                  <LabeledField label={t.p7} value={personalData.spouseName} />
                )}
                {personalData.spouseOccupation && (
                  <LabeledField label={t.p8} value={personalData.spouseOccupation} />
                )}
              </div>
            </Card>

            {/* INCOME */}
            <Card title={t.t2}>
              {incomeData.sourceOfIncome?.includes("business") ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <LabeledField label={t.i1} value={formatCurrency(incomeData.monthlyIncome)} />
                  <LabeledField label={t.i2} value={incomeData.typeBusiness} />
                  <LabeledField label={t.i3} value={incomeData.businessName} />
                  <LabeledField label={t.i4} value={incomeData.dateStarted} />
                  <LabeledField label={t.i5} value={incomeData.businessLoc} span />
                </div>
              ) : incomeData.sourceOfIncome?.includes("employ") ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <LabeledField label={t.i1} value={formatCurrency(incomeData.monthlyIncome)} />
                  <LabeledField label={t.i6} value={incomeData.occupation} />
                  <LabeledField label={t.i7} value={incomeData.employmentStatus} />
                  <LabeledField label={t.i8} value={incomeData.companyName} />
                </div>
              ) : (
                <p className="text-gray-600 italic text-sm">{t.m3}</p>
              )}
            </Card>
          </div>

          {/* STATS */}
          <Card title={t.t3} className="mt-10">
            <p className="text-center text-sm text-gray-500 mt-6 italic">
              {latestLoanId || latestAppId ? t.m4 : t.m5}
            </p>
            <div className="grid grid-cols-2 gap-6 text-center mt-5">
              <Link
                href={latestLoanId ? `/commonComponents/loan/${latestLoanId}` : "#"}
                className={`block transition-transform ${
                  latestLoanId ? "hover:scale-[1.03]" : "cursor-not-allowed opacity-60"
                }`}
              >
                <StatCard label={t.a1} value={stats?.totalLoans ?? 0} />
              </Link>

              <Link
                href={latestAppId ? `/commonComponents/loanApplication/${latestAppId}` : "#"}
                className={`block transition-transform ${
                  latestAppId ? "hover:scale-[1.03]" : "cursor-not-allowed opacity-60"
                }`}
              >
                <StatCard label={t.a2} value={stats?.totalApplications ?? 0} />
              </Link>
            </div>
          </Card>

          <ChangeCollectorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            borrowerId={borrowersId}
            currentCollector={assignedCollectorId}
            onUpdated={(newCollectorId, newCollectorName) => {
              setAssignedCollectorId(newCollectorId);
              setAssignedCollector(newCollectorName);
            }}
          />
        </div>
      </div>
    </Wrapper>
  );
}

/* --- REUSABLE COMPONENTS --- */
const Card = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl shadow-md p-8 bg-white border border-gray-100 ${className}`}>
    <h2 className="text-lg font-semibold text-red-700 mb-5 border-b border-red-100 pb-2">{title}</h2>
    {children}
  </div>
);

const LabeledField = ({ label, value, span }: { label: string; value?: string | number; span?: boolean }) => (
  <div className={`flex flex-col ${span ? "sm:col-span-2" : ""} bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition`}>
    <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">{label}</p>
    <p className="text-gray-800 text-sm font-medium">{value && value !== "—" && value !== "0" ? value : "—"}</p>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center justify-center p-6 border border-gray-100 bg-white rounded-xl hover:shadow-md transition-all">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-3xl font-bold text-red-600 mt-1">{value}</p>
  </div>
);