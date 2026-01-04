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
    reloanData?: any;
    remainingBalanceOption?: 'add-to-principal' | 'deduct-from-receivable' | null;
    setRemainingBalanceOption?: (val: 'add-to-principal' | 'deduct-from-receivable' | null) => void;
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
    reloanData,
    remainingBalanceOption: externalRemainingBalanceOption,
    setRemainingBalanceOption: externalSetRemainingBalanceOption,
  }: LoanDetailsProps) {
    // Use local state if not controlled from parent
    const [internalCustomLoanAmount, setInternalCustomLoanAmount] = useState<number | "">("");
    const [internalSelectedLoan, setInternalSelectedLoan] = useState<LoanOption | null>(null);
    const [loanAmountError, setLoanAmountError] = useState<string>("");
    const [internalRemainingBalanceOption, setInternalRemainingBalanceOption] = useState<'add-to-principal' | 'deduct-from-receivable' | null>(null);

    // Determine if using controlled or uncontrolled mode
    const customLoanAmount = externalCustomLoanAmount !== undefined ? externalCustomLoanAmount : internalCustomLoanAmount;
    const setCustomLoanAmount = externalSetCustomLoanAmount || setInternalCustomLoanAmount;
    const selectedLoan = externalSelectedLoan !== undefined ? externalSelectedLoan : internalSelectedLoan;
    const setSelectedLoan = externalSelectedLoan !== undefined ? onLoanSelect : setInternalSelectedLoan;
    const remainingBalanceOption = externalRemainingBalanceOption !== undefined ? externalRemainingBalanceOption : internalRemainingBalanceOption;
    const setRemainingBalanceOption = externalSetRemainingBalanceOption || setInternalRemainingBalanceOption;

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
      let options: LoanOption[] = [];
      switch (loanType) {
        case "with":
          options = withCollateralOptions;
          break;
        case "without":
          options = withoutCollateralOptions;
          break;
        case "open-term":
          options = openTermOptions;
          break;
        default:
          options = [];
      }

      // If "add to principal" is selected and there's a remaining balance, adjust the max amount
      if (remainingBalanceOption === 'add-to-principal' && reloanData?.remainingBalance > 0) {
        const remainingBalance = reloanData.remainingBalance;
        return options.map(opt => ({
          ...opt,
          amount: Math.max(opt.amount - remainingBalance, 0),
        }));
      }

      return options;
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

        {/* Remaining Balance Options for Reloan */}
        {reloanData?.isReloan && reloanData?.remainingBalance > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">
              {language === "en" ? "Remaining Balance from Previous Loan" : "Natitirang Bayad mula sa Nakaraang Pahulam"}
            </h5>
            <p className="text-blue-800 text-sm mb-4">
              {language === "en" 
                ? `You have a remaining balance of ₱${(reloanData.remainingBalance || 0).toLocaleString()}. How would you like to handle this?`
                : `May natitirang bayad kang ₱${(reloanData.remainingBalance || 0).toLocaleString()}. Paano mo gustong tratuhin ito?`
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Add to Principal Option */}
              <button
                type="button"
                onClick={() => setRemainingBalanceOption('add-to-principal')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  remainingBalanceOption === 'add-to-principal'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-green-300'
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">
                  {language === "en" ? "Add to Principal" : "Idagdag sa Pundasyon"}
                </div>
                <div className="text-sm text-gray-600">
                  {language === "en" 
                    ? "Add the remaining balance to your new loan amount"
                    : "Idagdag ang natitirang bayad sa iyong bagong pahulam"
                  }
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {language === "en"
                    ? `You'll borrow more: ₱${(reloanData.remainingBalance || 0).toLocaleString()} extra`
                    : `Hulugan mo nang mas marami: ₱${(reloanData.remainingBalance || 0).toLocaleString()} extra`
                  }
                </div>
              </button>

              {/* Deduct from Receivable Option */}
              <button
                type="button"
                onClick={() => setRemainingBalanceOption('deduct-from-receivable')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  remainingBalanceOption === 'deduct-from-receivable'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">
                  {language === "en" ? "Deduct from Receivable" : "Ibawas sa Tumanggap"}
                </div>
                <div className="text-sm text-gray-600">
                  {language === "en" 
                    ? "Pay off the remaining balance from your new loan"
                    : "Bayaran ang natitirang bayad mula sa bagong pahulam"
                  }
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {language === "en"
                    ? `You'll receive less: ₱${(reloanData.remainingBalance || 0).toLocaleString()} deducted`
                    : `Matatanggap mo nang mas konti: ₱${(reloanData.remainingBalance || 0).toLocaleString()} ibawas`
                  }
                </div>
              </button>
            </div>
          </div>
        )}

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

            {/* Final Loan Amount for Add to Principal */}
            {remainingBalanceOption === 'add-to-principal' && reloanData?.remainingBalance > 0 && selectedLoan && customLoanAmount !== "" && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {language === "en" ? "New Loan" : "Bagong Pahulam"}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₱{Number(customLoanAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {language === "en" ? "Remaining Balance" : "Natitirang Bayad"}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₱{(reloanData.remainingBalance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px bg-emerald-200"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-emerald-900">
                      {language === "en" ? "Total Loan Amount" : "Kabuuang Pahulam"}
                    </span>
                    <span className="text-xl font-bold text-emerald-700">
                      ₱{(Number(customLoanAmount) + (reloanData.remainingBalance || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
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
                  const newLoanAmount = Number(customLoanAmount);
                  const remainingBalance = remainingBalanceOption === 'add-to-principal' ? (reloanData?.remainingBalance || 0) : 0;
                  const loanAmount = newLoanAmount + remainingBalance;
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
                      {remainingBalanceOption === 'add-to-principal' && remainingBalance > 0 && (
                        <>
                          <p>
                            <span className="font-sm">{language === "en" ? "New Loan Amount:" : "Bagong Kantidad sa Pahulam:"}</span>{" "}
                            ₱{newLoanAmount.toLocaleString()}
                          </p>
                          <p>
                            <span className="font-sm">{language === "en" ? "Remaining Balance:" : "Natitirang Bayad:"}</span>{" "}
                            ₱{remainingBalance.toLocaleString()}
                          </p>
                          <div className="h-px bg-gray-300 my-2"></div>
                        </>
                      )}
                      <p>
                        <span className="font-sm">{language === "en" ? "Total Loan Amount:" : "Kabuuang Kantidad sa Pahulam:"}</span>{" "}
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
