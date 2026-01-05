import { useRouter } from 'next/navigation';

interface DeniedApplicationProps {
  latestApplication: any;
  cooldownSeconds?: number;
}

const DeniedApplication = ({ latestApplication, cooldownSeconds }: DeniedApplicationProps) => {
  const router = useRouter();

  return (
    <div className="relative bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 border-2 border-red-300 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-100/40 rounded-full blur-2xl" />
      
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Denial Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6 animate-in bounce duration-500">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Denial Message */}
        <h2 className="text-2xl font-bold text-red-900 mb-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          Application Denied
        </h2>
        
        <p className="text-red-700 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
          Unfortunately, your application did not meet our approval criteria at this time.
        </p>

        {/* Pending Principal Change Notification */}
        {latestApplication?.pendingPrincipalChange && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">Principal Change Request Pending</p>
                <p className="text-xs text-amber-700">A loan officer requested to change your principal amount. Review and approve the request in application details.</p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 justify-center mt-6">
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

export default DeniedApplication;
