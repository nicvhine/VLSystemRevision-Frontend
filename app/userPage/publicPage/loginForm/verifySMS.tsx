'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifySMS() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = () => {
    const savedCode = sessionStorage.getItem('verificationCode');
    const role = sessionStorage.getItem('userRole');

    if (code === savedCode) {
      sessionStorage.removeItem('verificationCode');
      sessionStorage.removeItem('userRole');

      switch (role) {
        case 'borrower':
          router.push('/userPage/borrowerPage/dashboard');
          break;
        case 'head':
          router.push('/userPage/headPage/dashboard');
          break;
        case 'manager':
          router.push('/userPage/managerPage/dashboard');
          break;
        case 'loan officer':
          router.push('/userPage/loanOfficerPage/dashboard');
          break;
        case 'collector':
          router.push('/commonComponents/collection');
          break;
        default:
          router.push('/');
      }
    } else {
      setErrorMsg('Incorrect verification code.');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Enter SMS Code</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border px-4 py-2 rounded mb-4"
        placeholder="Enter 6-digit code"
      />
      <button
        onClick={handleVerify}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Verify
      </button>
      {showErrorModal && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
            {errorMsg}
            <button className="ml-4 text-white" onClick={() => setShowErrorModal(false)}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
