'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, Wallet, ArrowRight } from 'lucide-react';

// Mock components - replace with your actual imports
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
);

export default function BorrowerDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const steps = [
    {
      icon: FileText,
      title: 'Apply',
      description: 'Complete your loan application in minutes',
    },
    {
      icon: CheckCircle,
      title: 'Review',
      description: 'Fast approval process by our team',
    },
    {
      icon: Wallet,
      title: 'Get Funded',
      description: 'Visit our office to receive your funds',
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* How It Works Section */}
        <div className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-red-200 transition-shadow">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-400">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-gray-200 to-transparent" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* No Active Loan CTA */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl p-8 lg:p-12 shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            
            <p className="text-red-100 text-lg mb-8">
              You don't have an active loan. Apply now and get access to flexible loan options tailored to your needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/userPage/borrowerPage/applyLoan')}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-red-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Apply for a Loan
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => {/* Learn more action */}}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}