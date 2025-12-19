'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChangePasswordModal from "@/app/commonComponents/modals/forceChange/modal";
import Navbar from "@/app/commonComponents/navbarComponents/navbar";
import useInactivityLogout from "@/app/commonComponents/modals/inactivity/logic";
import AreYouStillThereModal from "@/app/commonComponents/modals/inactivity/modal";

interface CollectorLayoutProps {
  children: React.ReactNode;
}

export default function CollectorLayout({ children }: CollectorLayoutProps) {
  // isNavbarBlurred removed from props
  const isNavbarBlurred = false;
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  const { showModal, stayLoggedIn, logout } = useInactivityLogout();

  // Check authentication & force password change
  useEffect(() => {
    const token = localStorage.getItem("token");
    const mustChange = localStorage.getItem("forcePasswordChange");

    if (!token) {
      router.push("/");
      return;
    }

    if (mustChange === "true") {
      setShowChangePasswordModal(true);
    }

    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-white animate-pulse"></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar role="collector" isBlurred={isNavbarBlurred} />

      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}

      {/* Main page content */}
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
