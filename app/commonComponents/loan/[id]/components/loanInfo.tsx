import React from "react";
import { LoanDetails } from "@/app/commonComponents/utils/Types/loan";
import { DetailRow } from "../function";
import { formatCurrency, formatDate } from "@/app/commonComponents/utils/formatters";
import LedgerModal from "./ledgerModal";
import { useLoanDetails } from "../hooks";

interface Props {
  client: LoanDetails;
}

export default function LoanInfo({ client }: Props) {
  const [loanSubTab, setLoanSubTab] = React.useState("active");
  const [showLedger, setShowLedger] = React.useState(false);
  const { t, s } = useLoanDetails(client.loanId);

  return (
    <div className="space-y-6">
      {/* Loan Summary */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">{t.t5}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md border border-gray-200 p-4">
            <span className="text-xs uppercase text-gray-500">{s.l45}</span>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{client.totalLoans ?? "-"}</p>
          </div>
          <div className="rounded-md border border-gray-200 p-4">
            <span className="text-xs uppercase text-gray-500">Total Submitted Applications</span>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{client.totalLoans ?? "-"}</p>
          </div>
          <div className="rounded-md border border-gray-200 p-4">
            <span className="text-xs uppercase text-gray-500">{s.l46}</span>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{client.creditScore ?? "-"}</p>
          </div>
        </div>
      </section>

      {/* Loan Tabs */}
      <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
        {[
          { key: "active", label: t.t3 },
          { key: "past", label: t.t4 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setLoanSubTab(tab.key)}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              loanSubTab === tab.key
                ? "bg-red-600 text-white"
                : "text-gray-600 hover:bg-gray-50 hover:text-red-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Loan */}
      {loanSubTab === "active" && (
        client.currentLoan ? (
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                {t.t6}
              </h3>
              <button
                onClick={() => setShowLedger(true)}
                className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
              >
                {t.t11}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
              <DetailRow label={s.l10} value={client.currentLoan.type} />
              <DetailRow label="Loan ID" value={client.loanId} />
              <DetailRow label={s.l13} value={formatDate(client.currentLoan.dateDisbursed)} />
              <DetailRow label={s.l4} value={formatCurrency(client.currentLoan.principal)} />
              <DetailRow label={s.l5} value={`${client.currentLoan.interestRate}%`} />
              <DetailRow label={s.l8} value={`${client.currentLoan.termsInMonths} months`} />
              <DetailRow label={s.l7} value={formatCurrency(client.currentLoan.totalPayable)} />
              <DetailRow label={s.l42} value={formatCurrency(client.currentLoan.paidAmount)} />
              <DetailRow
                label="Remaining Balance"
                value={formatCurrency(client.currentLoan.remainingBalance)}
              />
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">{t.t13}</section>
        )
      )}

      {/* Past Loans */}
      {loanSubTab === "past" && (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
            {t.t7}
          </h2>
          {client.previousLoans?.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {client.previousLoans.map((loan, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-800">{loan.appLoanType}</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>{s.l4}: {formatCurrency(loan.appLoanAmount)}</p>
                    <p>{s.l13}: {formatDate(loan.dateDisbursed)}</p>
                    {loan.status && <p>{s.l15}: {loan.status}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t.t14}</p>
          )}
        </section>
      )}

      <LedgerModal
        isOpen={showLedger}
        onClose={() => setShowLedger(false)}
        loanId={client.loanId || null}
        totalPayable={client.currentLoan?.totalPayable || 0}
      />
    </div>
  );
}
