"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/app/commonComponents/loanApplication/function";
import { formatDate } from "@/app/commonComponents/utils/formatters";
import { useTranslation } from "../translationHook";
import { translateDescription } from "../utils/logTranslation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function SysAdDashboard() {
  const [activeStaff, setActiveStaff] = useState<any[]>([]);
  const [activeBorrowers, setActiveBorrowers] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [totals, setTotals] = useState({ users: 0, borrowers: 0 });
  const [loading, setLoading] = useState(true);
  const { s, language } = useTranslation();
   
  useEffect(() => {
    const fetchData = async () => {
      try {
        const overviewRes = await authFetch(`${BASE_URL}/sysad/overview`);
        const overviewData = await overviewRes.json();
  
        setActiveStaff(Array.isArray(overviewData.activeStaff) ? overviewData.activeStaff : []);
        
        setActiveBorrowers(Array.isArray(overviewData.borrowers) ? overviewData.borrowers : []);
  
        setRecentLogs(Array.isArray(overviewData.recentLogs) ? overviewData.recentLogs : []);
        setTotals(overviewData.totals || { users: 0, borrowers: 0 });
      } catch (err) {
        console.error("Error loading SysAd dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  const totalActiveStaff = activeStaff.length;
  const totalBorrowers = totals.borrowers || activeBorrowers.length; 
  const totalUsers = totals.users || totalActiveStaff + totalBorrowers;
  const recentLogsLimited = recentLogs.slice(0, 8);

  if (loading) return <p className="p-6 text-gray-500">{s.t69} dashboard...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center gap-4">
            <div>
              <h2 className="text-gray-600 text-xs sm:text-sm">{s.t81}</h2>
              <p className="text-xl sm:text-2xl font-semibold">{totalActiveStaff}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center gap-4">
            <div>
              <h2 className="text-gray-600 text-xs sm:text-sm">{s.t78}</h2>
              <p className="text-xl sm:text-2xl font-semibold">{totalBorrowers}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center gap-4">
            <div>
              <h2 className="text-gray-600 text-xs sm:text-sm">{s.t1}</h2>
              <p className="text-xl sm:text-2xl font-semibold">{totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Active Staff Table */}
        <div className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">{s.t80}</h2>
            <a
              href="/userPage/sysadPage/userManagement"
              className="text-blue-600 text-xs sm:text-sm font-medium hover:underline"
            >
              {s.t79}
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{s.t37}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{s.t38}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{s.t41}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeStaff.slice(0, 5).map((staff) => (
                  <tr key={staff.userId} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-800 whitespace-nowrap">{staff.userId}</td>
                    <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-800 whitespace-nowrap">{staff.name}</td>
                    <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 capitalize whitespace-nowrap">{staff.username}</td>
                    <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{staff.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Logs Section */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              {s.t2}
            </h2>
            <a
              href="/userPage/sysadPage/logs"
              className="text-blue-600 text-xs sm:text-sm font-medium hover:underline ml-auto"
            >
              {s.t79}
            </a>
          </div>
          <ul className="divide-y divide-gray-100">
            {recentLogsLimited.length === 0 ? (
              <li className="px-4 sm:px-6 py-4 text-gray-500 text-xs sm:text-sm">{s.t25}</li>
            ) : (
              recentLogsLimited.map((log) => (
                <li key={log.logId} className="px-4 sm:px-6 py-4 text-xs sm:text-sm flex flex-col sm:flex-row sm:justify-between gap-2">
                  <span className="text-gray-700">{typeof log.description === "string" ? translateDescription(log.description, language) : log.description}</span>
                  <span className="text-gray-400 text-xs whitespace-nowrap">{formatDate(log.createdAt, language)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        </div>
      </div>
  );
}
