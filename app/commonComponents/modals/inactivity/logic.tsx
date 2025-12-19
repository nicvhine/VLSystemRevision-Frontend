'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useInactivityLogout(inactivityTimeout = 500000) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const clearInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  };

  const startInactivityTimer = () => {
    clearInactivityTimer();
    inactivityTimer.current = setTimeout(() => {
      setShowModal(true); // show modal after inactivity
    }, inactivityTimeout);
  };

  const stayLoggedIn = () => {
    setShowModal(false); // hide modal
    startInactivityTimer(); // restart inactivity timer
  };

  useEffect(() => {
    startInactivityTimer();

    const handleActivity = () => {
      startInactivityTimer(); // always reset timer on activity
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, handleActivity));

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearInactivityTimer();
    };
  }, []);

  return { showModal, stayLoggedIn, logout };
}
