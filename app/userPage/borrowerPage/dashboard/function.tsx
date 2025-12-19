'use client';
import { useRouter } from 'next/navigation';
import { Collection } from '@/app/commonComponents/utils/Types/collection';
import { Loan } from '@/app/commonComponents/utils/Types/loan';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export async function handlePay(
  collection: Collection,
  activeLoan: Loan | null,  
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>,
  setShowErrorModal: React.Dispatch<React.SetStateAction<boolean>>,
  customAmount?: number
) {
  if (!activeLoan) return;

  const amountToPay = Number(customAmount) || collection.periodAmount || 0;

  if (amountToPay <= 0) {
    setErrorMsg('Please enter a valid payment amount.');
    setShowErrorModal(true);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg('You must be logged in to make a payment.');
      setShowErrorModal(true);
      return;
    }

    const response = await fetch(`${BASE_URL}/payments/paymongo/gcash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify({
        amount: amountToPay,
        collectionNumber: collection.collectionNumber,
        referenceNumber: collection.referenceNumber,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setErrorMsg(`Payment failed: ${errorData.error || 'Unknown error'}`);
      setShowErrorModal(true);
      return;
    }

    const data = await response.json();

    if (data.checkout_url) {
      // Redirect to PayMongo checkout
      window.location.href = data.checkout_url;
    } else {
      setErrorMsg('Failed to create payment. Please try again.');
      setShowErrorModal(true);
    }
  } catch (err: any) {
    console.error("Payment error:", err);
    setErrorMsg('Error connecting to payment gateway.');
    setShowErrorModal(true);
  }
}

export function useReloan() {
  const router = useRouter();

  const handleReloan = (paymentProgress: number, borrowerId: string) => {
    if (paymentProgress >= 70) {
      router.push(`/userPage/borrowerPage/reapplyLoan/${borrowerId}`);
    } else {
      console.warn('Reloan not allowed: progress below 70%.');
    }
  };

  return { handleReloan };
}
