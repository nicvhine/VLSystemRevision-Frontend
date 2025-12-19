"use client";
import React, { useState, useEffect } from "react";
import translationData from "@/app/commonComponents/translation";
import { translateLoanType } from "@/app/commonComponents/utils/formatters";
import { formatCurrency } from "@/app/commonComponents/utils/formatters";

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: "en" | "ceb";
}

interface LoanOptionWithCollateral {
  amount: number;
  interest: number;
  months: number;
}

interface LoanOptionWithoutCollateral {
  amount: number;
  months: number;
  interest: number;
}

interface OpenTermLoanOption {
  amount: number;
  interest: number;
}

type LoanOption =
  | LoanOptionWithCollateral
  | LoanOptionWithoutCollateral
  | OpenTermLoanOption;

interface OpenTermSampleCollection {
  collectionNumber: number;
  principal: number;
  interestRate: number;
  interestAmount: number;
  totalPayable: number;
  minimumPayment: number;
  paidAmount: number;
  remainingPrincipal: number;
}

export default function SimulatorModal({
  isOpen,
  onClose,
  language = "en",
}: SimulatorModalProps) {
  const [loanType, setLoanType] = useState("");
  const [loanOptions, setLoanOptions] = useState<number[]>([]);
  const [selectedLoanAmount, setSelectedLoanAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const t = translationData.loanTermsTranslator[language];
  const s = translationData.simulatorTranslator[language];
  const pub = translationData.publicTranslation[language];

  const [result, setResult] = useState<any>(null);
  const [collections, setCollections] = useState<OpenTermSampleCollection[]>([]);

  const paymentPeriod = "monthly";

  // Animation
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Loan tables
  const withCollateralTable: LoanOptionWithCollateral[] = [
    { amount: 20000, months: 8, interest: 7 },
    { amount: 50000, months: 10, interest: 5 },
    { amount: 100000, months: 18, interest: 4 },
    { amount: 200000, months: 24, interest: 3 },
    { amount: 300000, months: 36, interest: 2 },
    { amount: 500000, months: 60, interest: 1.5 },
  ];

  const withoutCollateralTable: LoanOptionWithoutCollateral[] = [
    { amount: 10000, months: 5, interest: 10 },
    { amount: 15000, months: 6, interest: 10 },
    { amount: 20000, months: 8, interest: 10 },
    { amount: 30000, months: 10, interest: 10 },
  ];

  const openTermTable: OpenTermLoanOption[] = [
    { amount: 50000, interest: 6 },
    { amount: 100000, interest: 5 },
    { amount: 200000, interest: 4 },
    { amount: 500000, interest: 3 },
  ];

  // Update loan options when type changes
  useEffect(() => {
    if (loanType === "regularWith")
      setLoanOptions(withCollateralTable.map((opt) => opt.amount));
    else if (loanType === "regularWithout")
      setLoanOptions(withoutCollateralTable.map((opt) => opt.amount));
    else if (loanType === "openTerm")
      setLoanOptions(openTermTable.map((opt) => opt.amount));
    else setLoanOptions([]);

    setSelectedLoanAmount("");
    setAmountError("");
    setResult(null);
    setShowResult(false);
    setCollections([]);
  }, [loanType]);

  // Validate loan amount input
  useEffect(() => {
    if (!selectedLoanAmount) {
      setAmountError("");
      return;
    }
    const amt = Number(selectedLoanAmount);
    const minAmt = Math.min(...loanOptions);
    const maxAmt = Math.max(...loanOptions);

    if (amt < minAmt) setAmountError(`Minimum amount is ₱${minAmt.toLocaleString()}.`);
    else if (amt > maxAmt) setAmountError(`Maximum amount is ₱${maxAmt.toLocaleString()}.`);
    else setAmountError("");
  }, [selectedLoanAmount, loanOptions]);

  // Open-term: update paid amount
  const updateCollectionPayment = (idx: number, paidAmount: number) => {
    setCollections((prev) => {
      const newCols = [...prev];
      const principal = idx === 0 ? Number(selectedLoanAmount) : newCols[idx - 1].remainingPrincipal;
      const rate = newCols[idx].interestRate;

      const interestAmount = principal * (rate / 100);
      const totalPayable = principal + interestAmount;
      const minimumPayment = interestAmount;
      const excess = paidAmount - minimumPayment > 0 ? paidAmount - minimumPayment : 0;
      const remainingPrincipal = principal - excess;

      newCols[idx] = {
        ...newCols[idx],
        principal,
        interestAmount,
        totalPayable,
        minimumPayment,
        paidAmount,
        remainingPrincipal,
      };

      // Update next collection
      if (idx + 1 < newCols.length) {
        const nextPrincipal = remainingPrincipal;
        const nextRate = rate;
        const nextInterest = nextPrincipal * (nextRate / 100);
        const nextTotal = nextPrincipal + nextInterest;
        const nextMinPay = nextInterest;
        newCols[idx + 1] = {
          ...newCols[idx + 1],
          principal: nextPrincipal,
          interestRate: nextRate,
          interestAmount: nextInterest,
          totalPayable: nextTotal,
          minimumPayment: nextMinPay,
          paidAmount: 0,
          remainingPrincipal: nextPrincipal + nextInterest,
        };
      }

      return newCols;
    });
  };

  // Calculate loan
  const calculateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanType || !selectedLoanAmount || amountError) return;

    const amt = Number(selectedLoanAmount);
    let loanOption: LoanOption | undefined;

    // Match closest table value for interest
    if (loanType === "regularWith")
      loanOption = withCollateralTable.find((opt) => amt <= opt.amount) || withCollateralTable[withCollateralTable.length - 1];
    else if (loanType === "regularWithout")
      loanOption = withoutCollateralTable.find((opt) => amt <= opt.amount) || withoutCollateralTable[withoutCollateralTable.length - 1];
    else if (loanType === "openTerm")
      loanOption = openTermTable.find((opt) => amt <= opt.amount) || openTermTable[openTermTable.length - 1];

    if (!loanOption) return;

    const rate = loanOption.interest;
    const months = "months" in loanOption ? loanOption.months : 12;

    if (loanType === "openTerm") {
      // Initialize first 2 collections
      const first: OpenTermSampleCollection = {
        collectionNumber: 1,
        principal: amt,
        interestRate: rate,
        interestAmount: amt * (rate / 100),
        totalPayable: amt + amt * (rate / 100),
        minimumPayment: amt * (rate / 100),
        paidAmount: 0,
        remainingPrincipal: amt,
      };
      const second: OpenTermSampleCollection = {
        collectionNumber: 2,
        principal: 0,
        interestRate: rate,
        interestAmount: 0,
        totalPayable: 0,
        minimumPayment: 0,
        paidAmount: 0,
        remainingPrincipal: 0,
      };
      setCollections([first, second]);
      setResult(null);
    } else {
      // const totalInterest = interest * months;
      // const totalRepayment = amt + totalInterest;
      // const paymentPerPeriod = totalRepayment / months;

      const interestAmount = amt * rate / 100;
      const totalInterest = interestAmount * months;
      const totalPayable = amt + totalInterest;
      const monthlyDue = totalPayable / months;

      setResult({
        paymentPeriod:
          paymentPeriod === "monthly"
            ? "Monthly (12 months per year)"
            : "15th of the Month",
        principalAmount: `₱${amt.toLocaleString()}`,
        interestRate: `${rate}%`,
        interest: `₱${interestAmount.toLocaleString()}`,
        totalInterest: `₱${totalInterest.toLocaleString()}`,
        totalPayment: `₱${totalPayable.toLocaleString()}`,
        loanTerm: `${months} ${pub.months}`,
        paymentPerPeriod: `₱${monthlyDue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      });
      setCollections([]);
    }

    setTimeout(() => setShowResult(true), 10);
  };

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 text-black z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 transition-opacity duration-300 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative p-6 transform transition-all duration-300 ease-out ${
          animateIn
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{pub.loanSimulation}</h2>

        <form onSubmit={calculateLoan} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{pub.loanType}</label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500"
              >
                <option value="">{pub.selectLoanType}</option>
                {["regularWithout", "regularWith", "openTerm"].map((type) => (
                  <option key={type} value={type}>
                    {translateLoanType(type, language)}
                  </option>
                ))}
              </select>
            </div>

            {loanType && (
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {pub.loanAmount}
              </label>
            
              {/* RANGE NOTE */}
              {loanOptions.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Allowed range: ₱{Math.min(...loanOptions).toLocaleString()} – ₱{Math.max(...loanOptions).toLocaleString()}
                </p>
              )}
            
              <input
                type="number"
                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 ${
                  amountError ? "border-red-500" : "border-gray-300"
                }`}
                value={selectedLoanAmount}
                onChange={(e) => setSelectedLoanAmount(e.target.value)}
                placeholder="Enter amount"
              />
            
              {amountError && (
                <p className="text-sm mt-1 text-red-600">{amountError}</p>
              )}
            </div>
            
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedLoanAmount || amountError !== ""}
            className="w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:bg-red-600"
          >
            {pub.calculate}
          </button>
        </form>

        {/* Regular loan result */}
        {result && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6 transform transition-all duration-500 ease-out">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{s.s2}</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div>
                <div className="mb-4"><div className="font-semibold">{t.l4}:</div><div>{result.principalAmount}</div></div>
                <div className="mb-4"><div className="font-semibold">{t.l5}:</div><div>{result.interestRate}</div></div>
                <div className="mb-4"><div className="font-semibold">{t.l6}:</div><div>{result.interest}</div></div>
                <div className="mb-4"><div className="font-semibold">{t.l111}:</div><div>{result.totalInterest}</div></div>
                <div className="mb-4"><div className="font-semibold">{t.l7}:</div><div>{result.totalPayment}</div></div>
              </div>
              <div>
                <div className="mb-4"><div className="font-semibold">{t.l8}:</div><div>{result.loanTerm}</div></div>
                <div className="mb-4"><div className="font-semibold">{t.l9}:</div><div>{result.paymentPerPeriod}</div></div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 italic">{s.s3}</div>
          </div>
        )}

        {/* Open-term collections */}
        {collections.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Open-Term Sample Collections</h3>
            {collections.map((col, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-2"
              >
                <h4 className="font-semibold text-gray-800 text-lg mb-2">COLLECTION {col.collectionNumber}</h4>
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Principal:</span>
                  <span>{formatCurrency(col.principal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Interest Rate:</span>
                  <span>{col.interestRate}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Interest Amount:</span>
                  <span>{formatCurrency(col.interestAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total Payable:</span>
                  <span>{formatCurrency(col.totalPayable)}</span>
                </div>

                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Minimum Payment:</span>
                  <span>{formatCurrency(col.minimumPayment)}</span>
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Paid Amount:</label>
                  <input
                    type="number"
                    value={col.paidAmount}
                    onChange={(e) => updateCollectionPayment(idx, Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-right focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
