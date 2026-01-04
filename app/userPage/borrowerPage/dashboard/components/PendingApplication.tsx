import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface PendingApplicationProps {
  latestApplication: any;
}

const PendingApplication = ({ latestApplication }: PendingApplicationProps) => {
  const router = useRouter();

  return (
    <div className="relative bg-gradient-to-br from-white to-red-50 rounded-2xl p-7 border border-red-200/50 shadow-lg">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-50/50 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Header with tracking label */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-red-600">TRACKING</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Application Status</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Reference</p>
            <p className="text-lg font-bold text-red-600 font-mono">{latestApplication.applicationId}</p>
          </div>
        </div>

        {/* Application Status Timeline */}
        <div className="mb-6">
          <div className="space-y-3">
            {/* Status Steps */}
            {['Applied', 'Pending', 'Cleared', 'Approved', 'Disbursed'].map((step, index) => {
              const statusLower = latestApplication.status?.toLowerCase() || '';
              const stepLower = step.toLowerCase();
              
              // Determine if step is completed, current, or pending
              const statusOrder = ['applied', 'pending', 'cleared', 'approved', 'disbursed'];
              const currentIndex = statusOrder.indexOf(statusLower);
              const stepIndex = statusOrder.indexOf(stepLower);
              
              const isCompleted = stepIndex < currentIndex;
              const isCurrent = stepIndex === currentIndex;
              const isPending = stepIndex > currentIndex;
              
              return (
                <div 
                  key={step} 
                  className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both" 
                  style={{animationDelay: `${index * 50}ms`}}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${ 
                    isCompleted ? 'bg-green-500 text-white' : 
                    isCurrent ? 'bg-red-600 text-white animate-pulse' : 
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? '✓' : (isCurrent ? '◉' : '○')}
                  </div>
                  <span className={`text-sm font-medium ${ 
                    isCompleted ? 'text-green-600' : 
                    isCurrent ? 'text-red-600' : 
                    'text-gray-400'
                  }`}>
                    {step}
                  </span>
                  {isCurrent && <span className="ml-auto text-xs font-semibold text-red-600">Currently here</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Info Message */}
        <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in pulse duration-500">
          <p className="text-xs text-blue-900">
            Your application is <span className="font-semibold">{latestApplication.status}</span>. We'll notify you of updates.
          </p>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => router.push(`/userPage/borrowerPage/application-details?id=${latestApplication.applicationId}`)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
        >
          View Full Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PendingApplication;
