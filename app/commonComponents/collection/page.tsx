'use client';

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiDollarSign, FiCheckCircle } from "react-icons/fi";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/app/commonComponents/utils/loading";
import { useCollectionPage } from "./hooks";

import PenaltyEndorseModal from "../modals/endorsementPenaltyModal";
import PaymentModal from "./modals/paymentModal";
import NoteModal from "./modals/noteModal";
import ErrorModal from "@/app/commonComponents/modals/errorModal";
import ReceiptModal from "@/app/commonComponents/modals/receiptModal";
import SuccessModal from "@/app/commonComponents/modals/successModal";

import { formatCurrency } from "../utils/formatters";
import { Collection } from "../utils/Types/collection";
import Filter from "../utils/sortAndSearch";
import {
  handleSaveNote,
  handlePrint,
  handleMakePayment,
  handleAddNote,
  handleNoteModalClose,
  handleConfirmPayment,
  handlePaymentModalClose
} from "./functions";

export default function CollectionsPage() {
  const {
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    selectedDate, setSelectedDate,
    collections, setCollections,
    filteredCollections,
    paymentAmount, setPaymentAmount,
    showPaymentConfirm, setShowPaymentConfirm,
    showModal, setShowModal,
    showNoteModal, setShowNoteModal,
    noteText, setNoteText,
    role, t, s, b, isMobile,
    printMode, setPrintMode,
    showErrorModal, setShowErrorModal,
    errorMsg, setErrorMsg,
    isPaymentModalVisible, setIsPaymentModalVisible, isPaymentModalAnimating, setIsPaymentModalAnimating,
    isNoteModalVisible, setIsNoteModalVisible, isNoteModalAnimating, setIsNoteModalAnimating,
    tableRef, Wrapper,
    totalCollected, totalTarget, targetAchieved,
    totalPayments, completedPayments, collectionRate,
    overallTotalCollected, overallTotalTarget, overallTargetAchieved,
    overallTotalPayments, overallCompletedPayments, overallCollectionRate,
    showReceiptModal, setShowReceiptModal,
    receiptData, setReceiptData,
    showUrgentOnly, setShowUrgentOnly,
    urgentCollectionsCount
  } = useCollectionPage();

  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [noteLoading, setNoteLoading] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedPenaltyCollection, setSelectedPenaltyCollection] = useState<Collection | null>(null);
  
  // Track if user has ever clicked urgent button
  const [hasClickedUrgent, setHasClickedUrgent] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasClickedUrgentCollections') === 'true';
    }
    return false;
  });

  // Handle urgent button click
  const handleUrgentClick = () => {
    setShowUrgentOnly(!showUrgentOnly);
    if (!hasClickedUrgent) {
      setHasClickedUrgent(true);
      localStorage.setItem('hasClickedUrgentCollections', 'true');
    }
  };
  
  return (
    <Wrapper>
      <div className="min-h-screen bg-gray-50">
        <div className={isMobile ? "mx-auto px-2 py-4" : "mx-auto px-6 py-8"}>

          {/* Calendar & Stats Section */}
          <div className={isMobile ? "flex flex-col gap-4 mb-4" : "grid grid-cols-12 gap-6 mb-6"}>

            {/* Calendar */}
            <div className={isMobile ? "bg-white rounded-xl p-4 shadow-sm" : "col-span-4 bg-white rounded-xl p-6 shadow-sm"}>
              <div className="flex items-center gap-2 mb-4">
                <FiCalendar className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-800">{t.Collection}</h2>
              </div>
              <div className="flex flex-col items-center gap-4">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => date && setSelectedDate(date)}
                  onMonthChange={(date: Date) => {
                    // When month changes, update to the same day of the new month
                    const currentDay = selectedDate.getDate();
                    const newDate = new Date(date);
                    newDate.setDate(Math.min(currentDay, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
                    setSelectedDate(newDate);
                  }}
                  inline
                  dayClassName={(date) => {
                    const hasCollection = collections.some(col => {
                      const colDate = new Date(col.dueDate || new Date());
                      return colDate.toDateString() === date.toDateString();
                    });
                    return hasCollection ? 'relative has-collection bg-blue-100 text-blue-800 font-semibold rounded-full' : '';
                  }}
                  calendarClassName="rounded-lg border border-gray-200 shadow-sm"
                  wrapperClassName="w-full"
                />
                <div className="text-blue-600 font-medium">{selectedDate.toDateString()}</div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className={isMobile ? "flex flex-col gap-4" : "col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6"}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg flex items-center justify-between hover:shadow-xl transition">
                <div>
                  <p className="text-gray-600 text-base font-semibold mb-1">{s.h5}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-4xl sm:text-5xl font-bold text-gray-800">{collectionRate}%</h3>
                  <p className="text-sm text-gray-400 mt-1">{completedPayments} of {totalPayments} payments</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg flex items-center justify-between hover:shadow-xl transition">
                <div>
                  <p className="text-gray-600 text-base font-semibold mb-1">{s.h6}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">{formatCurrency(totalCollected)}</h3>
                  <p className="text-sm text-gray-400 mt-1">of {formatCurrency(totalTarget)} ({targetAchieved}%)</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg flex items-center justify-between hover:shadow-xl transition">
                <div>
                  <p className="text-gray-600 text-base font-semibold mb-1">{s.h7}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-4xl sm:text-5xl font-bold text-gray-800">{overallCollectionRate}%</h3>
                  <p className="text-sm text-gray-400 mt-1">{overallCompletedPayments} of {overallTotalPayments} payments</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg flex items-center justify-between hover:shadow-xl transition">
                <div>
                  <p className="text-gray-600 text-base font-semibold mb-1">{s.h8}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">{formatCurrency(overallTotalCollected)}</h3>
                </div>
              </div>
            </div>
          </div>

          <Filter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOptions={[
              { value: "amount", label: t.l9 },
              { value: "balance", label: t.l14 },
              { value: "status", label: t.l15 },
            ]}
            t={t}
            isMobile={isMobile}
          />

          <div className={isMobile ? "flex justify-end gap-2 mb-2" : "flex justify-end gap-3 mb-4"}>
            {/* Urgent Collections Filter Button (only for collectors) */}
            {role === "collector" && urgentCollectionsCount > 0 && (
              <div className="relative group">
                {/* Animated Tooltip - always displayed */}
                <div className="absolute -top-11 left-1/2 transform -translate-x-1/2 pointer-events-none z-10">
                  <div className="relative animate-bounce">
                    <div className="bg-gray-100 border border-gray-300 text-gray-800 text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                      Please work on this immediately
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-100"></div>
                    </div>
                  </div>
                </div>
                
                {/* Filter Button */}
                <button
                  onClick={handleUrgentClick}
                  className={`relative px-4 py-2 rounded transition text-sm sm:text-base font-medium ${
                    showUrgentOnly 
                      ? "bg-gray-700 text-white hover:bg-gray-800" 
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  }`}
                >
                  <span>Urgent Collections</span>
                  {/* Badge showing count */}
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                    {urgentCollectionsCount}
                  </span>
                </button>
              </div>
            )}
            
            <button
              onClick={() => handlePrint(setPrintMode)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm sm:text-base"
            >
              {b.b11}
            </button>
          </div>

          {/* Collections Table */}
          <div ref={tableRef} className={isMobile ? "bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto" : "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"}>
            <table className="min-w-[700px] w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l43}</th>
                  <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l11}</th>
                  <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l12}</th>
                  <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l14}</th>
                  <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l9}</th>
                  <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l42}</th>
                  <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l41}</th>
                  {role !== "collector" && <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l21}</th>}
                  <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l15}</th>
                  <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{t.l44}</th>
                  {role === "collector" && <th className="px-6 py-3.5 text-left text-sm font-medium text-gray-600 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={role === "collector" ? 11 : 10}><LoadingSpinner /></td></tr>
                ) : filteredCollections.length === 0 ? (
                  <tr><td colSpan={role === "collector" ? 11 : 10} className="text-center py-6 text-gray-500">No collections found.</td></tr>
                ) : filteredCollections.map((col: Collection) => (
                  <tr key={col.referenceNumber} className="hover:bg-blue-50/60">
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{col.referenceNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{col.loanId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{col.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(col.loanBalance)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(col.periodAmount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(col.paidAmount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(col.periodBalance)}</td>
                    {role !== "collector" && <td className="px-6 py-3.5 text-left text-sm font-medium text-gray-600">{col.collector}</td>}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        col.status === "Paid" ? "bg-green-100 text-green-800" :
                        col.status === "Partial" ? "bg-yellow-100 text-yellow-800" :
                        col.status === "Overdue" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-600"
                      }`}>{col.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{col.note}</td>

                    {/* NEW ACTIONS DROPDOWN */}
                    {role === "collector" && (
                      <td className="px-6 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-full hover:bg-gray-100 transition">
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {col.periodBalance > 0 && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMakePayment(
                                    col,
                                    setSelectedCollection,
                                    setPaymentAmount,
                                    setShowModal
                                  )
                                }
                              >
                                Make Payment
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() =>
                                handleAddNote(
                                  col,
                                  setSelectedCollection,
                                  setNoteText,
                                  setShowNoteModal
                                )
                              }
                            >
                              {col.note?.trim() ? "Edit Note" : "Add Note"}
                            </DropdownMenuItem>

                            {(col.status === "Past Due" || col.status === "Overdue") && !col.pendingPenalty && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPenaltyCollection(col);
                                  setShowPenaltyModal(true);
                                }}
                              >
                                Endorse Penalty
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modals */}
          <PaymentModal
            isOpen={isPaymentModalVisible}
            isAnimating={isPaymentModalAnimating}
            selectedCollection={selectedCollection ?? undefined}
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            showPaymentConfirm={showPaymentConfirm}
            setShowPaymentConfirm={setShowPaymentConfirm}
            paymentLoading={paymentLoading}
            handleClose={() => handlePaymentModalClose(
              setIsPaymentModalAnimating,
              setShowModal,
              setIsPaymentModalVisible,
              setSelectedCollection,
              setPaymentAmount
            )}
            handleConfirmPayment={() => handleConfirmPayment(
              selectedCollection,
              paymentAmount,
              setCollections,
              setPaymentLoading,
              setShowPaymentConfirm,
              setErrorMsg,
              setShowErrorModal,
              () => handlePaymentModalClose(
                setIsPaymentModalAnimating,
                setShowModal,
                setIsPaymentModalVisible,
                setSelectedCollection,
                setPaymentAmount
              ),
              setShowReceiptModal,
              setReceiptData
            )}
          />

          <NoteModal
            isOpen={isNoteModalVisible}
            isAnimating={isNoteModalAnimating}
            selectedCollection={selectedCollection ?? undefined}
            noteText={noteText}
            setNoteText={setNoteText}
            handleClose={() => handlePaymentModalClose(
              setIsPaymentModalAnimating,
              setShowModal,
              setIsPaymentModalVisible,
              setSelectedCollection,
              setPaymentAmount
            )}
            handleSaveNote={() => handleSaveNote(
              selectedCollection,
              noteText,
              setCollections,
              setErrorMsg,
              setShowErrorModal,
              setNoteLoading,
              setSuccessMessage,
              setShowSuccessModal,
              () => handleNoteModalClose(
                setIsNoteModalAnimating,
                setShowNoteModal,
                setIsNoteModalVisible,
                setSelectedCollection,
                setNoteText
              )
            )}
            noteLoading={noteLoading}
          />

          <PenaltyEndorseModal
            isOpen={showPenaltyModal}
            onClose={() => setShowPenaltyModal(false)}
            collection={selectedPenaltyCollection}
            onSubmit={async (formData) => {
              try {
                await fetch(`/api/collections/${formData.get('referenceNumber')}/endorse-penalty`, {
                  method: "PUT",
                  body: formData,
                });
                setShowPenaltyModal(false);
              } catch (err) {
                alert("Failed to endorse penalty");
              }
            }}
          />

          {showErrorModal && <ErrorModal isOpen={showErrorModal} message={errorMsg} onClose={() => setShowErrorModal(false)} />}
          
          {/* Receipt Modal */}
          {showReceiptModal && receiptData && (
            <ReceiptModal
              payment={receiptData}
              borrowerName={receiptData.borrowerName}
              showPrint={true}
              onClose={() => {
                setShowReceiptModal(false);
                setReceiptData(null);
              }}
            />
          )}

          <SuccessModal
            isOpen={showSuccessModal}
            message={successMessage}
            onClose={() => setShowSuccessModal(false)}
          />
        </div>
      </div>
    </Wrapper>
  );
}
