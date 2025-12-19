'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

interface LoanDetails {
  loanId: string;
  name: string;
  interestRate: number;
  dateDisbursed: string;
  principal: number;
  startDate: string;
  endDate: string;
  monthlyDue: number;
  totalPayable: number;
  termsInMonths: string;
  numberOfPeriods: number;
  status: string;
  balance: number;
  paidAmount: number;
  creditScore: number;
  paymentHistory: Payment[];
  paymentProgress: number;
  releasedAmount: number;
}

interface Payment {
  loanId: string;
  referenceNumber: string;
  borrowersId: string;
  collector: string;
  amount: number;
  datePaid: string;
}

export function useBorrowerDashboard() {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');
  const [allLoans, setAllLoans] = useState<LoanDetails[]>([]);
  const [currentLoanIndex, setCurrentLoanIndex] = useState(0);
  const [loanInfo, setLoanInfo] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Initialize authentication and fetch loan data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/');

    try {
      const decoded: any = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        localStorage.clear();
        return router.push('/');
      }

      const mustChange = localStorage.getItem('forcePasswordChange');
      if (mustChange === 'true') setShowChangePasswordModal(true);

      const borrowersId = localStorage.getItem('borrowersId');
      if (!borrowersId) return router.push('/');

      fetch(`${BASE_URL}/loans/borrower-loans/${borrowersId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch loans');
          return res.json();
        })
        .then(data => {
          console.log('Fetched All Loans Data:', data); 
        
          // allLoans is the array from backend
          setAllLoans(data.allLoans || []);
        
          // Prefer explicit currentLoan from backend
          if (data.currentLoan) {
            setLoanInfo(data.currentLoan);
          } else if (data.allLoans && data.allLoans.length > 0) {
            setLoanInfo(data.allLoans[0]);
          }
        })        
        .catch(err => {
          console.error('Loan fetch error:', err);
          router.push('/');
        })
        .finally(() => setLoading(false));
    } catch (error) {
      localStorage.clear();
      router.push('/');
    }
  }, [router]);

  // Update current loan when index changes
  useEffect(() => {
    if (allLoans.length > 0) {
      setLoanInfo(allLoans[currentLoanIndex]);
    }
  }, [currentLoanIndex, allLoans]);

  // Fetch all payments data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`${BASE_URL}/payments`);
        const data = await response.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
        setPayments([]);
      }
    };

    fetchPayments();
  }, []);

  // Handle user logout
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  // Navigate to previous loan
  const handlePreviousLoan = () => {
    if (currentLoanIndex > 0) {
      setCurrentLoanIndex(currentLoanIndex - 1);
    }
  };

  // Navigate to next loan
  const handleNextLoan = () => {
    if (currentLoanIndex < allLoans.length - 1) {
      setCurrentLoanIndex(currentLoanIndex + 1);
    }
  };

  // Handle reloan application process
  const handleReloan = async () => {
    if (!loanInfo) return;

    const token = localStorage.getItem('token');
    const borrowersId = localStorage.getItem('borrowersId');

    try {
      const [borrowerResponse, applicationsResponse] = await Promise.all([
        fetch(`${BASE_URL}/borrowers/${borrowersId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/loan-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!borrowerResponse.ok || !applicationsResponse.ok) throw new Error('Fetch failed');

      const borrowerData = await borrowerResponse.json();
      const allApplications = await applicationsResponse.json();
      const previousApplications = allApplications
        .filter((app: any) => app.borrowersId === borrowersId && app.status === 'Accepted')
        .sort((a: any, b: any) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());

      const previousApplication = previousApplications[0];

      const reloanInfo = {
        isReloan: true,
        personalInfo: {
          ...borrowerData,
          ...(previousApplication && {
            appName: previousApplication.appName,
            appDob: previousApplication.appDob,
            appContact: previousApplication.appContact,
            appEmail: previousApplication.appEmail,
            appMarital: previousApplication.appMarital,
            appChildren: previousApplication.appChildren,
            appSpouseName: previousApplication.appSpouseName,
            appSpouseOccupation: previousApplication.appSpouseOccupation,
            appAddress: previousApplication.appAddress,
            sourceOfIncome: previousApplication.sourceOfIncome,
            appTypeBusiness: previousApplication.appTypeBusiness,
            appDateStarted: previousApplication.appDateStarted,
            appBusinessLoc: previousApplication.appBusinessLoc,
            appOccupation: previousApplication.appOccupation,
            appEmploymentStatus: previousApplication.appEmploymentStatus,
            appCompanyName: previousApplication.appCompanyName,
            appMonthlyIncome: previousApplication.appMonthlyIncome,
          }),
        },
        loanDetails: {
          amount: loanInfo.principal,
          term: parseInt(loanInfo.termsInMonths),
        },
        ...(previousApplication && {
          characterReferences: previousApplication.appReferences || [],
        }),
      };

      localStorage.setItem('reloanInfo', JSON.stringify(reloanInfo));
      router.push(`/components/borrower/ApplicationPage/${borrowersId}`);
    } catch (error) {
      console.error('Failed to fetch data for reloan:', error);
    }
  };

  // Calculate payment progress percentage
  const calculatePaymentProgress = () => {
    if (!loanInfo) return 0;
    const totalLoan = loanInfo.totalPayable;
    const remaining = loanInfo.balance;
    const paid = totalLoan - remaining;
    return Math.round((paid / totalLoan) * 100);
  };

  // Format amount as Philippine Peso currency
  const formatCurrency = (amount: number) =>
    Number(amount).toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    });

  // Format date string for display
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return {
    language,
    setLanguage,
    loanInfo,
    allLoans,
    loading,
    showChangePasswordModal,
    payments,
    showReceipt,
    selectedReceipt,
    setShowReceipt,
    setSelectedReceipt,
    currentLoanIndex,
    handleNextLoan,
    handlePreviousLoan,
    handleLogout,
    handleReloan,
    calculatePaymentProgress,
    formatCurrency,
    formatDate,
  };
}
