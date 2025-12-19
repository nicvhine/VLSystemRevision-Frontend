'use client';

import { FC, useEffect, useState } from "react";
import { Agent } from "@/app/commonComponents/utils/Types/agent";
import { AgentDropdownProps } from "@/app/commonComponents/utils/Types/agent";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const AgentDropdown: FC<AgentDropdownProps> = ({
  language,
  appAgent,
  setAppAgent,
  missingError,
  showFieldErrors = false,
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentChoice, setAgentChoice] = useState<'no-agent' | 'have-agent' | ''>('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${BASE_URL}/agents/names`);
        if (!res.ok) throw new Error("Failed to fetch agents");
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  // Initialize agentChoice based on current appAgent value
  useEffect(() => {
    if (appAgent === 'no agent') {
      setAgentChoice('no-agent');
    } else if (appAgent && appAgent !== '') {
      setAgentChoice('have-agent');
    }
  }, []);

  const handleAgentChoiceChange = (choice: 'no-agent' | 'have-agent') => {
    setAgentChoice(choice);
    if (choice === 'no-agent') {
      setAppAgent('no agent');
    } else {
      setAppAgent(''); // Reset to empty so user must select an agent
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
        {language === "en" ? "Agent Information" : "Impormasyon sa Ahente"}
      </h4>

      {/* Agent Choice Radio Buttons */}
      <div className="mb-4 space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="agentChoice"
            value="no-agent"
            checked={agentChoice === 'no-agent'}
            onChange={() => handleAgentChoiceChange('no-agent')}
            className="w-4 h-4 text-red-600 focus:outline-none accent-red-600"
            style={{ accentColor: '#dc2626' }}
          />
          <span className="text-gray-700">
            {language === "en" ? "No Agent" : "Walay Ahente"}
          </span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="agentChoice"
            value="have-agent"
            checked={agentChoice === 'have-agent'}
            onChange={() => handleAgentChoiceChange('have-agent')}
            className="w-4 h-4 text-red-600 focus:outline-none accent-red-600"
            style={{ accentColor: '#dc2626' }}
          />
          <span className="text-gray-700">
            {language === "en" ? "Have Agent" : "Naay Ahente"}
          </span>
        </label>
      </div>

      {/* Agent Dropdown - Only show when "Have Agent" is selected */}
      {agentChoice === 'have-agent' && (
        <div className="mt-4">
          {loading ? (
            <p className="text-gray-500">{language === "en" ? "Loading agents..." : "Nag-load sa mga ahente..."}</p>
          ) : (
            <select
              value={appAgent === 'no agent' ? '' : appAgent}
              onChange={(e) => setAppAgent(e.target.value)}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingError) ? 'border-red-500' : 'border-gray-200'}`}
            >
              <option value="">{language === "en" ? "Choose an agent" : "Pilia ang ahente"}</option>
              {agents.map((agent) => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentDropdown;
