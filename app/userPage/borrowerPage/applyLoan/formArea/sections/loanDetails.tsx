  "use client";

  import { useState } from "react";

  type LoanOption = {
    amount: number;
    months?: number;
    interest: number;
  };

  interface LoanDetailsProps {
    language: "en" | "ceb";
    loanType: "with" | "without" | "open-term";
    appLoanPurpose: string;
    setAppLoanPurpose: (val: string) => void;
    onLoanSelect: (loan: { amount: number; months?: number; interest: number } | null) => void;
    missingFields?: string[];
    showFieldErrors?: boolean;
    customLoanAmount?: number | "";
    setCustomLoanAmount?: (val: number | "") => void;
    selectedLoan?: LoanOption | null;
  }

  export default function LoanDetails({
    language,
    loanType,
    appLoanPurpose,
    setAppLoanPurpose,
    onLoanSelect,
    missingFields = [],
    showFieldErrors = false,
    customLoanAmount: externalCustomLoanAmount,
    setCustomLoanAmount: externalSetCustomLoanAmount,
    selectedLoan: externalSelectedLoan,
  }: LoanDetailsProps) {
    // Use local state if not controlled from parent
    const [internalCustomLoanAmount, setInternalCustomLoanAmount] = useState<number | "">("");
    const [internalSelectedLoan, setInternalSelectedLoan] = useState<LoanOption | null>(null);
    const [loanAmountError, setLoanAmountError] = useState<string>("");

    // Determine if using controlled or uncontrolled mode
    const customLoanAmount = externalCustomLoanAmount !== undefined ? externalCustomLoanAmount : internalCustomLoanAmount;
    const setCustomLoanAmount = externalSetCustomLoanAmount || setInternalCustomLoanAmount;
    const selectedLoan = externalSelectedLoan !== undefined ? externalSelectedLoan : internalSelectedLoan;
    const setSelectedLoan = externalSelectedLoan !== undefined ? onLoanSelect : setInternalSelectedLoan;

    // Loan options
    const withCollateralOptions: LoanOption[] = [
      { amount: 20000, months: 8, interest: 7 },
      { amount: 50000, months: 10, interest: 5 },
      { amount: 100000, months: 18, interest: 4 },
      { amount: 200000, months: 24, interest: 3 },
      { amount: 300000, months: 36, interest: 2 },
      { amount: 500000, months: 60, interest: 1.5 },
    ];

    const withoutCollateralOptions: LoanOption[] = [
      { amount: 10000, months: 5, interest: 10 },
      { amount: 15000, months: 6, interest: 10 },
      { amount: 20000, months: 8, interest: 10 },
      { amount: 30000, months: 10, interest: 10 },
    ];

    const openTermOptions: LoanOption[] = [
      { amount: 50000, interest: 6 },
      { amount: 100000, interest: 5 },
      { amount: 200000, interest: 4 },
      { amount: 500000, interest: 3 },
    ];

    const getLoanOptions = () => {
      switch (loanType) {
        case "with":
          return withCollateralOptions;
        case "without":
          return withoutCollateralOptions;
        case "open-term":
          return openTermOptions;
        default:
          return [];
      }
    };

    const validateLoanAmount = (amount: number) => {
      const options = getLoanOptions();

      if (options.length === 0) {
        setSelectedLoan(null);
        onLoanSelect(null);
        setLoanAmountError("");
        return;
      }

      const minAmount = Math.min(...options.map((o) => o.amount));
      const maxAmount = Math.max(...options.map((o) => o.amount));

      if (amount < minAmount) {
        setSelectedLoan(null);
        onLoanSelect(null);
        setLoanAmountError(
          language === "en"
            ? `Amount is below the minimum allowed (${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(minAmount)}).`
            : `Mas ubos sa minimum nga kantidad (${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(minAmount)}).`
        );
        return;
      }

      if (amount > maxAmount) {
        setSelectedLoan(null);
        onLoanSelect(null);
        setLoanAmountError(
          language === "en"
            ? `Amount exceeds the maximum allowed (${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(maxAmount)}).`
            : `Molapas sa maximum nga kantidad (${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(maxAmount)}).`
        );
        return;
      }

      // Within range: snap to nearest allowed bracket not exceeding amount
      const match = options
        .filter((o) => o.amount <= amount)
        .reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev), options[0]);

      setLoanAmountError("");
      setSelectedLoan(match);
      onLoanSelect({ ...match, amount });
    };


    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
          {language === "en" ? "Loan Details" : "Detalye sa Pahulam"}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Loan Purpose */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              {language === "en" ? "Loan Purpose:" : "Katuyoan sa Pahulam:"}
            </label>
            <input
              value={appLoanPurpose} 
              onChange={(e) => setAppLoanPurpose(e.target.value)} 
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields && missingFields.includes('Loan Purpose')) ? 'border-red-500' : 'border-gray-200'}`}
              placeholder={
                language === "en"
                  ? "Enter Loan Purpose"
                  : "Isulod ang Katuyoan sa Pahulam"
              }
            />
          </div>

          {/* Loan Amount */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              <span className="inline-flex items-center gap-2">
                {language === "en" ? "Loan Amount:" : "Kantidad sa Pahulam:"}
                {/* Info tooltip */}
                {(() => {
                  const options = getLoanOptions();
                  const hasOptions = options.length > 0;
                  const minAmount = hasOptions ? Math.min(...options.map(o => o.amount)) : null;
                  const maxAmount = hasOptions ? Math.max(...options.map(o => o.amount)) : null;
                  const formatAmt = (n: number | null) => (n === null ? "—" : formatCurrency(n));

                  const tipMain = language === 'en'
                    ? (loanType === 'open-term'
                        ? `Allowed range: ${formatAmt(minAmount)} – ${formatAmt(maxAmount)}. Interest adjusts by amount. No fixed term.`
                        : `Allowed range: ${formatAmt(minAmount)} – ${formatAmt(maxAmount)}. Interest and term adjust based on your amount.`)
                    : (loanType === 'open-term'
                        ? `Pwede nga kantidad: ${formatAmt(minAmount)} – ${formatAmt(maxAmount)}. Ang interest mosunod sa kantidad. Wala'y fixed nga termino.`
                        : `Pwede nga kantidad: ${formatAmt(minAmount)} – ${formatAmt(maxAmount)}. Ang interest ug termino mo-depende sa imong kantidad.`);

                  return (
                    <span className="relative inline-flex group align-middle">
                      <button
                        type="button"
                        aria-label={language === 'en' ? 'Loan amount information' : 'Impormasyon sa kantidad sa pahulam'}
                        className="h-5 w-5 rounded-full bg-gray-200 text-gray-700 text-[10px] leading-5 font-semibold inline-flex items-center justify-center select-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                        tabIndex={0}
                      >
                        i
                      </button>
                      <div
                        role="tooltip"
                        className="absolute z-30 top-1/2 left-full ml-2 -translate-y-1/2 w-64 max-w-[70vw] rounded-md bg-gray-100 text-gray-800 text-xs p-3 shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none"
                      >
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-100 rotate-45 border-l border-t border-gray-200"></div>
                        <p className="leading-snug">{tipMain}</p>
                      </div>
                    </span>
                  );
                })()}
              </span>
            </label>
            <input
              type="number"
              value={customLoanAmount}
              onChange={(e) => {
                const value = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                setCustomLoanAmount(value);
                if (value !== "") validateLoanAmount(Number(value));
                else {
                  setSelectedLoan(null);
                  onLoanSelect(null);
                  setLoanAmountError("");
                }
              }}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields && missingFields.includes('Loan Amount')) || loanAmountError || (selectedLoan === null && customLoanAmount !== "") ? 'border-red-500' : 'border-gray-200'}`}
              placeholder={
                language === "en"
                  ? "Enter loan amount"
                  : "Isulod ang kantidad sa Pahulam"
              }
            />
            {loanAmountError && (
              <p className="text-sm text-red-500 mt-1">{loanAmountError}</p>
            )}
            {selectedLoan === null && customLoanAmount !== "" && !loanAmountError && (
              <p className="text-sm text-red-500 mt-1">
                {language === "en"
                  ? "Amount not valid for this loan type."
                  : "Dili valid nga kantidad alang ani nga klase sa pahulam."}
              </p>
            )}
          </div>

          <div>
                <label className="block font-medium mb-2 text-gray-700">
                  {language === "en" ? "Monthly Interest Rate (%):" : "Bulan nga Interest Rate (%):"}
                </label>
                <input
                  className="w-full border border-gray-200 p-3 rounded-lg bg-gray-50"
                  value={selectedLoan?.interest || ""}
                  readOnly
                />
              </div>

          {/* Loan Terms & Interest (if applicable) */}
          {loanType !== "open-term" && (
            <>
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  {language === "en" ? "Loan Terms (months):" : "Panahon sa Pahulam (buwan):"}
                </label>
                <input
                  className="w-full border border-gray-200 p-3 rounded-lg bg-gray-50"
                  value={selectedLoan?.months || ""}
                  readOnly
                />
              </div>
            </>
          )}
        </div>

        {/* Sample Calculation OR Contact Message for Open-Term */}
        {customLoanAmount && selectedLoan && (
          <>
            {loanType === "open-term" ? (
              <div className="mt-6 border-t pt-4 text-gray-700">
                <p className="text-sm">
                  {language === "en"
                    ? "For a thorough explanation about this loan or if you wish to apply for higher amount, please contact our office."
                    : "Alang sa hingpit nga pagpasabot, palihug kontaka ang among opisina."}
                </p>
              </div>
            ) : (
              <div className="mt-6 border-t pt-4 text-gray-300">
                <h5 className="text-md font-semibold mb-3 text-gray-700">
                  {language === "en" ? "Sample Calculation" : "Halimbawang Kwenta"}
                </h5>

                {(() => {
                  const loanAmount = Number(customLoanAmount);
                  const interestRate = Number(selectedLoan.interest) / 100;
                  const months = selectedLoan.months || 12;

                  let serviceCharge = 0;
                  if (loanAmount >= 6000 && loanAmount <= 20000) {
                    serviceCharge = loanAmount * 0.05; 
                  } else if (loanAmount >= 25000 && loanAmount <= 45000) {
                    serviceCharge = 1000; 
                  } else if (loanAmount >= 50000) {
                    serviceCharge = loanAmount * 0.03;
                  }

                  const interestAmount = loanAmount * interestRate;
                  const totalInterestAmount = interestAmount * months;
                  const totalPayable = loanAmount + totalInterestAmount;
                  const monthlyPayment = totalPayable / months;

                  return (
                    <div className="space-y-2 text-gray-700 text-sm">
                      <p>
                        <span className="font-sm">{language === "en" ? "Loan Amount:" : "Kantidad sa Pahulam:"}</span>{" "}
                        ₱{loanAmount.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-sm">{language === "en" ? "Interest Amount:" : "Interest Amount:"}</span>{" "}
                        ₱{interestAmount.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-sm">{language === "en" ? "Total Interest Amount:" : "Total Interest Amount:"}</span>{" "}
                        ₱{totalInterestAmount.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-sm">{language === "en" ? "Total Payable:" : "Total Payable:"}</span>{" "}
                        ₱{totalPayable.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">{language === "en" ? "Monthly Payment:" : "Bulan nga Bayad:"}</span>{" "}
                        {formatCurrency(monthlyPayment)}
                      </p>
                      <p className="mt-5 text-gray-500">Note: Loan amount will be deducted with service charge during disbursement.</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
