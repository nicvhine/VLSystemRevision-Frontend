'use client';

import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useAgentPage } from './hook';
import AddAgentModal from '@/app/commonComponents/modals/addAgent/modal';
import AgentModal from '../modals/editAgentModal';
import SuccessModal from '@/app/commonComponents/modals/successModal';
import ConfirmModal from '../modals/confirmModal';
import Pagination from '../utils/pagination';
import Filter from '../utils/sortAndSearch';
import { LoadingSpinner } from '@/app/commonComponents/utils/loading';
import dynamic from 'next/dynamic';
import translations from '@/app/commonComponents/translation';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FiMoreVertical } from 'react-icons/fi';

const Head = dynamic(() => import('@/app/userPage/headPage/layout'), { ssr: false });
const Manager = dynamic(() => import('@/app/userPage/managerPage/layout'), { ssr: false });
const LoanOfficer = dynamic(() => import('@/app/userPage/loanOfficerPage/layout'), { ssr: false });

export default function AgentPageClient() {
  const {
    role,
    paginatedAgents,
    sortedAgents,
    totalPages,
    totalCount,
    loading,
    error,
    successMessage,
    setSuccessMessage,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    language,
    showModal,
    setShowModal,
    showEditModal,
    setShowEditModal,
    selectedAgent,
    setSelectedAgent,
    newAgentName,
    setNewAgentName,
    newAgentPhone,
    setNewAgentPhone,
    handleAddAgent,
    handleEditAgent,
    handleToggleAgent,
    openEditModal,
    t,
    agentLoans,
    setAgentLoans,
    toggleRow,
    expandedRows,
  } = useAgentPage();

  const m = translations.managementTranslation[language];
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [agentToToggle, setAgentToToggle] = useState<any>(null);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const actionPopoverRef = useRef<HTMLDivElement | null>(null);
  const actionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const paginationRef = useRef<HTMLDivElement | null>(null);

  const onToggleConfirm = (agent: any) => {
    setAgentToToggle(agent);
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = () => {
    if (agentToToggle) {
      handleToggleAgent(agentToToggle);
      setShowConfirmModal(false);
      setAgentToToggle(null);
    }
  };

  const toggleActions = (agentId: string) => {
    setOpenActionId((prev) => (prev === agentId ? null : agentId));
  };

  const handleAction = (action: "edit" | "toggle", agent: any) => {
    setOpenActionId(null);
    if (action === "edit") {
      openEditModal(agent);
    } else {
      onToggleConfirm(agent);
    }
  };

  // Filter agents based on active filter
  const filteredAgentsByStatus = activeFilter === 'All' 
    ? paginatedAgents 
    : paginatedAgents.filter(agent => agent.status === activeFilter);

  // For "All" filter, sort so active agents come first, then inactive
  const displayAgents = activeFilter === 'All'
    ? [...filteredAgentsByStatus].sort((a, b) => {
        if (a.status === 'Active' && b.status === 'Inactive') return -1;
        if (a.status === 'Inactive' && b.status === 'Active') return 1;
        return 0;
      })
    : filteredAgentsByStatus;

  if (!role)
    return (
      <div className="text-center py-8">
        <LoadingSpinner />
      </div>
    );

  const Wrapper =
    role === 'loan officer'
      ? LoanOfficer
      : role === 'head'
      ? Head
      : Manager;

  return (
    <Wrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">{t.Agents}</h1>
            {role === 'loan officer' && (
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => setShowModal(true)}
              >
                {t.l39}
              </button>
            )}
          </div>

          {error && <div className="mb-6 text-sm text-red-600">{error}</div>}

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-white p-3 rounded-lg shadow-sm mb-6">
            {(['All', 'Active', 'Inactive'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => {
                  setActiveFilter(filterKey);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeFilter === filterKey
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <Filter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOptions={[
              { value: 'handled', label: t.l19 },
              { value: 'amount', label: t.l4 },
            ]}
            t={t}
          />

          {/* Table */}
          <div className="w-full rounded-lg bg-white shadow-sm border border-gray-100 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.l11}
                  </th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.l12}
                  </th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.l18}
                  </th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.l19}
                  </th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.l4}
                  </th>
                  <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  {role === 'loan officer' && (
                    <th className="bg-gray-50 px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : displayAgents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      {m.g1}
                    </td>
                  </tr>
                ) : (
                  displayAgents.map(agent => (
                    <React.Fragment key={agent.agentId}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRow(agent.agentId)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">{agent.agentId}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{agent.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{agent.phoneNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{agent.handledLoans}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ₱{agent.totalLoanAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 rounded-full text-sm">
                            {agent.status}
                          </span>
                        </td>
                        {role === 'loan officer' && (
                          <td className="px-6 py-4 text-sm text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-flex items-center justify-center">
                              <button
                                ref={(el) => { actionButtonRefs.current[agent.agentId] = el; }}
                                onClick={() => toggleActions(agent.agentId)}
                                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 text-gray-600"
                                aria-haspopup="menu"
                                aria-expanded={openActionId === agent.agentId}
                                aria-label="Actions"
                              >
                                <FiMoreVertical className="w-5 h-5" />
                              </button>
                              {openActionId === agent.agentId && actionButtonRefs.current[agent.agentId] && (() => {
                                const rect = actionButtonRefs.current[agent.agentId]!.getBoundingClientRect();
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
                                  width: `${menuWidth}px`,
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
                                      onClick={() => handleAction("edit", agent)}
                                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      role="menuitem"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleAction("toggle", agent)}
                                      className={`flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 ${
                                        agent.status === 'Active' ? 'text-red-600' : 'text-green-600'
                                      }`}
                                      role="menuitem"
                                    >
                                      {agent.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                        )}
                      </tr>

                      {/* Expanded row with table */}
                      {expandedRows.includes(agent.agentId) && (
                        <tr>
                          <td colSpan={7} className="bg-gray-50 px-6 py-4">
                            <div className="overflow-x-auto">
                              {agentLoans[agent.agentId]?.length > 0 ? (
                                <table className="min-w-full">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loan ID
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Borrower Name
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loan Amount
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date Disbursed
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {agentLoans[agent.agentId].map((loan, idx) => (
                                      <tr key={idx}>
                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.loanId}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.appName}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(loan.appLoanAmount)}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {loan.dateDisbursed ? formatDate(loan.dateDisbursed) : '—'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.status}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-sm text-gray-500">No loans yet</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>

            </table>
          </div>

          {/* Modals */}
          <AddAgentModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onAddAgent={handleAddAgent}
            loading={loading}
            newAgentName={newAgentName}
            setNewAgentName={setNewAgentName}
            newAgentPhone={newAgentPhone}
            setNewAgentPhone={setNewAgentPhone}
            language={language}
          />

          <AgentModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            agent={selectedAgent}
            onSave={handleEditAgent}
            loading={loading}
          />

          <ConfirmModal
            show={showConfirmModal}
            loading={loading}
            message={
              agentToToggle
                ? `Are you sure you want to ${agentToToggle.status === 'Active' ? 'deactivate' : 'activate'} ${agentToToggle.name}?`
                : undefined
            }
            onCancel={() => {
              if (!loading) {
                setShowConfirmModal(false);
                setAgentToToggle(null);
              }
            }}
            onConfirm={handleConfirmToggle}
          />

          <SuccessModal
            isOpen={!!successMessage}
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />

          <div ref={paginationRef}>
            <Pagination
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              setCurrentPage={setCurrentPage}
              setPageSize={setPageSize}
              language={language}
            />
          </div>

        </div>
      </div>
    </Wrapper>
  );
}
