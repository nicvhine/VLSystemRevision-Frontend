'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useInactivityLogout from "@/app/commonComponents/modals/inactivity/logic";
import ChangePasswordModal from "@/app/commonComponents/modals/forceChange/modal";
import AreYouStillThereModal from "@/app/commonComponents/modals/inactivity/modal";
import Navbar from '@/app/commonComponents/navbarComponents/navbar';

interface BorrowerClientProps {
  children?: ReactNode;
}

export default function BorrowerClient({ children }: BorrowerClientProps) {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  const { showModal, stayLoggedIn, logout } = useInactivityLogout();

  // Check authentication and password change requirements
  useEffect(() => {
    const token = localStorage.getItem('token');
    const mustChange = localStorage.getItem('forcePasswordChange');

    if (!token) {
      router.push('/');
      return;
    }

    if (mustChange === 'true') {
      setShowChangePasswordModal(true);
    }

    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar role="borrower" />

      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => {
            setShowChangePasswordModal(false);
            try {
              localStorage.removeItem('termsReminderSeenAt');
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('forcePasswordChangeCompleted'));
              }
            } catch {}
          }}
        />
      )}

      {children}

      {showModal && (
        <AreYouStillThereModal
          countdownSeconds={20}
          onStay={stayLoggedIn}
          onLogout={logout}
        />
      )}
    </div>
  );
}
