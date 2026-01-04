import { useRouter } from 'next/navigation';

interface PendingPrincipalChangeBannerProps {
  latestApplication: any;
}

const PendingPrincipalChangeBanner = ({ latestApplication }: PendingPrincipalChangeBannerProps) => {
  const router = useRouter();
  const { formatCurrency } = require('@/app/commonComponents/utils/formatters');

  if (!latestApplication?.pendingPrincipalChange) return null;

  return (
    <div className="relative bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-600 rounded-full flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-amber-900 mb-1">Principal Change Pending</h3>
          <p className="text-amber-800 text-sm mb-3">
            Requested change from <span className="font-semibold">{formatCurrency(latestApplication.appLoanAmount ?? 0)}</span> to <span className="font-semibold">{formatCurrency(latestApplication.requestedPrincipal ?? 0)}</span>
          </p>
          <button
            onClick={() => router.push(`/userPage/borrowerPage/application-details?id=${latestApplication.applicationId}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-xs rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Review Request
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingPrincipalChangeBanner;
