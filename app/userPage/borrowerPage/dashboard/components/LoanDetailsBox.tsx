import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/app/commonComponents/utils/formatters';

interface LoanDetailsBoxProps {
  loan: any;
  latestApplication: any;
}

const LoanDetailsBox = ({ loan, latestApplication }: LoanDetailsBoxProps) => {
  return (
    <div className="bg-red-600 rounded-2xl p-6 shadow-md border border-red-700 text-white animate-in fade-in slide-in-from-top-8 duration-500 delay-100">
      <h3 className="text-sm font-bold text-red-100 mb-4 uppercase tracking-widest">Loan Details</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
         <div className="bg-red-500/25 rounded-lg p-3.5 border border-red-400/30">
          <p className="text-xs text-red-100 mb-1.5 font-medium">Loan ID</p>
          <p className="font-semibold text-sm text-white">{loan?.loanId ?? latestApplication?.loanId ?? '—'}</p>
        </div>
        <div className="bg-red-500/25 rounded-lg p-3.5 border border-red-400/30">
          <p className="text-xs text-red-100 mb-1.5 font-medium">Loan Type</p>
          <p className="font-semibold text-sm text-white">{loan?.loanType ?? latestApplication?.loanType ?? '—'}</p>
        </div>
        <div className="bg-red-500/25 rounded-lg p-3.5 border border-red-400/30">
          <p className="text-xs text-red-100 mb-1.5 font-medium">Disbursed</p>
          <p className="font-semibold text-sm text-white">{loan?.dateApproved ? new Date(loan.dateApproved).toLocaleDateString() : (latestApplication?.dateApproved ? new Date(latestApplication.dateApproved).toLocaleDateString() : (latestApplication?.dateDisbursed ? new Date(latestApplication.dateDisbursed).toLocaleDateString() : '—'))}</p>
        </div>
        <div className="bg-red-500/25 rounded-lg p-3.5 border border-red-400/30">
          <p className="text-xs text-red-100 mb-1.5 font-medium">Principal</p>
          <p className="font-semibold text-sm text-white">{formatCurrency(loan?.appLoanAmount ?? latestApplication.appLoanAmount ?? '—')}</p>
        </div>
        <div className="bg-red-500/25 rounded-lg p-3.5 border border-red-400/30">
          <p className="text-xs text-red-100 mb-1.5 font-medium">Term</p>
          <p className="font-semibold text-sm text-white">{loan?.appLoanTerms ?? latestApplication.appLoanTerms ?? '—'} months</p>
        </div>
        <div className="bg-red-500/25 rounded-lg p-3.5 border border-red-400/30">
          <p className="text-xs text-red-100 mb-1.5 font-medium">Interest Rate</p>
          <p className="font-semibold text-sm text-white">{loan?.appInterestRate ?? latestApplication.appInterestRate ?? '—'}%</p>
        </div>
        <div className="bg-red-500/25 rounded-lg p-3.5 border border-red-400/30">
          <p className="text-xs text-red-100 mb-1.5 font-medium">Total Payable</p>
          <p className="font-semibold text-sm text-white">{formatCurrency(loan?.appTotalPayable ?? latestApplication.appTotalPayable ?? '—')}</p>
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsBox;
