import React from "react";
import { DetailRow} from "../function";
import { Props } from "@/app/commonComponents/utils/Types/components";
import { formatDate, formatCurrency, capitalizeWords } from "@/app/commonComponents/utils/formatters";
import { useLoanDetails } from "../hooks";

export default function PersonalInfo({ client }: Props) {
  const { t, a } = useLoanDetails(client.loanId);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* General Info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">{t.t8}</h3>
        <div className="space-y-2">
          <DetailRow label={a.t6} value={client.address || "-"} />
          <DetailRow label={a.t5} value={client.appDob || "-"} />
          <DetailRow label={a.t7}value={client.appMarital || "-"} />
          {client.appMarital === "Married" && (
            <>
              <DetailRow label={a.t8} value={client.appSpouseName || "-"} />
              <DetailRow label={a.t9} value={client.appSpouseOccupation || "-"} />
            </>
          )}
          <DetailRow label={a.t10} value={client.appChildren ?? "-"} />
        </div>
      </section>

      {/* Contact Info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">{t.t9}</h3>
        <div className="space-y-2">
          <DetailRow label={a.t22} value={client.contactNumber || "-"} />
          <DetailRow label="Email Address" value={client.emailAddress || "-"} />
        </div>
      </section>

      {/* Income Info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">{t.t10}</h3>
        <div className="space-y-2">
          <DetailRow label={a.t11} value={capitalizeWords(client.sourceOfIncome)} />
          {client.sourceOfIncome?.toLowerCase() === "business" && (
            <>
              <DetailRow label={a.t15} value={capitalizeWords(client.businessType)} />
              <DetailRow label={a.t17} value={formatDate(client.dateStarted)} />
              <DetailRow label={a.t18} value={capitalizeWords(client.businessLocation)} />
            </>
          )}
          {client.sourceOfIncome?.toLowerCase() === "employed" && (
            <>
              <DetailRow label={a.t12} value={capitalizeWords(client.appOccupation)} />
              <DetailRow label={a.t14} value={capitalizeWords(client.appEmploymentStatus)} />
            </>
          )}
          <DetailRow label={a.t19} value={formatCurrency(client.appMonthlyIncome)} />
        </div>
      </section>
    </div>
  );
}
