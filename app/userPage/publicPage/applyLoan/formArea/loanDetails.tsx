"use client";

import { useState } from "react";

// Type definition for loan options
type LoanOption = {
  amount: number;
  months?: number;
  interest: number;
};

// Props interface for LoanDetails component
interface LoanDetailsProps {
  language: "en" | "ceb";
  loanType: "with" | "without" | "open-term";
  appLoanPurpose: string;
  setAppLoanPurpose: (val: string) => void;
  onLoanSelect: (loan: { amount: number; months?: number; interest: number } | null) => void;
  missingFields?: string[];
}

/**
 * Loan details component for selecting loan options and purpose
 * Displays different loan options based on loan type (with/without collateral, open-term)
 * @param language - Current language setting (English or Cebuano)
 * @param loanType - Type of loan (with collateral, without collateral, or open-term)
 * @param appLoanPurpose - Current loan purpose value
 * @param setAppLoanPurpose - Function to set loan purpose
 * @param onLoanSelect - Callback function when a loan option is selected
 * @param missingFields - Array of missing field names for validation
 * @returns JSX element containing the loan details form section
 */
export default function LoanDetails({
  language,
  loanType,
  appLoanPurpose,
  setAppLoanPurpose,
  onLoanSelect,
}: LoanDetailsProps) {
  const [customLoanAmount, setCustomLoanAmount] = useState<number | "">("");
  const [selectedLoan, setSelectedLoan] = useState<LoanOption | null>(null);

  // Loan options for different loan types
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

  // Validate entered loan amount and inform parent
  const validateLoanAmount = (amount: number) => {
    const match = getLoanOptions().find((opt) => opt.amount === amount) || null;
    setSelectedLoan(match);
    onLoanSelect(match); // ✅ update parent state
  };

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
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
            {language === "en" ? "Loan Amount:" : "Kantidad sa Pahulam:"}
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
              }
            }}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              selectedLoan === null && customLoanAmount !== "" ? "border-red-500" : "border-gray-200"
            }`}
            placeholder={
              language === "en"
                ? "Enter loan amount"
                : "Isulod ang kantidad sa Pahulam"
            }
          />
          {selectedLoan === null && customLoanAmount !== "" && (
            <p className="text-sm text-red-500 mt-1">
              {language === "en"
                ? "Amount not valid for this loan type."
                : "Dili valid nga kantidad alang ani nga klase sa pahulam."}
            </p>
          )}
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
          </>
        )}
      </div>

      {/* Sample Calculation */}
      {customLoanAmount && selectedLoan && (
        <div className="mt-6 border-t pt-4">
          <h5 className="text-md font-semibold mb-3 text-gray-700">
            {language === "en" ? "Sample Calculation" : "Halimbawang Kwenta"}
          </h5>

          {(() => {
            const loanAmount = Number(customLoanAmount);
            const interestRate = Number(selectedLoan.interest) / 100;
            const months = selectedLoan.months || 12;
            const monthlyInterest = loanAmount * interestRate;
            const monthlyPayment = loanAmount / months + monthlyInterest;
            let serviceCharge = 0;
            if (loanAmount >= 6000 && loanAmount <= 20000) serviceCharge = loanAmount * 0.05;
            else if (loanAmount >= 25000 && loanAmount <= 45000) serviceCharge = 1000;
            else if (loanAmount >= 50000) serviceCharge = loanAmount * 0.03;
            const netProceeds = loanAmount - serviceCharge;

            return (
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-medium">{language === "en" ? "Loan Amount:" : "Kantidad sa Pahulam:"}</span>{" "}
                  ₱{loanAmount.toLocaleString()}
                </p>
                {loanType !== "open-term" && (
                  <p>
                    <span className="font-medium">{language === "en" ? "Monthly Payment:" : "Bulan nga Bayad:"}</span>{" "}
                    ₱{monthlyPayment.toFixed(2)}
                  </p>
                )}
                {serviceCharge > 0 && (
                  <p>
                    <span className="font-medium">{language === "en" ? "Service Fee:" : "Serbisyo nga Bayad:"}</span>{" "}
                    ₱{serviceCharge.toFixed(2)}
                  </p>
                )}
                <p className="text-green-700 font-semibold">
                  <span>{language === "en" ? "Net Proceeds:" : "Netong Makadawat:"}</span> ₱{netProceeds.toFixed(2)}
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}