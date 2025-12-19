'use client';

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from 'next/navigation';
import Navbar from "@/app/commonComponents/navbarComponents/navbar";
import ChangePasswordModal from "@/app/commonComponents/modals/forceChange/modal";
import useInactivityLogout from '@/app/commonComponents/modals/inactivity/logic';
import AreYouStillThereModal from '@/app/commonComponents/modals/inactivity/modal';

interface SysadLayoutProps {
  children: ReactNode;
}

export default function SysadLayout({ children }: SysadLayoutProps) {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  const { showModal, stayLoggedIn, logout } = useInactivityLogout();

  // Check authentication and force password change
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
    <Navbar role="sysad"/>
    {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />}
    {children}
    {showModal && <AreYouStillThereModal countdownSeconds={20} onStay={stayLoggedIn} onLogout={logout} />}
  </div>
  );
}
