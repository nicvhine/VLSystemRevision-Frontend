import { useRouter } from 'next/navigation';
import { Wallet, ArrowRight } from 'lucide-react';

const NoActiveLoan = () => {
  const router = useRouter();

  return (
    <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 rounded-2xl p-8 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-800/20 rounded-full blur-3xl animate-pulse" />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-4 animate-in bounce duration-500">
          <Wallet className="w-7 h-7 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          Ready to Get Started?
        </h2>
        
        <p className="text-red-100 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
          You don't have an active loan. Apply now and get access to flexible loan options tailored to your needs.
        </p>
        
        <button
          onClick={() => router.push('/userPage/borrowerPage/applyLoan')}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md border border-red-200 hover:shadow-lg hover:scale-105 active:scale-95 animate-in fade-in duration-500 delay-200"
        >
          Apply for a Loan
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default NoActiveLoan;
