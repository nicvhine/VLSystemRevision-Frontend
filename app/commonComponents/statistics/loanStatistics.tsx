'use client';

import { useState } from "react";
import { useLoanStats } from "./hooks";
import { LoadingSpinner } from "@/app/commonComponents/utils/loading";

export default function LoanStatistics() {
  const [role, setRole] = useState<'loanOfficer' | 'manager' | 'head'>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("role") as 'loanOfficer' | 'manager' | 'head') || 'loanOfficer';
    }
    return 'loanOfficer';
  });

  const statsRole = role === 'head' ? 'manager' : role;
  const { s, t, loading, loanStats, collectionStats } = useLoanStats(statsRole as 'manager' | 'loanOfficer');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Stat row component
  const StatRow = ({ label, value, isAmount }: any) => (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="font-semibold text-gray-900">{isAmount ? `₱${value.toLocaleString()}` : value}</span>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {(role === "manager" || role === "head") && (
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Financial Overview */}
          <section className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <div className="px-4 pt-3">
              <h2 className="text-md font-semibold text-red-600 mb-6">{t.h1}</h2>
            </div>
            <div className="px-4 pb-3 flex flex-col gap-1">
              <StatRow label={s.l4} value={loanStats.totalPrincipal ?? 0} isAmount />
              <StatRow label={s.l6} value={loanStats.totalInterest ?? 0} isAmount />
            </div>
          </section>

          {/* Collection Status */}
          <section className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <div className="px-4 pt-3">
              <h2 className="text-md font-semibold text-red-600 mb-6">{t.h2}</h2>
            </div>
            <div className="px-4 pb-3 flex flex-col gap-1">
              <StatRow label={t.s5} value={collectionStats.totalCollectables ?? 0} isAmount />
              <StatRow label={t.s6} value={collectionStats.totalCollected ?? 0} isAmount />
              <StatRow label={t.s7} value={collectionStats.totalUnpaid ?? 0} isAmount />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
