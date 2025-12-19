import { Dispatch, SetStateAction } from 'react';

export interface Agent {
  agentId: string;
  name: string;
  phoneNumber: string;
  handledLoans: number;
  totalLoanAmount: number;
  totalCommission: number;
  status: "Active" | "Inactive"; 
}

export interface AddAgentParams {
  newAgentName: string;
  newAgentPhone: string;
  agents: Agent[];
  setAgents: Dispatch<SetStateAction<Agent[]>>;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setSuccessMessage: Dispatch<SetStateAction<string>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
  fetchAgents: () => Promise<void>;
}

export interface AddAgentResult {
    success: boolean;
    fieldErrors?: { name?: string; phoneNumber?: string };
    message?: string;
}

export interface AddAgentModalProps {
    show: boolean;
    onClose: () => void;
    newAgentName: string;
    setNewAgentName: (name: string) => void;
    newAgentPhone: string;
    setNewAgentPhone: (phone: string) => void;
    onAddAgent: () => Promise<AddAgentResult>;
    loading?: boolean; 
    language?: "en" | "ceb";
}

export interface AgentDropdownProps {
  language: "en" | "ceb";
  appAgent: string;
  setAppAgent: (agentId: string) => void;
  missingError?: boolean;
  showFieldErrors?: boolean;
}

export interface FieldErrors {
  name?: string;
  phoneNumber?: string;
}
