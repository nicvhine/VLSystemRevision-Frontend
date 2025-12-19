'use client';

import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { Fragment } from 'react';
import { ReceiptModalProps } from '@/app/commonComponents/utils/Types/modal';


export default function ReceiptModal({ isOpen, onClose, payment }: ReceiptModalProps) {
  if (!payment) return null;

  // Format the payment date for display
  const formattedDate = format(new Date(payment.datePaid), 'MMMM dd, yyyy');

  return (
    <Dialog open={isOpen} onClose={onClose} as={Fragment}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 print:bg-white print:static print:overflow-visible">
        <Dialog.Panel
          className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg print:shadow-none print:rounded-none print:max-w-none"
          id="printable"
        >
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Vistula Lending Corporation</h2>
            <p className="text-xs text-gray-600">BG Business Center, Cantecson, Gairan</p>
            <p className="text-xs text-gray-600">Phone: (032) 123-4567 | Email: vistulaLending.ph</p>
            <div className="mt-2 border-t border-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-800">Official Payment Receipt</h3>
          </div>

          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Receipt No:</strong> {payment.referenceNumber}</p>
            <p><strong>Date Paid:</strong> {formattedDate}</p>
            <p><strong>Amount Paid:</strong> ₱{payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
            <p><strong>Loan ID:</strong> {payment.loanId}</p>
            <p><strong>Borrower ID:</strong> {payment.borrowersId}</p>
            <p><strong>Collected By:</strong> {payment.collector}</p>
          </div>

          <div className="mt-6 border-t border-gray-300 pt-4">
            <p className="text-xs text-gray-500 italic">
              This is a system-generated receipt. For questions, please contact Vistula Lending Corp.
            </p>
          </div>

          <div className="mt-6 flex justify-between print:hidden">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Print
            </button>
          </div>
        </Dialog.Panel>

        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable, #printable * {
              visibility: visible !important;
            }
            #printable {
              position: absolute !important;
              top: 0;
              left: 0;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </Dialog>
  );
}
