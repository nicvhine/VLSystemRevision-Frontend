import { FileText, CheckCircle, Wallet } from 'lucide-react';

const HowItWorks = () => {
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

  return (
    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <h2 className="text-xl font-bold text-gray-900 mb-6">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-red-100">
                  <Icon className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
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
  );
};

export default HowItWorks;
