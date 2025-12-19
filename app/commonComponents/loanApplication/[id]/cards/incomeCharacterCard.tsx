"use client";

import React, { useState, useRef } from "react";
import { FiUser, FiFileText, FiPaperclip, FiPlus, FiTrash2 } from "react-icons/fi";
import { ApplicationDetailsTabsProps } from "@/app/commonComponents/utils/Types/components";
import { formatCurrency, capitalizeWords } from "@/app/commonComponents/utils/formatters";
import WithCollateral from "../customization/withCollateral";
import OpenTerm from "../customization/openTerm";
import { authFetch } from "../../function";
import ConfirmModal from "@/app/commonComponents/modals/confirmModal";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function IncomeCharactedCard({ 
  application, 
  l, 
  t, 
  isEditing,
  incomeData,
  setIncomeData,
  referencesData,
  setReferencesData,
  collateralData,
  setCollateralData,
  agentData,
  setAgentData,
  showSuccess,
  showError
}: ApplicationDetailsTabsProps & {
  isEditing?: boolean;
  incomeData?: any;
  setIncomeData?: any;
  referencesData?: any[];
  setReferencesData?: any;
  collateralData?: any;
  setCollateralData?: any;
  agentData?: any;
  setAgentData?: any;
  showSuccess?: (msg: string) => void;
  showError?: (msg: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"income" | "references" | "collateral">("income");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ fileName: string; filePath: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentChoice, setAgentChoice] = useState<'no-agent' | 'have-agent' | ''>('');

  // Fetch agents for dropdown
  React.useEffect(() => {
    if (isEditing) {
      const fetchAgents = async () => {
        setLoadingAgents(true);
        try {
          const res = await fetch(`${BASE_URL}/agents/names`);
          if (!res.ok) throw new Error("Failed to fetch agents");
          const data = await res.json();
          setAgents(data.agents || []);
        } catch (error) {
          console.error("Error fetching agents:", error);
        } finally {
          setLoadingAgents(false);
        }
      };
      fetchAgents();
    }
  }, [isEditing]);

  // Initialize agent choice based on current agentData
  React.useEffect(() => {
    if (agentData === null || agentData === 'no agent') {
      setAgentChoice('no-agent');
    } else if (agentData) {
      setAgentChoice('have-agent');
    }
  }, [agentData]);

  const handleAgentChoiceChange = (choice: 'no-agent' | 'have-agent') => {
    setAgentChoice(choice);
    if (choice === 'no-agent') {
      if (setAgentData) setAgentData(null);
    } else {
      if (setAgentData) setAgentData('');
    }
  };

  const handleIncomeChange = (field: string, value: string) => {
    if (setIncomeData) {
      setIncomeData({ ...incomeData, [field]: value });
    }
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    if (setReferencesData) {
      // Validate contact field
      if (field === "contact") {
        if (!/^\d*$/.test(value) || value.length > 11) {
          return; // Don't update if invalid
        }
      }
      // Validate name field
      if (field === "name") {
        if (!/^[A-Za-zñÑ.\-\s]*$/.test(value)) {
          return; // Don't update if invalid
        }
      }
      const updated = [...(referencesData || [])];
      updated[index] = { ...updated[index], [field]: value };
      setReferencesData(updated);
    }
  };

  const handleAddReference = () => {
    if (setReferencesData) {
      setReferencesData([...(referencesData || []), { name: "", contact: "", relation: "" }]);
    }
  };

  const handleRemoveReference = (index: number) => {
    if (setReferencesData && referencesData) {
      setReferencesData(referencesData.filter((_: any, i: number) => i !== index));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("documents", file);
      });

      const res = await authFetch(`${BASE_URL}/loan-applications/${application?.applicationId}/upload-documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload files");
      }

      const data = await res.json();
      
      // Update application in parent component without reloading
      if (application) {
        const updatedApplication = { ...application, documents: data.documents };
        // Trigger a re-fetch or update in parent
        window.dispatchEvent(new CustomEvent('applicationUpdated', { detail: updatedApplication }));
      }

      if (showSuccess) showSuccess("Files uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      if (showError) showError(err.message || "Failed to upload files");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = (fileName: string, filePath: string) => {
    setFileToDelete({ fileName, filePath });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    setDeleting(true);
    try {
      const res = await authFetch(`${BASE_URL}/loan-applications/${application?.applicationId}/delete-document`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileToDelete),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete file");
      }

      const data = await res.json();
      
      // Update application without reloading
      if (application) {
        const updatedApplication = { ...application, documents: data.documents };
        window.dispatchEvent(new CustomEvent('applicationUpdated', { detail: updatedApplication }));
      }

      if (showSuccess) showSuccess("File deleted successfully!");
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    } catch (err: any) {
      console.error(err);
      if (showError) showError(err.message || "Failed to delete file");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteFile = () => {
    setShowDeleteConfirm(false);
    setFileToDelete(null);
  };

  return (
    <div className="lg:col-span-1 flex flex-col h-full">

      {/* TAB NAVIGATION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-grow flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("income")}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "income"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {l.t2}
            </button>

            <button
              onClick={() => setActiveTab("references")}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "references"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {l.t3}
            </button>

            {(application?.loanType === "Regular Loan With Collateral" ||
              application?.loanType === "Open-Term Loan") && (
              <button
                onClick={() => setActiveTab("collateral")}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "collateral"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {l.t4}
              </button>
            )}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="p-6 flex-grow overflow-y-auto">

          {/* INCOME INFORMATION */}
          {activeTab === "income" && (
            <div className="space-y-4 h-full">
              <div>
                <p className="text-sm font-medium text-gray-500">{l.t11}</p>
                {isEditing ? (
                  <select
                    className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                    value={incomeData?.sourceOfIncome || ""}
                    onChange={(e) => handleIncomeChange("sourceOfIncome", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Employed">Employed</option>
                    <option value="Business">Business</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{capitalizeWords(application?.sourceOfIncome) || "—"}</p>
                )}
              </div>

              {(incomeData?.sourceOfIncome?.toLowerCase() === "employed" || (!isEditing && application?.sourceOfIncome?.toLowerCase() === "employed")) && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{l.t12}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                        value={incomeData?.appOccupation || ""}
                        onChange={(e) => handleIncomeChange("appOccupation", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{capitalizeWords(application?.appOccupation) || "—"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{l.t13}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                        value={incomeData?.appCompanyName || ""}
                        onChange={(e) => handleIncomeChange("appCompanyName", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{capitalizeWords(application?.appCompanyName) || "—"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{l.t14}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                        value={incomeData?.appEmploymentStatus || ""}
                        onChange={(e) => handleIncomeChange("appEmploymentStatus", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{capitalizeWords(application?.appEmploymentStatus) || "—"}</p>
                    )}
                  </div>
                </>
              )}

              {(incomeData?.sourceOfIncome?.toLowerCase() === "business" || (!isEditing && application?.sourceOfIncome?.toLowerCase() === "business")) && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{l.t15}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                        value={incomeData?.appTypeBusiness || ""}
                        onChange={(e) => handleIncomeChange("appTypeBusiness", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{application?.appTypeBusiness || "—"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{l.t16}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                        value={incomeData?.appBusinessName || ""}
                        onChange={(e) => handleIncomeChange("appBusinessName", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{application?.appBusinessName || "—"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{l.t17}</p>
                    {isEditing ? (
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                        value={incomeData?.appDateStarted || ""}
                        onChange={(e) => handleIncomeChange("appDateStarted", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{application?.appDateStarted || "—"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{l.t18}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                        value={incomeData?.appBusinessLoc || ""}
                        onChange={(e) => handleIncomeChange("appBusinessLoc", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{application?.appBusinessLoc || "—"}</p>
                    )}
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500">{l.t19}</p>
                {isEditing ? (
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                    value={incomeData?.appMonthlyIncome || ""}
                    onChange={(e) => handleIncomeChange("appMonthlyIncome", e.target.value)}
                  />
                ) : (
                  <p className="text-lg font-bold text-green-600">{formatCurrency(application?.appMonthlyIncome)}</p>
                )}
              </div>
            </div>
          )}

          {/* CHARACTER REFERENCES */}
          {activeTab === "references" && (
            <div className="h-full">
              {/* Agent Section - Always First */}
              {isEditing ? (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      Agent
                    </span>
                  </div>
                  
                  {/* Agent Choice Radio Buttons */}
                  <div className="mb-3 space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="agentChoice"
                        value="no-agent"
                        checked={agentChoice === 'no-agent'}
                        onChange={() => handleAgentChoiceChange('no-agent')}
                        className="w-3 h-3 text-blue-600 focus:outline-none accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">No Agent</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="agentChoice"
                        value="have-agent"
                        checked={agentChoice === 'have-agent'}
                        onChange={() => handleAgentChoiceChange('have-agent')}
                        className="w-3 h-3 text-blue-600 focus:outline-none accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">Have Agent</span>
                    </label>
                  </div>

                  {/* Agent Dropdown */}
                  {agentChoice === 'have-agent' && (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Select Agent:</p>
                        {loadingAgents ? (
                          <p className="text-sm text-gray-500">Loading agents...</p>
                        ) : (
                          <select
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                            value={typeof agentData === 'object' ? agentData?.agentId || '' : agentData || ''}
                            onChange={(e) => {
                              const selectedAgent = agents.find(a => a.agentId === e.target.value);
                              if (setAgentData && selectedAgent) {
                                setAgentData(selectedAgent);
                              }
                            }}
                          >
                            <option value="">Choose an agent</option>
                            {agents.map((agent) => (
                              <option key={agent.agentId} value={agent.agentId}>
                                {agent.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                (application as any)?.appAgent && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Agent
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Name</p>
                        <p className="text-sm text-gray-900">{(application as any)?.appAgent?.name || "—"}</p>
                      </div>
                    </div>
                  </div>
                )
              )}
              
              {((isEditing ? referencesData : application?.appReferences) || []).length > 0 ? (
                <div className="space-y-4">
                  {((isEditing ? referencesData : application?.appReferences) || []).map((ref: any, i: number) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                          {l.t20} {i + 1}
                        </span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveReference(i)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">{l.t21}:</p>
                          {isEditing ? (
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                              value={ref.name || ""}
                              onChange={(e) => handleReferenceChange(i, "name", e.target.value)}
                            />
                          ) : (
                            <p className="text-sm text-gray-900">{ref.name}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">{l.t22}:</p>
                          {isEditing ? (
                            <div>
                              <input
                                type="text"
                                className={`w-full border rounded px-2 py-1 text-sm text-gray-900 ${
                                  ref.contact && !/^09\d{9}$/.test(ref.contact) ? "border-red-500" : "border-gray-300"
                                }`}
                                value={ref.contact || ""}
                                onChange={(e) => handleReferenceChange(i, "contact", e.target.value)}
                                placeholder="09XXXXXXXXX"
                              />
                              {ref.contact && !/^09\d{9}$/.test(ref.contact) && (
                                <p className="text-red-500 text-xs mt-1">Must start with 09 and be 11 digits</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-900">{ref.contact}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">{l.t23}:</p>
                          {isEditing ? (
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                              value={ref.relation || ""}
                              onChange={(e) => handleReferenceChange(i, "relation", e.target.value)}
                            />
                          ) : (
                            <p className="text-sm text-gray-900">{ref.relation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={handleAddReference}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-500 hover:text-red-600 transition flex items-center justify-center space-x-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Add Reference</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 h-full flex flex-col justify-center">
                  <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t.noReferences}</p>
                  {isEditing && (
                    <button
                      onClick={handleAddReference}
                      className="mt-4 mx-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center space-x-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Add Reference</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* COLLATERAL DETAILS */}
          {activeTab === "collateral" && (
            <div className="h-full">
              {application?.loanType === "Regular Loan With Collateral" && (
                <WithCollateral 
                  application={application} 
                  formatCurrency={formatCurrency}
                  isEditing={isEditing}
                  collateralData={collateralData}
                  setCollateralData={setCollateralData}
                />
              )}
              {application?.loanType === "Open-Term Loan" && (
                <OpenTerm 
                  application={application} 
                  formatCurrency={formatCurrency}
                  isEditing={isEditing}
                  collateralData={collateralData}
                  setCollateralData={setCollateralData}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* FILES SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 flex-shrink-0">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{l.t24}</h3>
          {isEditing && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus className="w-4 h-4" />
                <span>{uploading ? "Uploading..." : "Add Files"}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}
        </div>
        <div className="p-6">
          {application?.documents && application.documents.length > 0 ? (
            <div className="space-y-3">
              {application.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiFileText className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 max-w-[180px] break-all whitespace-normal">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-gray-500">12.3kb</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={
                        doc.filePath.startsWith("http")
                          ? doc.filePath
                          : `${BASE_URL}/${doc.filePath}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                      title="View file"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </a>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteFile(doc.fileName, doc.filePath)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete file"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <FiPaperclip className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">{t.noDocuments}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.fileName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        processingLabel="Deleting..."
        onConfirm={confirmDeleteFile}
        onCancel={cancelDeleteFile}
        loading={deleting}
      />
    </div>
  );
}
