"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// Components
import SuccessModal from "../../modals/successModal";
import ErrorModal from "../../modals/errorModal";
import ConfirmModal from "../../modals/confirmModal";
import LoanAgreementModal from "@/app/commonComponents/modals/loanAgreement/regularLoan/modal";
import OpenLoanAgreementModal from "@/app/commonComponents/modals/loanAgreement/openTerm/modal";
import ReleaseForm from "../../modals/loanAgreement/regularLoan/releaseForm";
import SetScheduleModal from "@/app/commonComponents/modals/loanApplication/scheduleModal";
import AccountModal from "@/app/commonComponents/modals/loanApplication/accountModal";
import ViewCIChecklistModal from "@/app/commonComponents/modals/loanApplication/viewCIChecklistModal";
import ApplicationButtons from "./components/applicationButtons";

// Wrappers
import Head from "@/app/userPage/headPage/layout";
import Manager from "@/app/userPage/managerPage/layout";
import LoanOfficer from "@/app/userPage/loanOfficerPage/layout";

// Hooks
import { useApplicationData } from "./hooks";
import { authFetch } from "../function";

// Cards
import ProfileCard from "./cards/profileCard";
import BasicInfoCard from "./cards/basicInfoCard";
import LoanComputationCard from "./cards/loanComputationCard";
import IncomeCharactedCard from "./cards/incomeCharacterCard";

// Translation 
import { translateLoanType } from "../../utils/formatters";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; 

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const {
    applications,
    setApplications,
    loading,
    role,
    language,
    t,
    l,
    a,
  } = useApplicationData(`${BASE_URL}/loan-applications`);

  const [isEditing, setIsEditing] = useState(false);
  const [basicInfoData, setBasicInfoData] = useState<any>({});
  const [profileData, setProfileData] = useState<any>({});
  const [incomeData, setIncomeData] = useState<any>({});
  const [referencesData, setReferencesData] = useState<any>([]);
  const [collateralData, setCollateralData] = useState<any>({});
  const [agentData, setAgentData] = useState<any>(null);

  const [isAgreementOpen, setIsAgreementOpen] = useState<"loan" | "release" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<any>(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [withdrawalConfirmModal, setWithdrawalConfirmModal] = useState<{ show: boolean; action: 'approve' | 'deny' | null; reason: string }>({ show: false, action: null, reason: '' });
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [expandWithdrawal, setExpandWithdrawal] = useState(false);
  const [showCIChecklistModal, setShowCIChecklistModal] = useState(false);

  const notFoundText = language === 'ceb' ? 'Wala nakit-an ang aplikasyon' : 'Application not found';

  const showSuccess = (msg: string) => {
    setErrorModalOpen(false);
    setSuccessMessage(msg);
    setSuccessModalOpen(true);
    setTimeout(() => setSuccessModalOpen(false), 5000);
  };

  const showError = (msg: string) => {
    setSuccessModalOpen(false);
    setErrorMessage(msg);
    setErrorModalOpen(true);
    setTimeout(() => setErrorModalOpen(false), 3000);
  };

  const Wrapper = role === "head" ? Head : role === "manager" ? Manager : LoanOfficer;

  const application = Array.isArray(applications) 
    ? applications.find((app) => app.applicationId === id)
    : undefined;

  // Listen for application updates (file uploads/deletes)
  useEffect(() => {
    const handleApplicationUpdate = (event: any) => {
      const updatedApp = event.detail;
      setApplications((prev: any) =>
        prev.map((app: any) =>
          app.applicationId === updatedApp.applicationId ? updatedApp : app
        )
      );
    };

    window.addEventListener('applicationUpdated', handleApplicationUpdate);
    return () => window.removeEventListener('applicationUpdated', handleApplicationUpdate);
  }, [setApplications]);

  // Sync local data with application (but NOT when editing to prevent overwriting user changes)
  useEffect(() => {
    if (!application) return;
    
    // Only sync if not currently editing
    if (isEditing) return;

    setBasicInfoData({
      appDob: application.appDob || "",
      appAddress: application.appAddress || "",
      appMarital: application.appMarital || "",
      appSpouseName: application.appSpouseName || "",
      appSpouseOccupation: application.appSpouseOccupation || "",
      appChildren: application.appChildren || "",
    });
    setProfileData({
      appName: application.appName || "",
      appEmail: application.appEmail || "",
      appContact: application.appContact || "",
    });
    setIncomeData({
      sourceOfIncome: application.sourceOfIncome || "",
      appOccupation: application.appOccupation || "",
      appCompanyName: application.appCompanyName || "",
      appEmploymentStatus: application.appEmploymentStatus || "",
      appTypeBusiness: application.appTypeBusiness || "",
      appBusinessName: application.appBusinessName || "",
      appDateStarted: application.appDateStarted || "",
      appBusinessLoc: application.appBusinessLoc || "",
      appMonthlyIncome: application.appMonthlyIncome || "",
    });
    setReferencesData(application.appReferences || []);
    setCollateralData({
      collateralType: application.collateralType || "",
      collateralDescription: application.collateralDescription || "",
      ownershipStatus: (application as any).ownershipStatus || (application as any).ownershipStatys || "",
      collateralValue: application.collateralValue || "",
    });
    setAgentData((application as any).appAgent || null);
  }, [application, isEditing]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset all form data to original application values
    if (application) {
      setBasicInfoData({
        appDob: application.appDob || "",
        appAddress: application.appAddress || "",
        appMarital: application.appMarital || "",
        appSpouseName: application.appSpouseName || "",
        appSpouseOccupation: application.appSpouseOccupation || "",
        appChildren: application.appChildren || "",
      });
      setProfileData({
        appName: application.appName || "",
        appEmail: application.appEmail || "",
        appContact: application.appContact || "",
      });
      setIncomeData({
        sourceOfIncome: application.sourceOfIncome || "",
        appOccupation: application.appOccupation || "",
        appCompanyName: application.appCompanyName || "",
        appEmploymentStatus: application.appEmploymentStatus || "",
        appTypeBusiness: application.appTypeBusiness || "",
        appBusinessName: application.appBusinessName || "",
        appDateStarted: application.appDateStarted || "",
        appBusinessLoc: application.appBusinessLoc || "",
        appMonthlyIncome: application.appMonthlyIncome || "",
      });
      setReferencesData(application.appReferences || []);
      setCollateralData({
        collateralType: application.collateralType || "",
        collateralDescription: application.collateralDescription || "",
        ownershipStatus: (application as any).ownershipStatus || (application as any).ownershipStatys || "",
        collateralValue: application.collateralValue || "",
      });
      setAgentData((application as any).appAgent || null);
    }
  };

  const handleSaveBasicInfo = async () => {
    setIsSaving(true);
    try {
      // Validation checks
      const errors: string[] = [];

      // Validate name (at least 2 words)
      if (profileData.appName) {
        const words = profileData.appName.trim().split(/\s+/).filter(Boolean);
        if (words.length < 2) {
          errors.push("Name must include at least first and last name");
        }
      }

      // Validate contact number
      if (profileData.appContact && !/^09\d{9}$/.test(profileData.appContact)) {
        errors.push("Contact number must start with 09 and be exactly 11 digits");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (profileData.appEmail && !emailRegex.test(profileData.appEmail)) {
        errors.push("Please enter a valid email address");
      }

      // Validate spouse name if married
      if (basicInfoData.appMarital === "Married" && basicInfoData.appSpouseName) {
        const spouseWords = basicInfoData.appSpouseName.trim().split(/\s+/).filter(Boolean);
        if (spouseWords.length < 2) {
          errors.push("Spouse name must include at least first and last name");
        }
      }

      // Validate reference contact numbers
      if (referencesData && referencesData.length > 0) {
        referencesData.forEach((ref: any, index: number) => {
          if (ref.contact && !/^09\d{9}$/.test(ref.contact)) {
            errors.push(`Reference ${index + 1} contact number must start with 09 and be exactly 11 digits`);
          }
        });
      }

      // If there are validation errors, show them and don't save
      if (errors.length > 0) {
        showError(errors.join(". "));
        setShowSaveConfirm(false);
        setIsSaving(false);
        return;
      }

      const updateData = {
        ...basicInfoData,
        ...profileData,
        ...incomeData,
        appReferences: referencesData,
        ...collateralData,
        appAgent: agentData,
      };

      const res = await authFetch(`${BASE_URL}/loan-applications/${application?.applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Failed to update application");

      const updatedApp = await res.json();

      setApplications((prev: any) =>
        prev.map((app: any) =>
          app.applicationId === updatedApp.applicationId ? updatedApp : app
        )
      );

      setIsEditing(false);
      setShowSaveConfirm(false);
      showSuccess("Application updated successfully!");
    } catch (err: any) {
      console.error(err);
      showError(err.message || "Failed to update application");
      setShowSaveConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!application && !loading) {
    return (
      <Wrapper>
        <div className="min-h-screen bg-gray-50">
          <div className="p-10 text-center text-gray-600 text-lg">
            {notFoundText}
          </div>
        </div>
      </Wrapper>
    );
  }
 
  return (
    <Wrapper>
      <div className="min-h-screen bg-gray-50">
        <div id="modal-root"></div>

        {/* HEADER */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                {/* Back Button */}
                <button
                  onClick={() => (typeof window !== "undefined" ? window.history.back() : null)}
                  className="mt-1 p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  aria-label="Go back"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L9.06 12l6.72 6.72a.75.75 0 11-1.06 1.06l-7.25-7.25a.75.75 0 010-1.06l7.25-7.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                  </svg>
                </button>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {l.t34} |{" "}
                    <span className="text-sm font-normal text-gray-500">
                      {application?.applicationId}
                    </span>
                  </h1>

                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      application?.status === "Applied" ? "bg-red-100 text-red-800" :
                      application?.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      application?.status === "Approved" ? "bg-green-100 text-green-800" :
                      application?.status === "Denied" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {application?.status || "Unknown"}
                    </span>

                    {(application?.status === "Cleared" || application?.status === "Approved" || application?.status === "Disbursed" || application?.status === "Active") && (
                      <button
                        onClick={() => setShowCIChecklistModal(true)}
                        title="View CI Checklist"
                        className="inline-flex items-center justify-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium"
                      >
                        📋 View CI Checklist
                      </button>
                    )}

                    <span className="text-sm text-gray-500">
                      {translateLoanType(application?.loanType, language)}
                    </span>
                  </div>

                  {(application?.status === "Denied" || application?.status === "Denied by LO") && (
                    <span className="text-sm text-red-600 mt-5">
                      Loan denied due to: {application?.denialReason}
                    </span>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center sm:justify-end space-x-3">

                <ApplicationButtons
                  application={application!}
                  role={role}
                  setApplications={setApplications}
                  authFetch={authFetch}
                  API_URL={`${BASE_URL}`}
                  setIsModalOpen={setIsModalOpen}
                  setIsAgreementOpen={setIsAgreementOpen}
                  modalRef={modalRef}
                  a={a}
                  showSuccess={showSuccess}
                  showError={showError}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Pending Withdrawal Request Card */}
          {(application as any)?.pendingWithdrawalRequest && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandWithdrawal(!expandWithdrawal)}
              className="w-full p-5 flex items-center justify-between hover:bg-orange-100/50 transition-colors"
            >
              <div className="flex items-center gap-3 text-left flex-1">
                <div className="p-2 rounded-full bg-orange-100 flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-orange-900">Withdrawal Request Pending</h3>
              </div>
              <svg className={`w-5 h-5 text-orange-600 transition-transform flex-shrink-0 ${expandWithdrawal ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {expandWithdrawal && (
              <div className="px-5 pb-5 border-t border-orange-200 bg-white">
                <p className="text-xs text-orange-800 mb-4 pt-3"><strong>Reason:</strong> {(application as any)?.withdrawalReason}</p>
                
                {role === 'loan_officer' || role === 'loan officer' || role === 'manager' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWithdrawalConfirmModal({ show: true, action: 'approve', reason: '' })}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setWithdrawalConfirmModal({ show: true, action: 'deny', reason: '' })}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-xs"
                    >
                      Deny
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-orange-700 italic">Awaiting loan officer approval</p>
                )}
              </div>
            )}
          </div>
        )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col h-full">
              <ProfileCard 
                application={application} 
                isEditing={isEditing}
                profileData={profileData}
                setProfileData={setProfileData}
              />
              <BasicInfoCard
                application={application}
                l={l}
                isEditing={isEditing}
                basicInfoData={basicInfoData}
                setBasicInfoData={setBasicInfoData}
              />
            </div>

            <div className="lg:col-span-1 flex flex-col h-full">
              <IncomeCharactedCard 
                application={application} 
                l={l} 
                t={t}
                isEditing={isEditing}
                incomeData={incomeData}
                setIncomeData={setIncomeData}
                referencesData={referencesData}
                setReferencesData={setReferencesData}
                collateralData={collateralData}
                setCollateralData={setCollateralData}
                agentData={agentData}
                setAgentData={setAgentData}
                showSuccess={showSuccess}
                showError={showError}
              />
            </div>

            <div className="lg:col-span-1 flex flex-col h-full">
              <LoanComputationCard application={application} t={t} l={l} />
            </div>
          </div>
        </div>

        {/* Modals */}
        <SetScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          application={application}
          setApplications={setApplications}
          authFetch={authFetch}
          showError={showError}
          showSuccess={showSuccess}
          a={a}
        />
        <ErrorModal
          isOpen={errorModalOpen}
          message={errorMessage}
          onClose={() => setErrorModalOpen(false)}
        />
        <SuccessModal
          isOpen={successModalOpen}
          message={successMessage}
          onClose={() => setSuccessModalOpen(false)}
        />

        {isAgreementOpen === "loan" && (
          application?.loanType === "Open-Term Loan" ? (
            <OpenLoanAgreementModal
              isOpen={true}
              onClose={() => setIsAgreementOpen(null)}
              application={application ?? null}
            />
          ) : (
            <LoanAgreementModal
              isOpen={true}
              onClose={() => setIsAgreementOpen(null)}
              application={application ?? null}
            />
          )
        )}

        {isAgreementOpen === "release" && (
          <ReleaseForm
            isOpen={true}
            onClose={() => setIsAgreementOpen(null)}
            application={(application as any) ?? null}
          />
        )}

        <AccountModal ref={modalRef} a={a} />

        {/* Save Confirmation Modal */}
        <ConfirmModal
          show={showSaveConfirm}
          title="Confirm Save"
          message="Are you sure you want to save these changes to the loan application?"
          confirmLabel="Save Changes"
          cancelLabel="Cancel"
          processingLabel="Saving..."
          onConfirm={handleSaveBasicInfo}
          onCancel={() => setShowSaveConfirm(false)}
          loading={isSaving}
        />

        {/* Withdrawal Confirmation Modal */}
        {withdrawalConfirmModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {withdrawalConfirmModal.action === 'approve' 
                  ? 'Approve Withdrawal Request' 
                  : 'Deny Withdrawal Request'}
              </h3>
              
              {withdrawalConfirmModal.action === 'deny' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Denial Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={withdrawalConfirmModal.reason}
                    onChange={(e) => setWithdrawalConfirmModal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Enter reason for denial..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              )}

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Applicant's Reason:</strong>
                </p>
                <p className="text-sm text-gray-700 mt-1 italic">{application?.withdrawalReason}</p>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                {withdrawalConfirmModal.action === 'approve' 
                  ? 'This will mark the application status as "Withdrawn".' 
                  : 'This will deny the withdrawal request and return the application to "Applied" status.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setWithdrawalConfirmModal({ show: false, action: null, reason: '' })}
                  disabled={isProcessingWithdrawal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (withdrawalConfirmModal.action === 'deny' && !withdrawalConfirmModal.reason.trim()) {
                      showError('Please enter a denial reason');
                      return;
                    }
                    
                    setIsProcessingWithdrawal(true);
                    try {
                      const endpoint = withdrawalConfirmModal.action === 'approve' 
                        ? 'approve-withdrawal' 
                        : 'deny-withdrawal';
                      
                      const res = await authFetch(
                        `${BASE_URL}/loan-applications/${application?.applicationId}/${endpoint}`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: withdrawalConfirmModal.action === 'deny' 
                            ? JSON.stringify({ denialReason: withdrawalConfirmModal.reason })
                            : '{}',
                        }
                      );
                      
                      if (!res.ok) throw new Error('Failed to process withdrawal request');
                      
                      const updated = await res.json();
                      setApplications((prev: any) =>
                        prev.map((app: any) =>
                          app.applicationId === updated.applicationId ? updated : app
                        )
                      );
                      
                      setWithdrawalConfirmModal({ show: false, action: null, reason: '' });
                      showSuccess(
                        withdrawalConfirmModal.action === 'approve' 
                          ? 'Withdrawal approved successfully!' 
                          : 'Withdrawal denied successfully!'
                      );
                    } catch (err: any) {
                      showError(err.message || 'Error processing withdrawal request');
                    } finally {
                      setIsProcessingWithdrawal(false);
                    }
                  }}
                  disabled={isProcessingWithdrawal || (withdrawalConfirmModal.action === 'deny' && !withdrawalConfirmModal.reason.trim())}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all ${
                    withdrawalConfirmModal.action === 'approve' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessingWithdrawal ? 'Processing...' : (withdrawalConfirmModal.action === 'approve' ? 'Approve' : 'Deny')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CI Checklist Modal */}
        {application && (
          <ViewCIChecklistModal
            isOpen={showCIChecklistModal}
            onCloseAction={() => setShowCIChecklistModal(false)}
            applicationId={application.applicationId}
            authFetchAction={authFetch}
          />
        )}
      </div>
    </Wrapper>
  );
}
