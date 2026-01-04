import { useRouter } from 'next/navigation';

interface WithdrawnApplicationProps {
  latestApplication: any;
}

const WithdrawnApplication = ({ latestApplication }: WithdrawnApplicationProps) => {
  const router = useRouter();

  return (
    <div className="relative bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 border-2 border-red-300 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-100/40 rounded-full blur-2xl" />
      
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Withdrawal Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6 animate-in bounce duration-500">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Withdrawal Message */}
        <h2 className="text-2xl font-bold text-red-900 mb-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          Application Withdrawn
        </h2>
        
        <p className="text-red-700 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
          You have withdrawn your loan application. You can apply again whenever you're ready.
        </p>

        {/* Denial Reason if available */}
        {latestApplication?.withdrawalReason && (
          <div className="bg-white rounded-xl p-6 mb-6 border-2 border-red-300 shadow-md animate-in fade-in duration-500 delay-200">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Your Reason:</p>
            <p className="text-sm text-gray-700 italic">{latestApplication.withdrawalReason}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 justify-center">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/userPage/borrowerPage/applyLoan')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Apply Again
            </button>
            <button
              onClick={() => router.push('/userPage/borrowerPage/application-details?id=' + latestApplication.applicationId)}
              className="px-6 py-3 bg-white border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawnApplication;
