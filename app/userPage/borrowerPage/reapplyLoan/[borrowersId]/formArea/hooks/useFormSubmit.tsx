'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface UseFormSubmitProps {
  borrowersId?: string; // optional initially, fetched from backend
  appName: string;
  appDob: string;
  appContact: string;
  appEmail: string;
  appMarital: string;
  appSpouseName: string;
  appSpouseOccupation: string;
  appAddress: string;
  appLoanPurpose: string;
  selectedLoan: { amount: number; months?: number; interest: number } | null;
  balanceDecision: 'deduct' | 'addPrincipal';
  previousBalance: number;
  sourceOfIncome: string;
  appTypeBusiness: string;
  appBusinessName: string;
  appDateStarted: string;
  appBusinessLoc: string;
  appMonthlyIncome: number;
  appOccupation: string;
  appEmploymentStatus: string;
  appCompanyName: string;
  appReferences: { name: string; contact: string; relation: string }[];
  requiresCollateral: boolean;
  collateralType: string;
  collateralValue: number;
  collateralDescription: string;
  ownershipStatus: string;
  appAgent: string;
  photo2x2: File[];
  uploadedFiles: File[];
  requiredDocumentsCount: number;
  missingFields: string[];
  setMissingFields: (fields: string[]) => void;
  setAgentMissingError: (val: boolean) => void;
  API_URL: string;
  COMPANY_NAME: string;
  TERMS_VERSION: string;
  PRIVACY_VERSION: string;
  language: 'en' | 'ceb';
  onSuccess?: (loanId: string) => void;
  onError?: (errorMessage: string) => void;
}

export function useFormSubmit(props: UseFormSubmitProps) {
  const router = useRouter();
  const params = useParams();
  const borrowerIdFromUrl = params.id as string;

  const [borrowersId, setBorrowersId] = useState<string | undefined>(props.borrowersId);
  const [isFetchingBorrower, setIsFetchingBorrower] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch borrower details using your backend route
  useEffect(() => {
    if (!borrowerIdFromUrl) return;
    async function fetchBorrower() {
      try {
        setIsFetchingBorrower(true);
        const res = await fetch(`/api/borrowers/${borrowerIdFromUrl}`);
        if (!res.ok) throw new Error("Failed to fetch borrower");
        const data = await res.json();
        setBorrowersId(data.borrowerDetails?.id || borrowerIdFromUrl);
      } catch (err) {
        console.error("Error fetching borrower:", err);
      } finally {
        setIsFetchingBorrower(false);
      }
    }
    fetchBorrower();
  }, [borrowerIdFromUrl]);

  const handleSubmit = async () => {
    if (!borrowersId) return false; // ensure borrower is fetched
    const missing: string[] = [];

    // --- Basic Info Checks ---
    if (!props.appName.trim()) missing.push("Name");
    if (!props.appDob) missing.push("Date of Birth");
    if (!props.appContact.trim()) missing.push("Contact Number");
    if (!props.appEmail.trim()) missing.push("Email Address");
    if (!props.appMarital) missing.push("Marital Status");
    if (props.appMarital === "Married") {
      if (!props.appSpouseName.trim()) missing.push("Spouse Name");
      if (!props.appSpouseOccupation.trim()) missing.push("Spouse Occupation");
    }
    if (!props.appAddress.trim()) missing.push("Home Address");

    // Loan info
    if (!props.appLoanPurpose.trim()) missing.push("Loan Purpose");
    if (!props.selectedLoan) missing.push("Loan Amount");

    // Income & occupation
    if (!props.sourceOfIncome) missing.push("Source of Income");
    if (props.sourceOfIncome === "business") {
      if (!props.appTypeBusiness.trim()) missing.push("Type of Business");
      if (!props.appBusinessName.trim()) missing.push("Business Name");
      if (!props.appDateStarted) missing.push("Date Started");
      if (!props.appBusinessLoc.trim()) missing.push("Business Location");
      if (!props.appMonthlyIncome) missing.push("Monthly Income");
    } else {
      if (!props.appOccupation.trim()) missing.push("Occupation");
      if (!props.appEmploymentStatus.trim()) missing.push("Employment Status");
      if (!props.appCompanyName.trim()) missing.push("Company Name");
      if (!props.appMonthlyIncome) missing.push("Monthly Income");
    }

    // References
    props.appReferences.forEach((ref, i) => {
      if (!ref.name.trim()) missing.push(`Reference ${i + 1} Name`);
      if (!ref.contact.trim()) missing.push(`Reference ${i + 1} Contact`);
      if (!ref.relation.trim()) missing.push(`Reference ${i + 1} Relationship`);
    });

    // Agent - accept 'no agent' as valid, or any non-empty value
    if (!props.appAgent || (!props.appAgent.trim() && props.appAgent !== 'no agent')) {
      missing.push("Agent");
      props.setAgentMissingError(true);
    } else {
      props.setAgentMissingError(false);
    }

    // Collateral
    if (props.requiresCollateral) {
      if (!props.collateralType) missing.push("Collateral Type");
      if (!props.collateralValue) missing.push("Collateral Value");
      if (!props.collateralDescription) missing.push("Collateral Description");
      if (!props.ownershipStatus) missing.push("Ownership Status");
    }

    // Uploads - check exact document count
    if (props.photo2x2.length === 0) missing.push("2x2 Photo");
    if (props.uploadedFiles.length !== props.requiredDocumentsCount) missing.push("Document Upload");

    props.setMissingFields(missing);
    return missing.length === 0;
  };

  const performSubmit = async () => {
    if (!borrowersId) return { ok: false, error: "Borrower not loaded yet" };
    if (!props.selectedLoan) return { ok: false, error: "Loan not selected" };

    try {
      setIsSubmitting(true);
      setProgressOpen(true);
      setActiveStep(0);

      const formData = new FormData();
      formData.append("isReloan", "true");
      formData.append("borrowersId", borrowersId);
      formData.append("appName", props.appName);
      formData.append("appDob", props.appDob);
      formData.append("appContact", props.appContact);
      formData.append("appEmail", props.appEmail);
      formData.append("appMarital", props.appMarital);
      formData.append("appSpouseName", props.appSpouseName);
      formData.append("appSpouseOccupation", props.appSpouseOccupation);
      formData.append("appAddress", props.appAddress);
      formData.append("sourceOfIncome", props.sourceOfIncome);
      formData.append("appMonthlyIncome", String(props.appMonthlyIncome));

      if (props.sourceOfIncome === "business") {
        formData.append("appTypeBusiness", props.appTypeBusiness);
        formData.append("appBusinessName", props.appBusinessName);
        formData.append("appDateStarted", props.appDateStarted);
        formData.append("appBusinessLoc", props.appBusinessLoc);
      } else {
        formData.append("appOccupation", props.appOccupation);
        formData.append("appEmploymentStatus", props.appEmploymentStatus);
        formData.append("appCompanyName", props.appCompanyName);
      }

      formData.append("appLoanPurpose", props.appLoanPurpose);

      // Loan computation
      const baseLoan = props.selectedLoan.amount;
      const months = props.selectedLoan.months || 12;
      const interestRate = props.selectedLoan.interest / 100;
      const interestAmount = baseLoan * interestRate;
      const totalInterestAmount = interestAmount * months;
      const totalPayable = baseLoan + totalInterestAmount;

      let serviceFee = 0;
      if (baseLoan >= 10000 && baseLoan <= 20000) serviceFee = baseLoan * 0.05;
      else if (baseLoan > 20000 && baseLoan <= 45000) serviceFee = 1000;
      else if (baseLoan > 45000) serviceFee = baseLoan * 0.03;

      let netReleased = baseLoan - serviceFee;
      if (props.balanceDecision === "deduct") netReleased -= props.previousBalance;

      formData.append("appLoanAmount", String(baseLoan));
      formData.append("appLoanTerms", String(months));
      formData.append("appInterest", String(props.selectedLoan.interest));
      formData.append("appInterestAmount", String(interestAmount));
      formData.append("appTotalInterestAmount", String(totalInterestAmount));
      formData.append("appTotalPayable", String(totalPayable));
      formData.append("appServiceFee", String(serviceFee));
      formData.append("appNetReleased", String(netReleased));
      formData.append("previousBalance", String(props.previousBalance));
      formData.append("balanceDecision", props.balanceDecision);

      props.appReferences.forEach((ref, i) => {
        formData.append(`appReferences[${i}][name]`, ref.name);
        formData.append(`appReferences[${i}][contact]`, ref.contact);
        formData.append(`appReferences[${i}][relation]`, ref.relation);
      });

      formData.append("appAgent", props.appAgent);

      if (props.requiresCollateral) {
        formData.append("collateralType", props.collateralType);
        formData.append("collateralValue", String(props.collateralValue));
        formData.append("collateralDescription", props.collateralDescription);
        formData.append("ownershipStatus", props.ownershipStatus);
      }

      props.uploadedFiles.forEach((f) => formData.append("documents", f));
      if (props.photo2x2[0]) formData.append("profilePic", props.photo2x2[0]);

      formData.append("companyName", props.COMPANY_NAME);
      formData.append("termsAcceptedAt", new Date().toISOString());
      formData.append("termsVersion", props.TERMS_VERSION);
      formData.append("privacyVersion", props.PRIVACY_VERSION);
      formData.append("consentToTerms", "true");

      // Upload with progress
      setActiveStep(1);
      setUploadProgress(0);

      const uploadResult: { ok: boolean; response?: any } = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", props.API_URL, true);

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setUploadProgress(pct);
          }
        };

        xhr.onload = () => {
          try {
            const status = xhr.status;
            const json = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            if (status >= 200 && status < 300) resolve({ ok: true, response: json });
            else resolve({ ok: false, response: json });
          } catch {
            resolve({ ok: false, response: { error: "Invalid JSON response" } });
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload aborted"));

        xhr.send(formData);
      });

      setActiveStep(2);
      await new Promise((res) => setTimeout(res, 400));

      if (!uploadResult.ok) throw new Error(uploadResult.response?.error || "Submission failed");

      const data = uploadResult.response;
      const loanId = data.application?.applicationId || data.applicationId;

      if (props.onSuccess && loanId) props.onSuccess(loanId);

      return { ok: true, data };
    } catch (error: any) {
      console.error(error);
      if (props.onError) props.onError(error?.message || "An error occurred. Please try again.");
      return { ok: false, error };
    } finally {
      setIsSubmitting(false);
      setProgressOpen(false);
      setActiveStep(0);
    }
  };

  return { handleSubmit, performSubmit, isSubmitting, progressOpen, activeStep, uploadProgress, isFetchingBorrower, borrowersId };
}
