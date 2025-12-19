'use client';

import { useState, useEffect } from "react";
import { useLoanStats } from "@/app/commonComponents/statistics/hooks";
import { LoadingSpinner } from "@/app/commonComponents/utils/loading";
import { formatCurrency } from "../utils/formatters";

export default function LoanStatisticsVertical() {
  const [role, setRole] = useState<'loanOfficer' | 'manager' | 'head'>('loanOfficer');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role") as 'loanOfficer' | 'manager' | 'head';
      setRole(storedRole || 'loanOfficer');
    }
  }, []);

  // Head should see manager stats
  const statsRole = role === 'head' ? 'manager' : role;

  const { s, t, loading, typeStats, applicationStats, topAgents = [] } = useLoanStats(statsRole as 'manager' | 'loanOfficer');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const renderLabel = (text: string) => {
    const idx = text.indexOf('(');
    if (idx === -1) return text;
    return (
      <>
        <span>{text.slice(0, idx).trimEnd()}</span>{' '}
        <span className="whitespace-nowrap">{text.slice(idx).trim()}</span>
      </>
    );
  };

  const StatRow = ({ label, value, isAmount }: any) => (
    <div className="grid grid-cols-[1fr_auto] items-start gap-x-3 py-1 text-sm">
      <span className="text-gray-700 font-medium leading-snug min-w-0 break-words">{renderLabel(label)}</span>
      <span className="font-semibold text-gray-900 text-right pl-2">{isAmount ? `₱${value.toLocaleString()}` : value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Application Status */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all p-4">
        <h2 className="text-md font-semibold text-red-600 mb-4">{t.h3}</h2>
        <StatRow label={t.s1} value={applicationStats.applied ?? 0} />
        <StatRow label={t.s3} value={applicationStats.approved ?? 0} />
        <StatRow label={t.s4} value={applicationStats.denied ?? 0} />
      </section>

      {/* Loan Types */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all p-4">
        <h2 className="text-md font-semibold text-red-600 mb-4">{t.h4}</h2>
        <StatRow label={s.l1} value={typeStats.withoutCollateral ?? 0} />
        <StatRow label={s.l2} value={typeStats.withCollateral ?? 0} />
        <StatRow label={s.l3} value={typeStats.openTerm ?? 0} />
      </section>

      {/* Top Agents (only show for manager/head) */}
        <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="mb-4 flex items-center gap-2 text-md font-semibold text-red-600">
            {t.c14 || "Top 5 Agents"}
          </div>
          {topAgents.length === 0 ? (
            <p className="text-gray-500">{t.m2}</p>
          ) : (
            <ul className="list-decimal ">
              {topAgents.map((a: any) => (
                <li key={a.agentId} className="flex justify-between gap-x-3 py-1">
                  <span className="text-gray-00 text-sm">{a.name}</span>
                  <span className="font-semibold text-sm">{formatCurrency(a.totalProcessedLoans)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
    </div>
  );
}
