"use client";

import { useRef, useState, useEffect } from "react";
import { FiSearch, FiUserPlus, FiChevronDown, FiMoreVertical } from "react-icons/fi";
import { LoadingSpinner } from "@/app/commonComponents/utils/loading";
import { useUsersLogic } from "./hooks";
import { User } from "@/app/commonComponents/utils/Types/userPage";

import React from "react";
import CreateUserModal from "./createUserModal";
import DecisionModal from "./modal";
import SuccessModal from "@/app/commonComponents/modals/successModal";
import translations from "@/app/commonComponents/translation";

export default function Page() {
  const [language, setLanguage] = useState<'en' | 'ceb'>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("headLanguage") as 'en' | 'ceb') || 'en';
    }
    return 'en';
  });

  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail.userType === 'head') {
        setLanguage(event.detail.language);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  // Get current user role
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role") || "";
      setCurrentUserRole(role);
    }
  }, []);

  const t = translations.loanTermsTranslator[language];
  const b = translations.buttonTranslation[language];

  const {
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    sortedUsers,
    loading,
    errorMessage,
    errorModalOpen,
    setErrorModalOpen,
    handleCreateUser,
    decisionModalOpen,
    setDecisionModalOpen,
    decisionConfig,
    setDecisionConfig,
    handleToggleStatus,
    handleSaveEdit,
    setUsers,
    editingUserId,  
    setEditingUserId, 
    editFormData,   
    setEditFormData,
    successMessage,
    setSuccessMessage,
    editValidationErrors,
    setEditValidationErrors,
  } = useUsersLogic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const actionPopoverRef = useRef<HTMLDivElement | null>(null);
  const actionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const paginationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openActionId) return;
      const popoverEl = actionPopoverRef.current;
      const trigger = actionButtonRefs.current[openActionId];
      if (!popoverEl || !event.target) return;
      const target = event.target as Node;
      if (popoverEl.contains(target)) return;
      if (trigger && trigger.contains(target)) return;
      setOpenActionId(null);
    };

    const closeOnScroll = () => setOpenActionId(null);
    const closeOnResize = () => setOpenActionId(null);

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnResize);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [openActionId]);

  // Filter out sysad users from the display
  const filteredUsers = sortedUsers.filter(user => user.role.toLowerCase() !== "sysad");

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalCount = filteredUsers.length;
  const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd = totalCount === 0 ? 0 : Math.min(totalCount, currentPage * pageSize);

  const handleEditClick = (user: User) => {
    setEditingUserId(user.userId);
    setEditFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      lastActive: user.lastActive
    });    
  };  

  const handleEditChange = (field: keyof User, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditFormData({});
    setEditValidationErrors({});
  };

  const toggleActions = (userId: string) => {
    setOpenActionId((prev) => (prev === userId ? null : userId));
  };

  const handleAction = (action: "edit" | "activate" | "deactivate", user: User) => {
    setOpenActionId(null);
    if (action === "edit") {
      handleEditClick(user);
    } else if (action === "activate" || action === "deactivate") {
      handleToggleStatus(user);
    }
  };

  function getRoleTranslation(role: string): string {
    const roleMap: Record<string, string> = {
      "head": b.b14,
      "manager": b.b15,
      "loan officer": b.b16,
      "collector": b.b17,
    };
    return roleMap[role.toLowerCase()] || role;
  }
  
  return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
            </div>
          </div>
          {/* Filter - Responsive */}
          <div className="mb-6">
            {/* Dropdown for mobile */}
            <div className="block sm:hidden relative max-w-full">
              <select
                value={roleFilter || "All"}
                onChange={(e) => { setRoleFilter(e.target.value === "All" ? "" : e.target.value as any); setCurrentPage(1); }}
                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition-all"
              >
                {["All", "head", "manager", "loan officer", "collector"].map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption === "All" ? "All Roles" : roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            {/* Desktop buttons */}
            <div className="hidden sm:flex flex-wrap gap-2 bg-white p-3 rounded-lg shadow-sm w-full max-w-full">
              {["All", "head", "manager", "loan officer", "collector"].map((roleOption) => (
                <button
                  key={roleOption}
                  onClick={() => { setRoleFilter(roleOption === "All" ? "" : roleOption as any); setCurrentPage(1); }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    (roleFilter === roleOption || (!roleFilter && roleOption === "All"))
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={{ minWidth: 100 }}
                >
                  {roleOption === "All" ? b.b6 : (roleOption === "head" ? b.b7 : roleOption === "manager" ? b.b8 : roleOption === "loan officer" ? b.b9 : b.b10)}
                </button>
              ))}
            </div>
          </div>
          {/* Search and Create User */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 w-full max-w-full">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder={t.l22}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 text-white rounded-lg px-4 py-[14px] flex items-center gap-2 shadow-sm cursor-pointer hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 font-medium text-sm w-auto whitespace-nowrap"
            >
              <FiUserPlus className="w-4 h-4" />
              <span className="leading-none">{b.b1}</span>
            </button>
          </div>
          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <table className="min-w-full table-fixed">
                <colgroup>
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                  <col className="w-[120px]" />
                </colgroup>
                <thead>
                  <tr>
                    {[t.l11, t.l12, "Email", t.l18, t.l40, "Status", t.l16].map((heading) => (
                      <th
                        key={heading}
                        className={`bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap${heading === "Actions" || heading === "Mga Aksyon" ? " text-center" : " text-left"}`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedUsers.map((user) => (
                    <tr key={user.userId} className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      user.status === 'Inactive' ? 'bg-gray-100' : ''
                    }`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{user.userId}</td>
                      {editingUserId === user.userId ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div>
                              <input 
                                className={`border rounded px-2 py-1 w-full ${editValidationErrors.name ? 'border-red-500' : 'border-gray-300'}`} 
                                value={editFormData.name || ''} 
                                onChange={(e) => handleEditChange("name", e.target.value)} 
                              />
                              {editValidationErrors.name && (
                                <p className="text-red-500 text-xs mt-1">{editValidationErrors.name}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div>
                              <input 
                                className={`border rounded px-2 py-1 w-full ${editValidationErrors.email ? 'border-red-500' : 'border-gray-300'}`} 
                                value={editFormData.email || ''} 
                                onChange={(e) => handleEditChange("email", e.target.value)} 
                              />
                              {editValidationErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{editValidationErrors.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div>
                              <input 
                                className={`border rounded px-2 py-1 w-full ${editValidationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`} 
                                value={editFormData.phoneNumber || ''} 
                                onChange={(e) => handleEditChange("phoneNumber", e.target.value)} 
                              />
                              {editValidationErrors.phoneNumber && (
                                <p className="text-red-500 text-xs mt-1">{editValidationErrors.phoneNumber}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <select className="border border-gray-300 rounded px-2 py-1 w-full" value={editFormData.role || ''} onChange={(e) => handleEditChange("role", e.target.value)}>
                              {currentUserRole !== "head" && <option value="head">Head</option>}
                              <option value="manager">Manager</option>
                              <option value="loan officer">Loan Officer</option>
                              <option value="collector">Collector</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <span className="text-gray-800">{editFormData.status || user.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center w-[120px]">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={handleSaveEdit}
                                className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                              >
                                {b.b4}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-sm text-red-600 hover:text-red-700 hover:underline"
                              >
                                {b.b5}
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-700'
                          }`}>{user.name}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-700'
                          }`}>{user.email}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-700'
                          }`}>{user.phoneNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                user.status === 'Inactive' ? 'text-gray-400' : 'text-black'
                              }`}
                            >
                              {getRoleTranslation(user.role)}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            user.status === 'Inactive' ? 'text-gray-400 font-medium' : 'text-gray-700'
                          }`}>{user.status}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center w-[120px]">
                            <div className="relative inline-flex items-center justify-center">
                              <button
                                ref={(el) => { actionButtonRefs.current[user.userId] = el; }}
                                onClick={() => toggleActions(user.userId)}
                                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 text-gray-600"
                                aria-haspopup="menu"
                                aria-expanded={openActionId === user.userId}
                                aria-label={t.l16}
                              >
                                <FiMoreVertical className="w-5 h-5" />
                              </button>
                              {openActionId === user.userId && actionButtonRefs.current[user.userId] && (() => {
                                const rect = actionButtonRefs.current[user.userId]!.getBoundingClientRect();
                                const menuWidth = 128;
                                const menuHeight = 96;
                                const viewportHeight = window.innerHeight;
                                const paginationTop = paginationRef.current?.getBoundingClientRect().top ?? viewportHeight;
                                const spaceBelow = Math.min(paginationTop, viewportHeight) - rect.bottom;
                                const spaceAbove = rect.top;
                                
                                let top: number;
                                // Prefer below, only go above if not enough space below AND enough space above
                                if (spaceBelow < menuHeight + 16 && spaceAbove > menuHeight + 16) {
                                  top = rect.top - menuHeight + 6;
                                } else {
                                  top = rect.bottom + 8;
                                }
                                
                                let left = rect.right - menuWidth;
                                if (left < 8) {
                                  left = 8;
                                } else if (left + menuWidth > window.innerWidth - 8) {
                                  left = window.innerWidth - menuWidth - 8;
                                }
                                
                                const style: React.CSSProperties = {
                                  position: "fixed",
                                  top: `${top}px`,
                                  left: `${left}px`,
                                  width: menuWidth,
                                  zIndex: 9999,
                                };
                                return (
                                  <div
                                    ref={actionPopoverRef}
                                    style={style}
                                    className="rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                                    role="menu"
                                  >
                                    <button
                                      onClick={() => handleAction("edit", user)}
                                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      role="menuitem"
                                    >
                                      {b.b2}
                                    </button>
                                    {user.status === 'Active' ? (
                                      <button
                                        onClick={() => handleAction("deactivate", user)}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        role="menuitem"
                                      >
                                        Deactivate
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleAction("activate", user)}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                        role="menuitem"
                                      >
                                        Activate
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-500 font-semibold">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination + Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3 text-black" ref={paginationRef}>
            <div className="text-sm text-gray-700">
              {totalCount === 0 ? (
                <>Showing 0 of 0</>
              ) : (
                <>Showing <span className="font-medium">{showingStart}</span>–<span className="font-medium">{showingEnd}</span> of <span className="font-medium">{totalCount}</span></>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <span className="px-1 py-1 text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          <CreateUserModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={(user) => handleCreateUser(user).then(result => {
              if (result.success) {
                return { ...result, showSuccess: () => setSuccessMessage("User created successfully.") };
              }
              return result;
            })}
            language={language}
            currentUserRole={currentUserRole}
            existingUsers={sortedUsers}
          />
          {successMessage && (
            <SuccessModal isOpen={!!successMessage} message={successMessage} onClose={() => setSuccessMessage("")} />
          )}

      {decisionConfig && (
            <DecisionModal
            isOpen={decisionModalOpen}
            title={decisionConfig?.title || ""}
            message={decisionConfig?.message || ""}
            confirmText={decisionConfig?.confirmText}
            danger={decisionConfig?.danger}
            error={decisionConfig?.error} 
            onConfirm={decisionConfig?.onConfirm || (() => {})}
            onCancel={() => setDecisionModalOpen(false)}
          />
          
          )}

        </div>
      </div>
  );
}