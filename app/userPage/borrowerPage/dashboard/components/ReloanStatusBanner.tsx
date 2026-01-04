import { useRouter } from 'next/navigation';

interface ReloanStatusBannerProps {
  pendingReloanStatus: any;
}

const ReloanStatusBanner = ({ pendingReloanStatus }: ReloanStatusBannerProps) => {
  const router = useRouter();

  if (!pendingReloanStatus) return null;

  return (
    <div className={`rounded-2xl p-6 shadow-md border-2 animate-in fade-in slide-in-from-top-4 duration-500 ${
      pendingReloanStatus.status === 'Approved'
        ? 'bg-blue-50 border-blue-300'
        : 'bg-amber-50 border-amber-300'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full flex-shrink-0 ${
          pendingReloanStatus.status === 'Approved'
            ? 'bg-blue-600'
            : 'bg-amber-600'
        }`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className={`font-bold mb-1 ${
            pendingReloanStatus.status === 'Approved'
              ? 'text-blue-900'
              : 'text-amber-900'
          }`}>
            Reloan {pendingReloanStatus.status === 'Approved' ? 'Approved' : 'Application Pending'}
          </h3>
          <p className={`text-sm mb-3 ${
            pendingReloanStatus.status === 'Approved'
              ? 'text-blue-700'
              : 'text-amber-700'
          }`}>
            {pendingReloanStatus.status === 'Approved'
              ? `Your reloan application of ₱${Number(pendingReloanStatus.appLoanAmount || 0).toLocaleString()} has been approved. Our team will generate your new loan soon.`
              : `Your reloan application for ₱${Number(pendingReloanStatus.appLoanAmount || 0).toLocaleString()} is under review. You cannot apply for another reloan until this one is processed.`
            }
          </p>
          <button
            onClick={() => router.push(`/userPage/borrowerPage/application-details?id=${pendingReloanStatus.applicationId}`)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
              pendingReloanStatus.status === 'Approved'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReloanStatusBanner;
