'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAgents as fetchAgentsFn, handleAddAgent as handleAddAgentFn } from './function';
import { Agent } from '../utils/Types/agent';
import translations from '../translation';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const useAgentPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "ceb">("en");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [agentLoans, setAgentLoans] = useState<Record<string, any[]>>({}); 
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const openEditModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowEditModal(true);
  };

  const handleUpdateAgent = async (
    updatedData: Partial<{ name: string; phoneNumber: string; status: "Active" | "Inactive" }>,
    agent?: Agent
  ) => {
    if (!agent) return;

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/agents/${agent.agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to update agent");

      // Update state
      setAgents(prev =>
        prev.map(a => a.agentId === agent.agentId ? { ...a, ...updatedData } : a)
      );

      // Show appropriate success message
      if (updatedData.status) {
        setSuccessMessage(
          updatedData.status === "Active"
            ? "Agent activated successfully!"
            : "Agent deactivated successfully!"
        );
      } else {
        setSuccessMessage("Agent updated successfully!");
        setShowEditModal(false);
        setSelectedAgent(null);
      }

    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Failed to update agent");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgent = async (updatedData: { name: string; phoneNumber: string }) => {
    if (!selectedAgent) return;
    return handleUpdateAgent(updatedData, selectedAgent);
  };

  const toggleRow = async (agentId: string) => {
    if (expandedRows.includes(agentId)) {
      // Collapse row
      setExpandedRows(prev => prev.filter(id => id !== agentId));
    } else {
      // Expand row
      setExpandedRows(prev => [...prev, agentId]);
  
      if (!agentLoans[agentId]) {
        try {
          const res = await fetch(`${BASE_URL}/agents/${agentId}/loans`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          const data = await res.json();
          console.log("DEBUG: fetched loans for", agentId, data); 
          setAgentLoans(prev => ({ ...prev, [agentId]: data.loans || [] }));
        } catch (err) {
          console.error('Failed to fetch loans', err);
          setAgentLoans(prev => ({ ...prev, [agentId]: [] }));
        }
      }
    }
  };
  
  const handleToggleAgent = (agent: Agent) => {
    const newStatus: "Active" | "Inactive" = agent.status === "Active" ? "Inactive" : "Active";
    handleUpdateAgent({ status: newStatus }, agent);
  };

  const fetchAgents = useCallback(async () => {
    if (!role) return;
    await fetchAgentsFn(role, setAgents, setLoading, setError);
  }, [role]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const filteredAgents = agents.filter(agent => {
    const q = searchQuery.toLowerCase();
    return agent.name.toLowerCase().includes(q)
      || agent.phoneNumber.includes(q)
      || agent.agentId.toLowerCase().includes(q);
  });

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (sortBy === 'handled') return b.handledLoans - a.handledLoans;
    if (sortBy === 'amount') return b.totalLoanAmount - a.totalLoanAmount;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedAgents.length / pageSize));
  const paginatedAgents = sortedAgents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalCount = sortedAgents.length;

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    const keyMap: Record<string, string> = {
      head: "headLanguage",
      "loan officer": "loanOfficerLanguage",
      manager: "managerLanguage",
    };
    const storedLanguage = localStorage.getItem(keyMap[storedRole || ""] as string) as "en" | "ceb";
    if (storedLanguage) setLanguage(storedLanguage);
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ userType: string; language: "en" | "ceb" }>;
      if (
        (role === "head" && customEvent.detail.userType === "head") ||
        (role === "loan officer" && customEvent.detail.userType === "loanOfficer") ||
        (role === "manager" && customEvent.detail.userType === "manager")
      ) {
        setLanguage(customEvent.detail.language);
      }
    };

    window.addEventListener("languageChange", handleLanguageChange);
    return () => window.removeEventListener("languageChange", handleLanguageChange);
  }, [role]);

  const t = translations.loanTermsTranslator[language];

  return {
    role,
    agents,
    paginatedAgents,
    sortedAgents,
    totalCount,
    totalPages,
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
    showModal,
    setShowModal,
    newAgentName,
    setNewAgentName,
    newAgentPhone,
    setNewAgentPhone,
    handleAddAgent: () =>
      handleAddAgentFn({
        newAgentName,
        newAgentPhone,
        agents,
        setAgents,
        setShowModal,
        setSuccessMessage,
        setLoading,
        setError,
        fetchAgents,
      }),
    t,
    language,
    setLanguage,
    showEditModal,
    setShowEditModal,
    selectedAgent,
    setSelectedAgent,
    openEditModal,
    handleEditAgent,
    handleToggleAgent,
    expandedRows,
    setExpandedRows,
    agentLoans,
    setAgentLoans,
    toggleRow,
  };
};
