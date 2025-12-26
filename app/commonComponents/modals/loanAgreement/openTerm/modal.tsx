"use client";

import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { addMonthsSafe } from "./logic";
import { formatCurrency, capitalizeWords } from "../../../utils/formatters";
import { AgreementModalProps } from "../../../utils/Types/modal";

/**
 * Signatory section component for loan agreement
 * Displays role and name with signature line
 * @param role - Role/title of the signatory
 * @param name - Name of the signatory
 * @returns JSX element containing the signatory section
 */
function SignatorySection({ role, name }: { role: string; name: string }) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center space-x-4">
        <p className="font-semibold w-32">{role}</p>
        <p className="flex-1">{name}</p>
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-4">
          <p className="w-32">Type of ID</p>
          <span className="flex-1 border-b border-gray-700"></span>
        </div>
        <div className="flex items-center space-x-4">
          <p className="w-32">ID Number</p>
          <span className="flex-1 border-b border-gray-700"></span>
        </div>
        <div className="flex items-center space-x-4">
          <p className="w-32">Valid until</p>
          <span className="flex-1 border-b border-gray-700"></span>
        </div>
      </div>

      <div className="flex flex-col space-y-2 mt-3">
        <p>Signed in the presence of:</p>
        <p className="mt-5 text-gray-700">{name}</p>
      </div>
    </div>
  );
}

// Modal to preview and print the loan agreement
export default function AgreementModal({
  isOpen,
  onClose,
  application,
  onAccept,
}: AgreementModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // Read role from storage for print button visibility
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role");
      setRole(storedRole);
    }
  }, []);

  // Animation timing on open/close
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

  if (!showModal || !application) return null;

  const disburseDate = new Date(application.dateDisbursed);

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printSection,
          #printSection * {
            visibility: visible !important;
          }
          #printSection {
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 9pt !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: legal portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col print:w-[216mm] print:h-[356mm] print:rounded-none print:shadow-none transform transition-all duration-300 ease-out ${
          animateIn
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-700">Loan Agreement</h2>
            <p className="text-sm text-gray-500">Borrower: {capitalizeWords(application.appName)}</p>
          </div>
          <div className="flex gap-3 items-center">
            {role !== "head" && (
              <button
                onClick={() => onAccept?.()}
                className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Accept & Submit
              </button>
            )}
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 flex justify-center py-6 print:bg-white print:overflow-visible">
          <div
            id="printSection"
            className="bg-white shadow-2xl border border-gray-300 w-[216mm] min-h-[356mm] p-[25mm] text-justify leading-relaxed text-[8pt] text-gray-900 print:shadow-none print:border-none"
          >
            <div className="text-[9pt]">
              {/* HEADER */}
              <h2 className="text-center text-lg font-bold">
                VISTULA LENDING CORPORATION
              </h2>
              <p className="text-center">BG Business Center, Cantecson, Gairan</p>
              <p className="text-center mb-6">Bogo City, Cebu</p>
              <h3 className="text-center text-l font-semibold mb-6">
                LOAN AGREEMENT
              </h3>

              {/* AGREEMENT BODY */}
              <p>This Loan Agreement is made and executed by and between:</p>
              <p>
                <strong>VISTULA LENDING CORPORATION</strong>, a business establishment with office
                address at Gairan, Bogo City, Cebu, represented in this instance by its owner, <strong>DIVINA DAMAYO ALBURO</strong>, of legal age, Filipino and a resident of Don Pedro, Bogo City, Cebu, 
                hereinafter known as the <strong>LENDER</strong>.
              </p>
              <p>AND</p>
              <p>
                <strong>{capitalizeWords(application.appName)}</strong>, of legal age, Filipino,
                and a resident of {application.appAddress}, hereinafter known as the <strong>BORROWER</strong>.
              </p>

              {/* TERMS */}
              <p className="text-center text-l font-semibold mb-6">WITNESSETH</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>Loan Amount.</strong> The <strong>LENDER</strong> agrees to lend and the <strong>BORROWER</strong> 
                  {""} agrees to borrow the sum of {formatCurrency(application.appLoanAmount)}.
                </li>
                <li>
                  <strong>Interest Rate.</strong> The loan shall accrue diminishing interest at a rate of {application.appInterestRate}% per
                  month, recalculated based on remaining unpaid principal. Interest due is calculated until the principal amount is fully paid.
                </li>
                <li>
                  <strong>Repayment Terms.</strong> The Borrower shall repay the loan according to the
                  following terms:
                  <ul className="list-disc list-inside ml-6 space-y-1">
                  <li>
                    <strong>Repayment Schedule:</strong> Loan shall be paid on 12 monthly installment. Monthly payment should not be less than monthly interest due. The periodic amount should be applied first to the 
                    accumulated and unpaid interest before applied to the principal. The first payment of principal shall be on {(() => {
                            if (application?.dateDisbursed) {
                              const disburseDate = new Date(application.dateDisbursed);
                              const firstPaymentDate = new Date(disburseDate);
                              firstPaymentDate.setMonth(disburseDate.getMonth() + 1);
                
                              return firstPaymentDate.toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              });
                            }     
                            return "Not yet set";
                          })()} in the minimum amount of {formatCurrency(application.appLoanAmount * application.appInterestRate / 100)} and the remaining amount will be due every {(() => {
                            if (application?.dateDisbursed) {
                            const disburseDate = new Date(application.dateDisbursed);
                            const dueDay = disburseDate.getDate();
                            return `${dueDay}${
                                ["th", "st", "nd", "rd"][
                                (dueDay % 10 < 4 && ![11, 12, 13].includes(dueDay % 100))
                                    ? dueDay % 10
                                    : 0
                                ]
                            }`;
                            }
                            return "same day";
                        })()}{" "}
                        of the succeeding months.
                        </li>
                    </ul>
                </li>
                <ul className="list-disc list-inside ml-6 space-y-1">
                <li>
                <strong>Final Payment Date:</strong> The loan should be paid in full on or before{" "}
                  {application?.dateDisbursed
                    ? (() => {
                        const disburseDate = new Date(application.dateDisbursed);
                        // Add 12 months
                        const finalPaymentDate = new Date(disburseDate);
                        finalPaymentDate.setMonth(finalPaymentDate.getMonth() + 12);

                        return finalPaymentDate.toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      })()
                    : "Not yet set"}
                  .
                </li>
                </ul>
                <li>
                    <strong>Default</strong>. The <strong>BORROWER</strong> shall be in Default if any of the following events occur:
                    <ul className="list-disc list-inside ml-6">
                      <li>Failure to make any payment under this agreement within 3 months after it is due.</li>
                      <li>Breach of any material term of this agreement.</li>
                    </ul>
                    <ul className="ml-6">
                      <li>In case of Default, the toal unpaid balance shall become due and demandable plus additional 10% monthly surcharges until fully paid.</li>
                      <li>The periodic payment shall be applied first to the accumulated and unpaid penalty fees before applied to unpaid balance.</li>
                    </ul>
                  </li>
              </ol>

              {/* SIGNATORIES */}
              <div className="grid grid-cols-2 gap-6 mt-5">
                <SignatorySection
                  role="LENDER"
                  name="DIVINA DAMAYO ALBURO"
                />
                <SignatorySection
                  role="BORROWER"
                  name={capitalizeWords(application.appName)}
                />
              </div>
              <p className="text-center text-l font-semibold mb-6 mt-10 ">ACKNOWLEDGEMENT</p>
              <p>
                  Before me, Notary Public in Bogo City, Cebu, this day of {application?.dateDisbursed
                      ? new Date(application.dateDisbursed).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not yet set"}{" "}, personally appeared the parties and acknowledged this as their free act and deed.
                </p>
                <p>WITNESS MY HAND AND SEAL on the date and place first written above.</p>

                <p className=" mt-4">
                  Doc. No. ______<br />
                  Page No. ______<br />
                  Book No. ______<br />
                  Series of ______
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
