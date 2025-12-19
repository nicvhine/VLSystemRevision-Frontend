'use client';

import { Mail, Phone } from 'lucide-react';

type Props = {
  borrower: any;
  maskEmail: (email: string) => string;
  maskPhone: (phone: string) => string;
  handleSendOtp: (method: 'email' | 'mobile') => void;
};

export default function StepMethod({
  borrower,
  maskEmail,
  maskPhone,
  handleSendOtp,
}: Props) {
  return (
    <div className="text-center">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Choose where to receive your OTP
      </h2>
      <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
        To verify your identity, select a method below to receive your
        one-time password (OTP).
      </p>

      {/* Options */}
      <div className="max-w-md mx-auto space-y-4 text-left">
        {borrower.email && (
          <button
            onClick={() => handleSendOtp('email')}
            className="flex items-center w-full gap-3 px-4 py-3 border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition group"
          >
            <div className="p-2.5 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-medium text-gray-900">
                Send OTP via Email
              </span>
              <span className="text-gray-500 text-xs">
                {maskEmail(borrower.email)}
              </span>
            </div>
          </button>
        )}

        {borrower.phoneNumber && (
          <button
            onClick={() => handleSendOtp('mobile')}
            className="flex items-center w-full gap-3 px-4 py-3 border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md hover:border-green-500 transition group"
          >
            <div className="p-2.5 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 transition">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-medium text-gray-900">
                Send OTP via Mobile
              </span>
              <span className="text-gray-500 text-xs">
                {maskPhone(borrower.phoneNumber)}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
