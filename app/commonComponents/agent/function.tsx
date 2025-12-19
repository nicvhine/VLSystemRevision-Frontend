  'use client';

  import { Dispatch, SetStateAction } from 'react';
  import { AddAgentParams, Agent, FieldErrors } from '../utils/Types/agent';

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Normalize agent object from API
  export const normalizeAgent = (raw: any): Agent => ({
    agentId: String(raw?.agentId ?? ''),
    name: String(raw?.name ?? ''),
    phoneNumber: String(raw?.phoneNumber ?? ''),
    handledLoans: Number(raw?.handledLoans) || 0,
    totalLoanAmount: Number(raw?.totalLoanAmount) || 0,
    totalCommission: Number(raw?.totalCommission) || 0,
    status: raw?.status === 'Inactive' ? 'Inactive' : 'Active',
  });

  // Fetch all agents from API
  export const fetchAgents = async (
    role: string | null,
    setAgents: Dispatch<SetStateAction<Agent[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setError: Dispatch<SetStateAction<string>>
  ) => {
    if (!role) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        setAgents([]);
        return;
      }

      const res = await fetch(`${BASE_URL}/agents`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch agents');
      const data = await res.json();

      const agentsData = Array.isArray(data)
        ? data
        : Array.isArray(data?.agents)
        ? data.agents
        : [];

      setAgents(agentsData.map(normalizeAgent));
    } catch (err) {
      console.error('Fetch Agents Error:', err);
      setAgents([]);
      setError((err as Error).message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  // Add new agent to API
  export const handleAddAgent = async ({
    newAgentName,
    newAgentPhone,
    agents,
    setAgents,
    setShowModal,
    setSuccessMessage,
    setLoading,
    setError,
    fetchAgents,
  }: AddAgentParams): Promise<{ success: boolean; fieldErrors?: FieldErrors; message?: string }> => {
    const nameTrim = newAgentName.trim();
    const phoneTrim = newAgentPhone.trim();

    const errors: FieldErrors = {};
    if (!nameTrim) errors.name = 'Name is required';
    if (!phoneTrim) errors.phoneNumber = 'Phone number is required';

    if (nameTrim && nameTrim.split(/\s+/).length < 2)
      errors.name = 'Please enter at least two words (first and last name).';
    if (phoneTrim && (!phoneTrim.startsWith('09') || phoneTrim.length !== 11))
      errors.phoneNumber = 'Phone number must start with 09 and be 11 digits.';

    const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();
    if (agents.some((a) => normalize(a.name) === normalize(nameTrim)))
      errors.name = errors.name || 'Agent with this name already exists.';
    if (agents.some((a) => a.phoneNumber.replace(/\D/g, '') === phoneTrim.replace(/\D/g, '')))
      errors.phoneNumber = errors.phoneNumber || 'Phone number already in use.';

    if (Object.keys(errors).length) return { success: false, fieldErrors: errors };

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, message: 'No token found. Please log in again.' };

      const res = await fetch(`${BASE_URL}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: nameTrim, phoneNumber: phoneTrim }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) return { success: false, message: data?.message || 'Failed to add agent' };

      if (data?.agent) setAgents((prev) => [...prev, normalizeAgent(data.agent)]);
      else await fetchAgents();

      setShowModal(false);
      setSuccessMessage('Agent added successfully');
      return { success: true };
    } catch (err) {
      setError('Server error');
      return { success: false, message: 'Server error' };
    } finally {
      setLoading(false);
    }
  };
