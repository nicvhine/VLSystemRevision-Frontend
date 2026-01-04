"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useSearchParams } from "next/navigation";
import { ButtonDotsLoading, SubmitProgressModal } from "@/app/commonComponents/utils/loading";
import { useRouter } from "next/navigation";

import BasicInformation from "./sections/basicInformation";
import SourceOfIncome from "./sections/sourceOfIncome";
import References from "./sections/references";
import CollateralInformation from "./sections/collateral";
import LoanDetails from "./sections/loanDetails";
import UploadSection from "./sections/uploadSection";
import AgentDropdown from "./sections/agent";

import { ErrorModal, DocumentUploadErrorModal } from "./modals/errorModal";
import SuccessModalWithAnimation from "./modals/successModal";
import RegularAgreementModal from '@/app/commonComponents/modals/applicationTerms/regularLoan/modal';
import OpenAgreementModal from '@/app/commonComponents/modals/applicationTerms/openTerm/modal';

import { useUpdateMissingFields } from "./hooks/updateMissingFields";
import { useFormSubmit } from "./hooks/useFormSubmit";
import { handleFileChange, handleProfileChange, removeDocument, removeProfile } from "./function";
import { useSectionProgress } from "./hooks/useSectionProgress";
import { useFormPersistence } from "./hooks/useFormPersistence";
import { FormPersistenceNotification } from "./components/FormPersistenceNotification";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

interface FormAreaProps {
  loanType: string;
  language: "en" | "ceb";
  isMobile?: boolean;
  onProgressUpdate?: (progress: {
    done: Record<string, boolean>;
    missingCounts: Record<string, number>;
    missingDetails: Record<string, string[]>;
  }) => void;
  onShowTermsModal?: () => void;
}

export default forwardRef<{ submitForm: () => Promise<void> }, FormAreaProps>(function FormArea({ loanType, language, isMobile, onProgressUpdate, onShowTermsModal }, ref) {
  const COMPANY_NAME = "Vistula Lending Corporation";
  const TERMS_VERSION = "1.0-draft";
  const PRIVACY_VERSION = "1.0-draft";

  const router = useRouter();

  const [loanId, setLoanId] = useState<string | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const loanTypeParam =
    loanType === "Regular Loan With Collateral"
      ? "with"
      : loanType === "Regular Loan Without Collateral"
      ? "without"
      : "open-term";

  const requiresCollateral = loanTypeParam === "with" || loanTypeParam === "open-term";
  const requiredDocumentsCount = loanTypeParam === "with" || loanTypeParam === "open-term" ? 6 : 4;
  const requires2x2 = true;
  const API_URL = `${BASE_URL}/loan-applications/apply/${loanTypeParam}`;

  // Basic Info
  const [appName, setAppName] = useState("");
  const [appDob, setAppDob] = useState("");
  const [appContact, setAppContact] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [appMarital, setAppMarital] = useState("");
  const [appChildren, setAppChildren] = useState(0);
  const [appSpouseName, setAppSpouseName] = useState("");
  const [appSpouseOccupation, setAppSpouseOccupation] = useState("");
  const [appAddress, setAppAddress] = useState("");
  const [borrowersId, setBorrowersId] = useState("");

  // Source of Income 
  const [sourceOfIncome, setSourceOfIncome] = useState("");
  const [appTypeBusiness, setAppTypeBusiness] = useState("");
  const [appBusinessName, setAppBusinessName] = useState("");
  const [appDateStarted, setAppDateStarted] = useState("");
  const [appBusinessLoc, setAppBusinessLoc] = useState("");
  const [appMonthlyIncome, setAppMonthlyIncome] = useState<number>(0);
  const [appOccupation, setAppOccupation] = useState("");
  const [appEmploymentStatus, setAppEmploymentStatus] = useState("");
  const [appCompanyName, setAppCompanyName] = useState("");
  const [occupationError, setOccupationError] = useState("");

  // References 
  const [appReferences, setAppReferences] = useState([
    { name: "", contact: "", relation: "" },
    { name: "", contact: "", relation: "" },
    { name: "", contact: "", relation: "" },
  ]);

  // Agent
  const [appAgent, setAppAgent] = useState("");
  const [agentMissingError, setAgentMissingError] = useState(false);

  // Collateral 
  const [collateralType, setCollateralType] = useState("");
  const [collateralValue, setCollateralValue] = useState<number>(0);
  const [collateralDescription, setCollateralDescription] = useState("");
  const [ownershipStatus, setOwnershipStatus] = useState("");
  const collateralTypeOptions = [
    { value: "", label: language === "en" ? "Choose Collateral Type" : "Pilia ang klase sa kolateral" },
    { value: "vehicle", label: language === "en" ? "Vehicle" : "Sakyanan" },
    { value: "land", label: language === "en" ? "Land" : "Yuta" },
    { value: "house", label: language === "en" ? "House" : "Balay" },
  ];

  // Loan
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [appLoanPurpose, setAppLoanPurpose] = useState("");
  const [customLoanAmount, setCustomLoanAmount] = useState<number | "">("");
  
  // Reloan data
  const [reloanData, setReloanData] = useState<any | null>(null);
  const [remainingBalanceOption, setRemainingBalanceOption] = useState<'add-to-principal' | 'deduct-from-receivable' | null>(null);

  // Uploads 
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [photo2x2, setPhoto2x2] = useState<File[]>([]);

  // Reset form function - clears all state to initial values
  const resetForm = () => {
    // Basic Info
    setAppName("");
    setAppDob("");
    setAppContact("");
    setAppEmail("");
    setAppMarital("");
    setAppChildren(0);
    setAppSpouseName("");
    setAppSpouseOccupation("");
    setAppAddress("");
    setBorrowersId("");

    // Source of Income
    setSourceOfIncome("");
    setAppTypeBusiness("");
    setAppBusinessName("");
    setAppDateStarted("");
    setAppBusinessLoc("");
    setAppMonthlyIncome(0);
    setAppOccupation("");
    setAppEmploymentStatus("");
    setAppCompanyName("");
    setOccupationError("");

    // References
    setAppReferences([
      { name: "", contact: "", relation: "" },
      { name: "", contact: "", relation: "" },
      { name: "", contact: "", relation: "" },
    ]);

    // Agent
    setAppAgent("");
    setAgentMissingError(false);

    // Collateral
    setCollateralType("");
    setCollateralValue(0);
    setCollateralDescription("");
    setOwnershipStatus("");

    // Loan
    setSelectedLoan(null);
    setAppLoanPurpose("");
    setCustomLoanAmount("");

    // Uploads
    setUploadedFiles([]);
    setPhoto2x2([]);
  };

  // Form persistence - save form data to localStorage
  const { clearSavedData } = useFormPersistence({
    formData: {
      appName, appDob, appContact, appEmail, appMarital, appChildren, appSpouseName, appSpouseOccupation, appAddress,
      sourceOfIncome, appTypeBusiness, appBusinessName, appDateStarted, appBusinessLoc, appMonthlyIncome,
      appOccupation, appEmploymentStatus, appCompanyName, appReferences, appAgent,
      collateralType, collateralValue, collateralDescription, ownershipStatus,
      selectedLoan, appLoanPurpose, customLoanAmount, loanType
    },
    setters: {
      setAppName, setAppDob, setAppContact, setAppEmail, setAppMarital, setAppChildren,
      setAppSpouseName, setAppSpouseOccupation, setAppAddress, setSourceOfIncome,
      setAppTypeBusiness, setAppBusinessName, setAppDateStarted, setAppBusinessLoc,
      setAppMonthlyIncome, setAppOccupation, setAppEmploymentStatus, setAppCompanyName,
      setAppReferences, setAppAgent, setCollateralType, setCollateralValue,
      setCollateralDescription, setOwnershipStatus, setSelectedLoan, setAppLoanPurpose, setCustomLoanAmount
    },
    storageKey: 'loanApplicationFormData',
    enabled: true,
  });

  // Compute section progress
  useSectionProgress({
    missingFields,
    photo2x2,
    requires2x2,
    appAgent,
    uploadedFiles,
    requiredDocumentsCount,
    onProgressUpdate,
  });

  // Document upload error modal
  const [showDocumentUploadErrorModal, setShowDocumentUploadErrorModal] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState("");

  // Hooks
  useUpdateMissingFields({
    appName, appDob, appContact, appEmail, appMarital, appSpouseName, appSpouseOccupation, appAddress,
    appLoanPurpose, selectedLoan, sourceOfIncome, appTypeBusiness, appBusinessName, appDateStarted,
    appBusinessLoc, appMonthlyIncome, appOccupation, appEmploymentStatus, appCompanyName, appReferences,
    requiresCollateral, requires2x2, collateralType, collateralValue, collateralDescription, ownershipStatus, appAgent,
    photo2x2, uploadedFiles, requiredDocumentsCount, missingFields, setMissingFields,
  });

  const { handleSubmit, performSubmit, isSubmitting, progressOpen, activeStep, uploadProgress } = useFormSubmit({
    appName, appDob, appContact, appEmail, appMarital, appSpouseName, appSpouseOccupation, appAddress,
    appLoanPurpose, selectedLoan, sourceOfIncome, appTypeBusiness, appBusinessName, appDateStarted,
    appBusinessLoc, appMonthlyIncome, appOccupation, appEmploymentStatus, appCompanyName, appReferences,
    requiresCollateral, collateralType, collateralValue, collateralDescription, ownershipStatus, appAgent,
    photo2x2, uploadedFiles, requiredDocumentsCount, missingFields, setMissingFields, setAgentMissingError,
    API_URL, COMPANY_NAME, TERMS_VERSION, PRIVACY_VERSION, language,
    borrowersId,
    reloanData,
    remainingBalanceOption,
  });

  const [showAgreementModal, setShowAgreementModal] = useState(false);

  // Expose submission method to parent component
  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      try {
        const result = await performSubmit();
        if (result.ok && result.data.application?.applicationId) {
          setLoanId(result.data.application.applicationId);
          setShowSuccessModal(true);
          // Clear saved form data after successful submission
          clearSavedData();
        } else {
          setErrorMessage(result.error?.message || "Submission failed");
          setShowErrorModal(true);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Submission failed");
        setShowErrorModal(true);
      }
    }
  }));

  useEffect(() => {
    if (appAgent.trim()) setAgentMissingError(false);
  }, [appAgent]);

  // Load reloan data from URL params
  const searchParams = useSearchParams();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reloanParam = searchParams.get('reloan');
    if (reloanParam) {
      try {
        const data = JSON.parse(decodeURIComponent(reloanParam));
        setReloanData(data);
      } catch (err) {
        console.error('Failed to parse reloan data:', err);
      }
    }
  }, [searchParams]);

  // Load current borrower id from localStorage (set by auth flow)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = localStorage.getItem("borrowersId");
    if (id) setBorrowersId(id);

    // Prefill name / email / phone from localStorage when available
    const storedName = localStorage.getItem("fullName") || localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    const storedPhone = localStorage.getItem("phoneNumber") || localStorage.getItem("phone");

    if (storedName && !appName) setAppName(storedName);
    if (storedEmail && !appEmail) setAppEmail(storedEmail);
    if (storedPhone && !appContact) setAppContact(storedPhone);
  }, []);

  // Fetch and prefill from previous application
  useEffect(() => {
    const prefillFromPreviousApplication = async () => {
      try {
        if (!borrowersId) return;
        
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/borrowers/${borrowersId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (!res.ok) return;
        
        const data = await res.json();
        const prevApp = data.latestApplication;
        
        if (!prevApp) return;
        
        // Prefill basic information
        if (prevApp.appName && !appName) setAppName(prevApp.appName);
        if (prevApp.appDob && !appDob) setAppDob(prevApp.appDob);
        if (prevApp.appContact && !appContact) setAppContact(prevApp.appContact);
        if (prevApp.appEmail && !appEmail) setAppEmail(prevApp.appEmail);
        if (prevApp.appMarital && !appMarital) setAppMarital(prevApp.appMarital);
        if (prevApp.appChildren && appChildren === 0) setAppChildren(prevApp.appChildren);
        if (prevApp.appSpouseName && !appSpouseName) setAppSpouseName(prevApp.appSpouseName);
        if (prevApp.appSpouseOccupation && !appSpouseOccupation) setAppSpouseOccupation(prevApp.appSpouseOccupation);
        if (prevApp.appAddress && !appAddress) setAppAddress(prevApp.appAddress);
        
        // Prefill source of income
        if (prevApp.sourceOfIncome && !sourceOfIncome) setSourceOfIncome(prevApp.sourceOfIncome);
        if (prevApp.appTypeBusiness && !appTypeBusiness) setAppTypeBusiness(prevApp.appTypeBusiness);
        if (prevApp.appBusinessName && !appBusinessName) setAppBusinessName(prevApp.appBusinessName);
        if (prevApp.appDateStarted && !appDateStarted) setAppDateStarted(prevApp.appDateStarted);
        if (prevApp.appBusinessLoc && !appBusinessLoc) setAppBusinessLoc(prevApp.appBusinessLoc);
        if (prevApp.appMonthlyIncome && appMonthlyIncome === 0) setAppMonthlyIncome(prevApp.appMonthlyIncome);
        if (prevApp.appOccupation && !appOccupation) setAppOccupation(prevApp.appOccupation);
        if (prevApp.appEmploymentStatus && !appEmploymentStatus) setAppEmploymentStatus(prevApp.appEmploymentStatus);
        if (prevApp.appCompanyName && !appCompanyName) setAppCompanyName(prevApp.appCompanyName);
        
        // Prefill references
        if (prevApp.appReferences && Array.isArray(prevApp.appReferences) && appReferences[0].name === "") {
          setAppReferences(prevApp.appReferences);
        }
        
        // Prefill collateral information
        if (requiresCollateral) {
          if (prevApp.collateralType && !collateralType) setCollateralType(prevApp.collateralType);
          if (prevApp.collateralValue && collateralValue === 0) setCollateralValue(prevApp.collateralValue);
          if (prevApp.collateralDescription && !collateralDescription) setCollateralDescription(prevApp.collateralDescription);
          if (prevApp.ownershipStatus && !ownershipStatus) setOwnershipStatus(prevApp.ownershipStatus);
        }
        
        // Prefill loan purpose
        if (prevApp.appLoanPurpose && !appLoanPurpose) setAppLoanPurpose(prevApp.appLoanPurpose);
        
      } catch (err) {
        console.error("Error prefilling from previous application:", err);
      }
    };
    
    prefillFromPreviousApplication();
  }, [borrowersId]);

  return (
    <div className="relative max-w-4xl mx-auto py-0">
      {/* Progress Modal */}
      <SubmitProgressModal
        open={progressOpen}
        activeStep={activeStep}
        uploadProgress={uploadProgress}
        title={language === "en" ? "Submitting Application" : "Pag-submit sa Aplikasyon"}
        subtitle={
          language === "en"
            ? "Please keep this window open while we process your request."
            : "Palihog ayaw isira kini nga bintana samtang among gi-proseso ang imong hangyo."
        }
        steps={[
          language === "en" ? "Uploading documents" : "Nag-upload sa mga dokumento",
          language === "en" ? "Processing application" : "Nagproseso sa aplikasyon",
          language === "en" ? "Waiting for the server" : "Naghulat sa server",
        ]}
        blockDismiss
      />

      {/* Document upload error */}
      {showDocumentUploadErrorModal && (
        <DocumentUploadErrorModal
          message={documentUploadError}
          onClose={() => setShowDocumentUploadErrorModal(false)}
        />
      )}

      <div className={`${isSubmitting ? "pointer-events-none opacity-60" : ""}`}>
        {/* Persistence Notification */}
        <FormPersistenceNotification 
          language={language}
          onClearData={() => {
            clearSavedData();
            // Also clear loan type
            if (typeof window !== 'undefined') {
              localStorage.removeItem('selectedLoanType');
            }
            // Reload to reset form
            window.location.reload();
          }}
          storageKey="loanApplicationFormData"
        />

        {/* Form Sections */}
        <div id="basicInfo">
          <BasicInformation
            language={language} appName={appName} setAppName={setAppName} appDob={appDob} setAppDob={setAppDob}
            appContact={appContact} setAppContact={setAppContact} appEmail={appEmail} setAppEmail={setAppEmail}
            appMarital={appMarital} setAppMarital={setAppMarital} appChildren={appChildren} setAppChildren={setAppChildren}
            appSpouseName={appSpouseName} setAppSpouseName={setAppSpouseName} appSpouseOccupation={appSpouseOccupation}
            setAppSpouseOccupation={setAppSpouseOccupation} appAddress={appAddress} setAppAddress={setAppAddress}
            appReferences={appReferences} missingFields={missingFields} borrowersId={borrowersId} resetForm={resetForm}
          />
        </div>

        <div id="income">
          <SourceOfIncome
            language={language} sourceOfIncome={sourceOfIncome} setSourceOfIncome={setSourceOfIncome}
            appTypeBusiness={appTypeBusiness} setAppTypeBusiness={setAppTypeBusiness} appBusinessName={appBusinessName}
            setAppBusinessName={setAppBusinessName} appDateStarted={appDateStarted} setAppDateStarted={setAppDateStarted}
            appBusinessLoc={appBusinessLoc} setAppBusinessLoc={setAppBusinessLoc} appMonthlyIncome={appMonthlyIncome}
            setAppMonthlyIncome={setAppMonthlyIncome} appOccupation={appOccupation} setAppOccupation={setAppOccupation}
            occupationError={occupationError} setOccupationError={setOccupationError}
            appEmploymentStatus={appEmploymentStatus} setAppEmploymentStatus={setAppEmploymentStatus}
            appCompanyName={appCompanyName} setAppCompanyName={setAppCompanyName} missingFields={missingFields}
          />
        </div>

        <div id="references">
          <References language={language} appReferences={appReferences} setAppReferences={setAppReferences}
            appContact={appContact} appName={appName} appSpouseName={appSpouseName} missingFields={missingFields} />
        </div>

        <div id="agent">
          <AgentDropdown language={language} appAgent={appAgent} setAppAgent={setAppAgent} missingError={agentMissingError} />
        </div>

        {requiresCollateral && (
          <div id="collateral">
            <CollateralInformation
              language={language} collateralType={collateralType} setCollateralType={setCollateralType}
              collateralValue={collateralValue} setCollateralValue={setCollateralValue}
              collateralDescription={collateralDescription} setCollateralDescription={setCollateralDescription}
              ownershipStatus={ownershipStatus} setOwnershipStatus={setOwnershipStatus}
              collateralTypeOptions={collateralTypeOptions} missingFields={missingFields}
            />
          </div>
        )}

        <div id="loanDetails">
          <LoanDetails
            language={language} loanType={loanTypeParam} appLoanPurpose={appLoanPurpose} setAppLoanPurpose={setAppLoanPurpose}
            onLoanSelect={(loan) => setSelectedLoan(loan)} missingFields={missingFields}
            customLoanAmount={customLoanAmount} setCustomLoanAmount={setCustomLoanAmount}
            selectedLoan={selectedLoan}
            reloanData={reloanData}
            remainingBalanceOption={remainingBalanceOption}
            setRemainingBalanceOption={setRemainingBalanceOption}
          />
        </div>

        <div id="photo2x2_and_documents">
          <UploadSection
            language={language} photo2x2={photo2x2} documents={uploadedFiles}
            handleProfileChange={(e) =>
              handleProfileChange(e, setPhoto2x2, language, setDocumentUploadError, setShowDocumentUploadErrorModal)
            }
            handleFileChange={(e) =>
              handleFileChange(e, uploadedFiles, setUploadedFiles, requiredDocumentsCount, language,
                setDocumentUploadError, setShowDocumentUploadErrorModal)
            }
            removeProfile={() => removeProfile(setPhoto2x2)}
            removeDocument={(index) => removeDocument(index, uploadedFiles, setUploadedFiles)}
            missingFields={missingFields} requiredDocumentsCount={requiredDocumentsCount}
          />
        </div>
      </div>

      {showErrorModal && <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />}

      {/* Submit Button */}
      <div className={`mt-6 flex ${isMobile ? "justify-center" : "justify-end"}`}>
        <button
          onClick={async () => {
            if (isSubmitting) return;
            const valid = await handleSubmit();
            if (!valid) {
              setErrorMessage(
                language === "en"
                  ? "Please complete all required fields before submitting."
                  : "Palihug isulod ang tanang kinahanglan nga detalye una sa pag-submit."
              );
              setShowErrorModal(true);
              return;
            }
            // show loan agreement modal instead of terms & policy
            setShowAgreementModal(true);
          }}
          disabled={isSubmitting}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <ButtonDotsLoading label={language === "en" ? "Submitting" : "Nag-submit"} />
            : language === "en" ? "Submit Application" : "Isumite ang Aplikasyon"}
        </button>
      </div>

      {showSuccessModal && (
        <SuccessModalWithAnimation
          language={language} loanId={loanId}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Agreement Modal shown before final submit - Different modal based on loan type */}
      {loanTypeParam === 'open-term' ? (
        <OpenAgreementModal
          isOpen={showAgreementModal}
          onClose={() => setShowAgreementModal(false)}
          application={{
            appName,
            appAddress,
            appLoanAmount: remainingBalanceOption === 'add-to-principal' && reloanData?.remainingBalance 
              ? (selectedLoan?.amount || 0) + reloanData.remainingBalance
              : selectedLoan?.amount || (customLoanAmount || 0),
            appInterestRate: selectedLoan?.interest || 0,
            appLoanTerms: selectedLoan?.months || null,
            appTotalPayable: selectedLoan?.amount || 0,
            dateDisbursed: new Date().toISOString(),
          }}
          onAccept={async () => {
            setShowAgreementModal(false);
            try {
              const result = await performSubmit();
              if (result.ok && result.data.application?.applicationId) {
                setLoanId(result.data.application.applicationId);
                setShowSuccessModal(true);
                clearSavedData();
              } else {
                setErrorMessage(result.error?.message || "Submission failed");
                setShowErrorModal(true);
              }
            } catch (err: any) {
              setErrorMessage(err.message || "Submission failed");
              setShowErrorModal(true);
            }
          }}
        />
      ) : (
        <RegularAgreementModal
          isOpen={showAgreementModal}
          onClose={() => setShowAgreementModal(false)}
          application={{
            appName,
            appAddress,
            appLoanAmount: remainingBalanceOption === 'add-to-principal' && reloanData?.remainingBalance 
              ? (selectedLoan?.amount || 0) + reloanData.remainingBalance
              : selectedLoan?.amount || (customLoanAmount || 0),
            appInterestRate: selectedLoan?.interest || 0,
            appLoanTerms: selectedLoan?.months || null,
            appTotalPayable: selectedLoan?.amount && selectedLoan?.interest && selectedLoan?.months
              ? selectedLoan.amount * (1 + (selectedLoan.interest * selectedLoan.months) / 100)
              : null,
            dateDisbursed: new Date().toISOString(),
          }}
          onAccept={async () => {
            setShowAgreementModal(false);
            try {
              const result = await performSubmit();
              if (result.ok && result.data.application?.applicationId) {
                setLoanId(result.data.application.applicationId);
                setShowSuccessModal(true);
                clearSavedData();
              } else {
                setErrorMessage(result.error?.message || "Submission failed");
                setShowErrorModal(true);
              }
            } catch (err: any) {
              setErrorMessage(err.message || "Submission failed");
              setShowErrorModal(true);
            }
          }}
        />
      )}
    </div>
  );
});
