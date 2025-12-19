'use client';

type Props = {
  setPendingStep: (step: 'account' | 'staff') => void;
  setShowForgotModal: (show: boolean) => void;
};

export default function StepRole({ setPendingStep }: Props) {
  return (
    <div className="text-center">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Forgot Password
      </h2>
      <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
        Let’s help you get back into your account.
      </p>

      {/* Note box */}
      <div className="bg-red-50 border border-red-300 text-red-800 text-sm rounded-lg p-5 text-left max-w-md mx-auto shadow-sm mb-8">
        <p className="font-semibold text-red-700 mb-2 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Important Information
        </p>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            <span className="font-medium">Staff</span> accounts can’t reset their
            password directly. Please contact your administrator for help.
          </li>
          <li>
            If you’re a <span className="font-medium">Borrower</span>, click{" "}
            <span className="font-medium text-red-700">Next</span> to continue
            with the password recovery process.
          </li>
        </ul>
      </div>

      {/* Action button */}
      <div className="flex justify-end max-w-md mx-auto">
        <button
          onClick={() => setPendingStep('account')}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:scale-95 transition-transform duration-150 shadow-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
