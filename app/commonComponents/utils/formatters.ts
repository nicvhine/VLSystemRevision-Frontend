import translations from "../translation";

export const formatCurrency = (amount?: number | string) =>
  amount
    ? new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(Number(amount))
    : "₱0.00";

export const capitalizeWords = (text?: string) => {
  if (!text) return "—";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Cebuano month names
const cebuanoMonths: { [key: number]: string } = {
  0: "Enero",
  1: "Pebrero",
  2: "Marso",
  3: "Abril",
  4: "Mayo",
  5: "Hunyo",
  6: "Hulyo",
  7: "Agosto",
  8: "Septiyembre",
  9: "Oktubre",
  10: "Nobiyembre",
  11: "Disyembre",
};

export const formatDate = (dateString?: string, language: "en" | "ceb" = "en") => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  
  if (language === "ceb") {
    // Custom Cebuano date formatting
    const month = cebuanoMonths[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  } else {
    // English date formatting
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

export const formatDateTime = (dateString?: string) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

export const translateLoanType = (
  type?: string,
  language: "en" | "ceb" = "en"
): string => {
  // Fallback to 'en' if translations not ready
  const t = (translations.loanTermsTranslator?.[language] ?? translations.loanTermsTranslator.en);

  if (!type) return "—";

  const raw = type;
  const norm = raw
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (norm === "regularwithout" || norm.includes("without collateral")) return t.l1;
  if (norm === "regularwith" || norm.includes("with collateral")) return t.l2;
  if (norm === "openterm" || norm.includes("open term")) return t.l3;

  switch (raw) {
    case "Regular Loan Without Collateral":
      return t.l1;
    case "Regular Loan With Collateral":
      return t.l2;
    case "Open-Term Loan":
      return t.l3;
    default:
      return raw;
  }
};

export const getRequirements = (type: string, language: "en" | "ceb" = "en") => {
  const t = translations.requirementsTranslation?.[language] ?? translations.requirementsTranslation.en;
  const englishType = translateLoanType(type, "en");

  switch (englishType) {
    case "Regular Loan Without Collateral":
      return [t.t4, t.t5, t.t6, t.t7];

    case "Regular Loan With Collateral":
      return [t.t4, t.t5, t.t6, t.t7, t.t8, t.t9];

    case "Open-Term Loan":
      return [t.t4, t.t5, t.t6, t.t7, t.t8, t.t9];

    default:
      return [];
  }
};

export const getLoanProcessSteps = (language: "en" | "ceb" = "en") => {
  const t = translations.requirementsTranslation?.[language] ?? translations.requirementsTranslation.en;
  return [t.t10, t.t11, t.t12, t.t13, t.t14];
};

