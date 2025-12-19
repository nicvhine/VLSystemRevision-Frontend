'use client';

import React, { useMemo } from 'react';
import ErrorModal from '@/app/commonComponents/modals/errorModal';
import TermsGateModal from '@/app/commonComponents/modals/termsPrivacy/TermsGateModal';
import TermsContentModal from '@/app/commonComponents/modals/termsPrivacy/TermsContentModal';
import PrivacyContentModal from '@/app/commonComponents/modals/termsPrivacy/PrivacyContentModal';
import PaymentHistoryModal from '@/app/commonComponents/modals/paymentHistoryModal/modal';
import ReceiptModal from '@/app/commonComponents/modals/receiptModal';
import { LoadingSpinner } from '@/app/commonComponents/utils/loading';

import useBorrowerDashboard from './hooks';
import translations from '@/app/commonComponents/translation';

// Cards
import LoanDetailsCard from './cards/loanDetailsCard';
import PaymentProgressCard from './cards/paymentProgressCard';
import UpcomingCollectionCard from './cards/upcomingCard';
import PaidCollectionCard from './cards/paidCollectionCard';
import CreditScoreCard from './cards/creditScoreCard';
import BorrowerClient from '../borrowerClient';

export default function BorrowerDashboard() {
  const borrowersId =
    typeof window !== 'undefined' ? localStorage.getItem('borrowersId') : null;

  const dashboard = useBorrowerDashboard(borrowersId);

  const {
    allLoans,
    collections,
    paidPayments,
    paymentProgress,
    loading,
    error,
    showErrorModal,
    setShowErrorModal,
    errorMsg,
    setErrorMsg,
    showTermsModal,
    setShowTermsModal,
    showTosContent,
    setShowTosContent,
    showPrivacyContent,
    setShowPrivacyContent,
    tosRead,
    setTosRead,
    privacyRead,
    setPrivacyRead,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentModalAnimateIn,
    showReceiptModal,
    setShowReceiptModal,
    receiptData,
    language,
    t,
  } = dashboard;

  const bp = translations.borrowerPageTranslation[language];

  // Reset terms reads each time modal opens
  React.useEffect(() => {
    if (showTermsModal) {
      setTosRead(false);
      setPrivacyRead(false);
    }
  }, [showTermsModal, setTosRead, setPrivacyRead]);

  // Pick the loan to display: active first, else most recent inactive
  const displayedLoan = useMemo(() => {
    if (!allLoans || allLoans.length === 0) return null;
  
    // 1. Active loans sorted descending
    const activeLoans = allLoans
      .filter((loan) => loan.status === "Active")
      .sort(
        (a, b) =>
          new Date(b.dateDisbursed ?? 0).getTime() -
          new Date(a.dateDisbursed ?? 0).getTime()
      );
  
    if (activeLoans.length > 0) return activeLoans[0];
  
    // 2. Inactive loans sorted descending
    const inactiveLoans = allLoans
      .filter((loan) => loan.status !== "Active")
      .sort(
        (a, b) =>
          new Date(b.dateDisbursed ?? 0).getTime() -
          new Date(a.dateDisbursed ?? 0).getTime()
      );
  
    return inactiveLoans[0] || null;
  }, [allLoans]);
  
  

  const borrowerId = displayedLoan?.borrowersId || borrowersId || '';

  const upcoming = displayedLoan
    ? collections.filter(
        (c) =>
          c.borrowersId === borrowerId &&
          c.loanId === displayedLoan.loanId &&
          c.status !== 'Paid'
      )
    : [];

  const paid = displayedLoan
    ? collections.filter(
        (c) =>
          c.borrowersId === borrowerId &&
          c.loanId === displayedLoan.loanId &&
          c.status === 'Paid'
      )
    : [];

  return (
    <BorrowerClient>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : !displayedLoan ? (
        <p>{bp.t38}</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4">
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <LoanDetailsCard activeLoan={displayedLoan} language={language} />
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <div className="w-full sm:flex-1">
                <PaymentProgressCard
                  collections={collections}
                  paymentProgress={paymentProgress}
                  borrowerId={borrowerId}
                />
              </div>
              <div className="w-full sm:w-64 lg:flex-1">
                <CreditScoreCard
                  creditScore={displayedLoan.creditScore || 10}
                  className="h-full"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 md:overflow-y-auto md:max-h-screen">
            <h3 className="text-xl font-semibold">{bp.t39}</h3>
            {upcoming.length > 0 ? (
              upcoming.map((collection, i) => {
                const canPay = i === 0 || upcoming[i - 1].status === 'Paid';
                return (
                  <UpcomingCollectionCard
                    key={collection.collectionNumber}
                    collection={collection}
                    activeLoan={displayedLoan!}
                    canPay={canPay}
                    setErrorMsg={setErrorMsg}
                    setShowErrorModal={setShowErrorModal}
                  />
                );
              })
            ) : (
              <p>{bp.t40}</p>
            )}

          {paid.length > 0 && (
              <>
                <h4 className="text-lg font-semibold mt-4">{bp.t41}</h4>
                {paid.map((c) => (
                  <PaidCollectionCard key={c.collectionNumber} collection={c} />
                ))}
              </>
            )}
          </div>

          <PaymentHistoryModal
            isOpen={isPaymentModalOpen}
            animateIn={paymentModalAnimateIn}
            onClose={() => setIsPaymentModalOpen(false)}
            paidPayments={paidPayments}
          />

          {showErrorModal && (
            <ErrorModal
              isOpen={showErrorModal}
              message={errorMsg}
              onClose={() => setShowErrorModal(false)}
            />
          )}

          {showTermsModal && (
            <TermsGateModal
              language={language}
              onCancel={() => {}}
              onOpenTos={() => setShowTosContent(true)}
              onOpenPrivacy={() => setShowPrivacyContent(true)}
              tosRead={tosRead}
              privacyRead={privacyRead}
              acceptLabel={
                language === 'en' ? 'Accept and continue' : 'Mouyon ug mopadayon'
              }
              onAccept={() => {
                setShowTermsModal(false);
                try {
                  localStorage.setItem('termsReminderSeenAt', String(Date.now()));
                } catch {}
              }}
              showCloseIcon={false}
              showCancelButton={false}
            />
          )}

          {showTosContent && (
            <TermsContentModal
              language={language}
              onClose={() => setShowTosContent(false)}
              onReadComplete={() => setTosRead(true)}
            />
          )}
          {showPrivacyContent && (
            <PrivacyContentModal
              language={language}
              onClose={() => setShowPrivacyContent(false)}
              onReadComplete={() => setPrivacyRead(true)}
            />
          )}

          {/* Receipt Modal for PayMongo Payments */}
          {showReceiptModal && receiptData && (
            <ReceiptModal
              payment={receiptData}
              showPrint={false}
              onClose={() => setShowReceiptModal(false)}
            />
          )}
        </div>
      )}
    </BorrowerClient>
  );
}
