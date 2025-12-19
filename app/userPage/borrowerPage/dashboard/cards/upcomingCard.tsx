'use client';
import React, { useState } from 'react';
import { Collection } from '@/app/commonComponents/utils/Types/collection';
import { Loan } from '@/app/commonComponents/utils/Types/loan';
import CustomAmountModal from '@/app/commonComponents/modals/payModal';

interface UpcomingCollectionCardProps {
  collection: Collection;
  activeLoan: Loan;
  canPay: boolean;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  setShowErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UpcomingCollectionCard({
  collection,
  activeLoan,
  canPay,
  setErrorMsg,
  setShowErrorModal,
}: UpcomingCollectionCardProps) {
  const [showModal, setShowModal] = useState(false);

  // --- Open-Term calculation ---
  const isOpenTerm = activeLoan.loanType === "Open-Term Loan";
  const monthlyInterestRate = activeLoan.appInterestRate / 100;
  const dueInterest = isOpenTerm
    ? collection.periodInterestAmount || (activeLoan.balance * monthlyInterestRate)
    : collection.periodBalance;
  const runningBalance = isOpenTerm
    ? collection.runningBalance || activeLoan.balance
    : collection.loanBalance;

  return (
    <>
      <div
        onClick={() => canPay && setShowModal(true)}
        className={`transition-all duration-300 rounded-2xl shadow-md p-5 flex flex-col gap-4 border cursor-pointer
          ${canPay ? 'bg-white hover:shadow-lg border-gray-200' : 'bg-gray-100 cursor-not-allowed opacity-70 border-gray-300'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className={`font-semibold text-lg ${canPay ? 'text-gray-900' : 'text-gray-500'}`}>
            Collection #{collection.collectionNumber}
          </p>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              canPay ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {collection.status}
          </span>
        </div>

        {/* Dates and Amount */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Due Date:</span>{' '}
            {new Date(collection.dueDate).toLocaleDateString('en-PH')}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            ₱{collection.periodBalance.toLocaleString()}
          </p>
        </div>

        {/* Open-Term Note */}
        {isOpenTerm && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">Minimum Payment:</span>{' '}
              <span className="font-semibold text-gray-900">₱{dueInterest.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium text-gray-900">Balance:</span>{' '}
              <span className="font-semibold text-gray-900">₱{runningBalance.toLocaleString()}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              *Excess payment will be deducted from your loan balance.
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <CustomAmountModal
          collection={collection}
          activeLoan={activeLoan}
          setErrorMsg={setErrorMsg}
          setShowErrorModal={setShowErrorModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
