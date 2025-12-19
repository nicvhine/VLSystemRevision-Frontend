"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/app/commonComponents/loanApplication/function";
import ErrorModal from "@/app/commonComponents/modals/errorModal";
import { useTranslation } from "../translationHook";
import { translateAction, translateDescription } from "../utils/logTranslation";
import { FiSearch, FiChevronDown } from "react-icons/fi";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL 

interface LogEntry {
  logId: string;
  userId: string;
  name: string;
  role: string;
  action: string;
  description: string;
  createdAt: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const { s, language } = useTranslation();

  const openErrorModal = (msg: string) => setErrorMessage(msg);
  const closeErrorModal = () => setErrorMessage(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await authFetch(`${BASE_URL}/sysad/all`);
        if (!res.ok) throw new Error(s.t25);
  
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []); 
      } catch (err) {
        console.error(err);
        openErrorModal(s.t25);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLogs();
  }, []);

  // Filter and sort logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = searchQuery === '' || 
      log.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translateAction(log.action, language).toLowerCase().includes(searchQuery.toLowerCase()) ||
      translateDescription(log.description, language).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortBy === 'action') {
      return translateAction(a.action, language).localeCompare(translateAction(b.action, language));
    }
    return 0;
  });

  if (loading) return <p className="p-6 text-gray-500">{s.t69} {s.t2.toLowerCase()}...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">{s.t16}</h1>

        {errorMessage && (
          <ErrorModal isOpen={!!errorMessage} message={errorMessage} onClose={closeErrorModal} />
        )}

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder={s.t101}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-[200px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition-all"
            >
              <option value="">{s.t99}</option>
              <option value="date">{s.t24}</option>
              <option value="name">{s.t37}</option>
              <option value="action">{s.t20}</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        <div className="w-full rounded-lg bg-white shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full">
            <thead>
              <tr>
                <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">{s.t24}</th>
                <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">{s.t37}</th>
                <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">{s.t41}</th>
                <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">{s.t20}</th>
                <th className="bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">{s.t22}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {sortedLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  {s.t25}
                </td>
              </tr>
            ) : (
              sortedLogs.map((log) => (
                <tr key={log.logId} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString("en-CA", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false, 
                        })
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{typeof log.name === "string" ? log.name : JSON.stringify(log.name)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">{typeof log.role === "string" ? log.role : JSON.stringify(log.role)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{typeof log.action === "string" ? translateAction(log.action, language) : JSON.stringify(log.action)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{typeof log.description === "string" ? translateDescription(log.description, language) : JSON.stringify(log.description)}</td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
  );
}
