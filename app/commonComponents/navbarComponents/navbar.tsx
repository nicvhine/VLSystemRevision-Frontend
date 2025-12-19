'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import useProfilePic from './profilePic';
import useAccountSettings from './accountSettings';
import MobileMenu from './mobileMenu';
import ProfileDropdown from './dropdown';
import {
  getManagerNavItems,
  getLoanOfficerNavItems,
  getHeadNavItems,
  getBorrowerNavItems,
  getSysadNavItems,
  getCollectorNavItems
} from './navItems';
import { NavbarProps } from '../utils/Types/navbar';
import { pickNotifDate, formatRelative, formatFull} from '../utils/notification';

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

  export default function Navbar({ role, isBlurred = false }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Single language state synced with localStorage
    const [language, setLanguage] = useState<'en' | 'ceb'>(() => {
      if (typeof window !== 'undefined') {
        if (!localStorage.getItem('language')) {
          localStorage.setItem('language', 'en');
        }
        return (localStorage.getItem('language') as 'en' | 'ceb') || 'en';
      }
      return 'en';
    });

  const [navItems, setNavItems] = useState(() => {
    switch (role) {
      case 'manager':
        return getManagerNavItems(language);
      case 'head':
        return getHeadNavItems(language);
      case 'loanOfficer':
        return getLoanOfficerNavItems(language);
      case 'borrower':
        return getBorrowerNavItems(language);
      case 'sysad':
        return getSysadNavItems(language);
      case 'collector':
        return getCollectorNavItems(language);
      default:
        return [];
    }
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [roleState, setRoleState] = useState('');

  const {
    profilePic,
    setProfilePic,
    previewPic,
    setOriginalPic,
  } = useProfilePic();

  const { setNotificationPreferences } = useAccountSettings();

  // Helper function to ensure valid image URL
  const getValidImageUrl = (url: string | null | undefined): string => {
    if (!url || url === 'null' || url === 'undefined' || url === '') {
      return '/idPic.jpg';
    }
    // If it's a blob URL (preview), return as-is
    if (url.startsWith('blob:')) {
      return url;
    }
    // If it's already a valid absolute URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it starts with a slash, it's a valid relative path
    if (url.startsWith('/')) {
      return url;
    }
    // Otherwise, prepend a slash to make it a valid relative path
    return `/${url}`;
  };

  // Load user data, role, notifications
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setName(localStorage.getItem('fullName') || '');
    setEmail(localStorage.getItem('email') || '');
    setPhoneNumber(localStorage.getItem('phoneNumber') || '');
    setUsername(localStorage.getItem('username') || '');
    setRoleState(localStorage.getItem('role') || '');

    const storedPic = localStorage.getItem('profilePic');
    if (storedPic && storedPic !== 'null' && storedPic !== 'undefined' && storedPic !== '[object Object]') {
      setProfilePic(storedPic);
      setOriginalPic(storedPic);
    } else {
      setProfilePic('');
      setOriginalPic('');
    }

    const storedNotifications = localStorage.getItem('notificationPreferences');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      setNotificationPreferences({
        sms: parsed.sms || false,
        email: parsed.email ?? true,
      });
    }

    const token = localStorage.getItem('token');
    if (token && role) {
      const apiRole = role === 'loanOfficer' ? 'loan-officer' : role;
      const borrowersId = localStorage.getItem('borrowersId');
      const url = apiRole === 'borrower' && borrowersId
        ? `${BASE_URL}/notifications/${borrowersId}`
        : `${BASE_URL}/notifications/staff/${apiRole}`;
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const notificationsArray = data.notifications || [];
          // Get locally cached read notifications
          const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
          
          // Clean up cache: remove IDs that are already marked as read in the server response
          const stillPending: string[] = [];
          readNotifs.forEach((cachedId: string) => {
            const serverNotif = notificationsArray.find((n: any) => (n._id || n.id) === cachedId);
            // Keep in cache only if server hasn't marked it as read yet
            if (serverNotif && !serverNotif.read && !serverNotif.viewed) {
              stillPending.push(cachedId);
            }
          });
          
          // Update cache with only pending IDs
          if (stillPending.length > 0) {
            localStorage.setItem('readNotifications', JSON.stringify(stillPending));
          } else {
            localStorage.removeItem('readNotifications');
          }
          
          const normalized = notificationsArray.map((n: any) => {
            const notifId = n._id || n.id;
            // If this notification is in our local cache, mark it as read
            const isReadLocally = stillPending.includes(notifId);
            return {
              ...n,
              read: isReadLocally || n.read || n.viewed || false,
            };
          });
          setNotifications(normalized);        
        })
        .catch(console.error);
    }
  }, [role]);

  // Sync language with localStorage and nav items
  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('language', language);

    switch (role) {
      case 'manager':
        setNavItems(getManagerNavItems(language));
        break;
      case 'head':
        setNavItems(getHeadNavItems(language));
        break;
      case 'loanOfficer':
        setNavItems(getLoanOfficerNavItems(language));
        break;
      case 'borrower':
        setNavItems(getBorrowerNavItems(language));
        break;
      case 'sysad':
        setNavItems(getSysadNavItems(language));
        break;
      case 'collector':
        setNavItems(getCollectorNavItems(language));
        break;
      default:
        setNavItems([]);
    }

    window.dispatchEvent(
      new CustomEvent('languageChange', { detail: { language, userType: role } })
    );
  }, [language, role]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleMobileProfileSettings = () => {
    setIsDropdownOpen(true);
    setIsEditingProfile(true);
    setIsMobileMenuOpen(false);
  };

  const handleMobileLogout = () => {
    setIsMobileMenuOpen(false);
    handleLogout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((p) => !p);
    setShowNotifs(false);
    setIsDropdownOpen(false);
  };
  
  const handleToggleNotifs = () => {
    setShowNotifs((prev) => !prev);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };
  
  const handleToggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setShowNotifs(false);
    setIsMobileMenuOpen(false);
  };

  // Listen for profile pic updates dispatched by upload/remove hooks
  useEffect(() => {
    const onProfileUpdate = (e: Event) => {
      try {
        const ev = e as CustomEvent;
        const pic = ev.detail?.profilePic;
        if (pic && pic !== 'null' && pic !== 'undefined' && pic !== '[object Object]' && typeof pic === 'string') {
          setProfilePic(pic);
          setOriginalPic(pic);
        } else {
          // removed or invalid -> show initial
          setProfilePic('');
          setOriginalPic('');
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('profilePicUpdated', onProfileUpdate as EventListener);
    return () => window.removeEventListener('profilePicUpdated', onProfileUpdate as EventListener);
  }, []);

  // Final avatar (preview or saved) — empty string means no image
  const finalAvatar = (previewPic || profilePic) || '';
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  useEffect(() => {
    setAvatarLoaded(false);
    if (!finalAvatar) setAvatarLoaded(true); // initials show immediately
  }, [finalAvatar]);


  return (
    <div
      className={`w-full bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm ${
        isBlurred ? 'relative z-40 blur-sm' : 'sticky top-0 z-50'
      } transition-all duration-150`}
    >
      <div className="w-full px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo / Home Link */}
          <Link
            href={
              role === 'manager'
                ? '/userPage/managerPage/dashboard'
                : role === 'loanOfficer'
                ? '/userPage/loanOfficerPage/dashboard'
                : role === 'borrower'
                ? '/userPage/borrowerPage/dashboard'
                : role === 'sysad'
                ? '/userPage/sysadPage/dashboard'
                : role === 'collector'
                ? '/commonComponents/collection'
                : role === 'head'
                ? '/userPage/headPage/dashboard'
                : '/'
            }
            className="flex items-center space-x-2"
          >
            <Image
              src="/logo/VistulaLogo.png"
              alt="Vistula Logo"
              width={30}
              height={20}
              priority
              className="object-contain"
            />
            <span className="text-sm font-semibold text-gray-700 tracking-tight">
              VLSystem
            </span>
          </Link>


          {/* Mobile Icons and Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notifications */}
            {role !== 'sysad' && (
              <button
                className="relative p-2 rounded-full hover:bg-gray-100"
                onClick={handleToggleNotifs}
              >
                <Bell className="h-5 w-5 text-gray-700" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Profile Icon */}
            <div
              className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-red-900 ring-offset-2 cursor-pointer hover:ring-4 transition-all"
              onClick={handleToggleDropdown}
            >
              {previewPic || profilePic ? (
                <Image
                  src={getValidImageUrl(previewPic || profilePic)}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <span className="text-gray-700 font-semibold text-sm">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-600"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Notifications Dropdown */}
          {role !== 'sysad' && (
            <div
              className={`md:hidden bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-xl w-[calc(100%-2rem)] mx-4 mt-3 p-0 transition-all duration-300 ease-out transform
                ${showNotifs ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
              style={{ position: 'fixed', top: '4rem', left: 0, right: 0, zIndex: 9999, maxHeight: '70vh', overflowY: 'auto' }}
              aria-hidden={!showNotifs}
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50 sticky top-0">
                <h3 className="text-sm font-semibold text-gray-700">
                  {language === 'ceb' ? 'Mga Notipikasyon' : 'Notifications'}
                </h3>
                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const apiRole = role === 'loanOfficer' ? 'loan-officer' : role;
                        await fetch(`${BASE_URL}/notifications/${apiRole}/read-all`, {
                          method: 'PUT',
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                      } catch (err) {
                        console.error('Failed to mark all as read:', err);
                      }
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {language === 'ceb' ? 'Markahi tanan nga nabasa' : 'Mark all as read'}
                  </button>
                )}
              </div>

              <div className="max-h-[52vh] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => {
                    const displayName =
                      notif.actorName || notif.actor?.name || notif.userName || notif.sender || 'System';
                    const roleText = (notif.actorRole || notif.actor?.role || notif.role || '').toString();
                    const initial = (displayName || 'S').toString().trim().charAt(0).toUpperCase();
                    const dateValue = pickNotifDate(notif);
                    const rel = formatRelative(dateValue);
                    const full = formatFull(dateValue);
                    return (
                      <div
                        key={idx}
                        className={`px-4 py-2 border-b border-gray-100 last:border-none cursor-pointer transition-colors duration-150 ${
                          !notif.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          console.log('📌 Full notification object:', notif);
                          const notifId = notif._id || notif.id;
                          console.log('📌 Using notification ID:', notifId);
                          
                          if (!notifId) {
                            console.error('❌ No valid notification ID found!');
                            return;
                          }
                          
                          // Update local state immediately for instant feedback
                          setNotifications((prev) =>
                            prev.map((n) => ((n._id || n.id) === notifId ? { ...n, read: true } : n))
                          );

                          // Cache this notification as read in localStorage to prevent race conditions
                          const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
                          if (!readNotifs.includes(notifId)) {
                            readNotifs.push(notifId);
                            localStorage.setItem('readNotifications', JSON.stringify(readNotifs));
                          }

                          // Mark as read on server and wait for it to complete
                          const apiRole = role === 'loanOfficer' ? 'loan-officer' : role;
                          const markAsReadUrl = `${BASE_URL}/notifications/${apiRole}/${notifId}/read`;
                          console.log('📡 Calling API:', markAsReadUrl);
                          try {
                            const response = await fetch(markAsReadUrl, {
                              method: 'PUT',
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            
                            if (response.ok) {
                              await response.json();
                              // Longer delay to ensure DB write completes
                              await new Promise(resolve => setTimeout(resolve, 500));
                            } else {
                              console.error('Failed to mark notification as read:', response.status, await response.text());
                            }
                          } catch (markError) {
                            console.error('Error marking notification as read:', markError);
                          }

                          // Navigate based on notification type
                          if (notif.applicationId) {
                            router.push(`/commonComponents/loanApplication/${notif.applicationId}`);
                          } else if (notif.type === 'penalty-endorsement' || notif.type === 'penalty-endorsement-approved' || notif.type === 'penalty-endorsement-rejected') {
                            router.push('/commonComponents/endorsement/penalty');
                          } else if (notif.type === 'closure-endorsement') {
                            // Managers go to endorsement page to approve/reject
                            router.push('/commonComponents/endorsement/closure');
                          } else if (notif.type === 'closure-approved' || notif.type === 'closure-rejected') {
                            // Loan officers get redirected to the specific loan page
                            if (notif.referenceNumber) {
                              router.push(`/commonComponents/loan/${notif.referenceNumber}`);
                            } else {
                              router.push('/commonComponents/endorsement/closure');
                            }
                          }
                        } catch (err) {
                          console.error('Failed to handle notification click:', err);
                        }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {(notif.actorProfilePic || notif.actorprofilepic || notif.actor?.profilePic || notif.avatar) ? (
                            <Image
                              src={(notif.actorProfilePic || notif.actorprofilepic || notif.actor?.profilePic || notif.avatar) as string}
                              alt="Avatar"
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold text-sm">
                              {initial}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900 leading-tight">{displayName}</p>
                                {roleText && <p className="text-[11px] text-gray-500 capitalize -mt-0.5">{roleText}</p>}
                              </div>
                            </div>
                            <p
                              className="text-[13px] text-gray-800 mt-0.5 leading-snug break-words"
                              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                              title={notif.message}
                            >
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500" title={full}>
                              <span>{full || '-'}</span>
                              {rel && (
                                <>
                                  <span className="text-[10px] text-gray-400">•</span>
                                  <span>{rel}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-5">
                    {language === 'ceb' ? 'Walay notipikasyon' : 'No notifications'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation */}
            <ul className="flex items-center space-x-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'text-white bg-red-600 hover:bg-red-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={language === 'ceb'}
                onChange={() => setLanguage(language === 'en' ? 'ceb' : 'en')}
              />
              <div className="relative w-12 h-6 bg-gray-200 rounded-full transition-colors duration-300">
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    language === 'ceb' ? 'translate-x-6' : ''
                  }`}
                />
              </div>
              <span className="text-gray-900 ml-3 text-sm font-medium">
                {language === 'en' ? 'English' : 'Cebuano'}
              </span>
            </label>

            {role !== 'sysad' && (
            <div className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-gray-100"
                onClick={handleToggleNotifs}
              >
                <Bell className="h-5 w-5 text-gray-700" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
              {/* Notifications dropdown styled like profile dropdown */}
              <div
                className={`bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-xl w-96 mt-3 p-0 mr-4 relative transition-all duration-300 ease-out transform
                  ${showNotifs ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                style={{ position: 'fixed', top: '4rem', right: 0, zIndex: 9999, maxHeight: '68vh', overflowY: 'auto' }}
                aria-hidden={!showNotifs}
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50 sticky top-0">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {language === 'ceb' ? 'Mga Notipikasyon' : 'Notifications'}
                  </h3>
                  {notifications.some((n) => !n.read) && (
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const apiRole = role === 'loanOfficer' ? 'loan-officer' : role;
                          await fetch(`${BASE_URL}/notifications/${apiRole}/read-all`, {
                            method: 'PUT',
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                        } catch (err) {
                          console.error('Failed to mark all as read:', err);
                        }
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {language === 'ceb' ? 'Markahi tanan nga nabasa' : 'Mark all as read'}
                    </button>
                  )}
                </div>

                <div className="max-h-[52vh] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif, idx) => {
                      const displayName =
                        notif.actorName || notif.actor?.name || notif.userName || notif.sender || 'System';
                      const roleText = (notif.actorRole || notif.actor?.role || notif.role || '').toString();
                      const initial = (displayName || 'S').toString().trim().charAt(0).toUpperCase();
                      const dateValue = pickNotifDate(notif);
                      const rel = formatRelative(dateValue);
                      const full = formatFull(dateValue);
                      return (
                        <div
                          key={idx}
                          className={`px-4 py-2 border-b border-gray-100 last:border-none cursor-pointer transition-colors duration-150 ${
                            !notif.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            console.log('Full notification object:', notif);
                            const notifId = notif._id || notif.id;
                            console.log('Using notification ID:', notifId);
                            
                            if (!notifId) {
                              console.error('No valid notification ID found!');
                              return;
                            }
                            
                            // Update local state immediately for instant feedback
                            setNotifications((prev) =>
                              prev.map((n) => ((n._id || n.id) === notifId ? { ...n, read: true } : n))
                            );

                            // Cache this notification as read in localStorage to prevent race conditions
                            const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
                            if (!readNotifs.includes(notifId)) {
                              readNotifs.push(notifId);
                              localStorage.setItem('readNotifications', JSON.stringify(readNotifs));
                            }

                            // Mark as read on server and wait for it to complete
                            const apiRole = role === 'loanOfficer' ? 'loan-officer' : role;
                            const markAsReadUrl = `${BASE_URL}/notifications/${apiRole}/${notifId}/read`;
                            console.log('Calling API:', markAsReadUrl);
                            try {
                              const response = await fetch(markAsReadUrl, {
                                method: 'PUT',
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              
                              if (response.ok) {
                                await response.json();
                                // Longer delay to ensure DB write completes
                                await new Promise(resolve => setTimeout(resolve, 500));
                              } else {
                                console.error('Failed to mark notification as read:', response.status, await response.text());
                              }
                            } catch (markError) {
                              console.error('Error marking notification as read:', markError);
                            }

                            // Navigate based on notification type
                            if (notif.applicationId) {
                              router.push(`/commonComponents/loanApplication/${notif.applicationId}`);
                            } else if (notif.type === 'penalty-endorsement' || notif.type === 'penalty-endorsement-approved' || notif.type === 'penalty-endorsement-rejected') {
                              router.push('/commonComponents/endorsement/penalty');
                            } else if (notif.type === 'closure-endorsement') {
                              // Managers go to endorsement page to approve/reject
                              router.push('/commonComponents/endorsement/closure');
                            } else if (notif.type === 'closure-approved' || notif.type === 'closure-rejected') {
                              // Loan officers get redirected to the specific loan page
                              if (notif.referenceNumber) {
                                router.push(`/commonComponents/loan/${notif.referenceNumber}`);
                              } else {
                                router.push('/commonComponents/endorsement/closure');
                              }
                            }
                          } catch (err) {
                            console.error('Failed to handle notification click:', err);
                          }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {(notif.actorProfilePic || notif.actorprofilepic || notif.actor?.profilePic || notif.avatar) ? (
                              <Image
                                src={(notif.actorProfilePic || notif.actorprofilepic || notif.actor?.profilePic || notif.avatar) as string}
                                alt="Avatar"
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold text-sm">
                                {initial}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 leading-tight">{displayName}</p>
                                  {roleText && <p className="text-[11px] text-gray-500 capitalize -mt-0.5">{roleText}</p>}
                                </div>
                              </div>
                              <p
                                className="text-[13px] text-gray-800 mt-0.5 leading-snug break-words"
                                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                title={notif.message}
                              >
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500" title={full}>
                                <span>{full || '-'}</span>
                                {rel && (
                                  <>
                                    <span className="text-[10px] text-gray-400">•</span>
                                    <span>{rel}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-5">
                      {language === 'ceb' ? 'Walay notipikasyon' : 'No notifications'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            )}

            <div className="relative">
              <div
                className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-red-900 ring-offset-2 cursor-pointer hover:ring-4 transition-all"
                onClick={handleToggleDropdown}
              >
                {previewPic || profilePic ? (
               <Image
               src={getValidImageUrl(previewPic || profilePic)}
               alt="Profile"
               width={40}
               height={40}
               className="object-cover w-full h-full rounded-full"
             />
             
              
                ) : (
                  <span className="text-gray-700 font-semibold text-sm">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <MobileMenu
            navItems={navItems}
            language={language}
            setLanguage={setLanguage}
            user={{
              name,
              email,
              role: roleState || role || '',
              profilePic: profilePic || '',
            }}
            onOpenProfileSettings={handleMobileProfileSettings}
            onLogout={handleMobileLogout}
          />
        )}
      </div>

      {/* Profile dropdown rendered outside desktop-only container for mobile support */}
      <ProfileDropdown
        name={name}
        email={email}
        phoneNumber={phoneNumber}
        username={username}
        role={roleState}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        profilePic={profilePic || ''}
        isEditing={isEditingProfile}
        setIsEditing={setIsEditingProfile}
        setShowOtpModal={setShowOtpModal}
      />
    </div>
  );
}