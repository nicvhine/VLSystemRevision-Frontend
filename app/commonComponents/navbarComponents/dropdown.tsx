'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProfileDropdownLogic } from './dropdownLogic';
import { useState, useEffect, useRef } from 'react';
import translations from '../translation';
import { useProfilePicUpload } from './hooks/useProfilePicUpload';
import SuccessModal from '@/app/commonComponents/modals/successModal';
import ErrorModal from '@/app/commonComponents/modals/errorModal';
import ConfirmModal from '@/app/commonComponents/modals/confirmModal';
import SubmitOverlayToast from '@/app/commonComponents/utils/submitOverlayToast';
import TermsGateModal from '@/app/commonComponents/modals/termsPrivacy/TermsGateModal';
import PrivacyContentModal from '@/app/commonComponents/modals/termsPrivacy/PrivacyContentModal';
import TermsContentModal from '@/app/commonComponents/modals/termsPrivacy/TermsContentModal';

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

interface ProfileDropdownProps {
  name: string;
  email: string;
  phoneNumber: string;
  username: string;
  role: string;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setShowOtpModal: React.Dispatch<React.SetStateAction<boolean>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  profilePic: string;
}

export default function ProfileDropdown(props: ProfileDropdownProps) {
  const router = useRouter();
  const {
    name,
    email,
    phoneNumber,
    username,
    role,
    isEditing,
    setIsEditing,
    isDropdownOpen,
    setIsDropdownOpen,
  } = props;

  // Profile picture upload hook
  const { previewPic, isUploading, isWorking, validationError, clearValidationError, handleFileChange, handleCancelUpload, handleSaveProfilePic, handleRemoveProfilePic } =
    useProfilePicUpload({ currentProfilePic: props.profilePic, username });

  // Local modals for feedback
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Show validation errors from profile pic upload
  useEffect(() => {
    if (validationError) {
      setModalMsg(validationError);
      setShowErrorModal(true);
    }
  }, [validationError]);

  // Terms and Privacy modals
  const [showTermsGate, setShowTermsGate] = useState(false);
  const [showTosContent, setShowTosContent] = useState(false);
  const [showPrivacyContent, setShowPrivacyContent] = useState(false);

  // Dropdown logic hook
  const {
    handleLogout,
  } = useProfileDropdownLogic(setIsEditing, setShowOtpModal);

  // Initialize language from localStorage
  const [language, setLanguage] = useState<'en' | 'ceb'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as 'en' | 'ceb') || 'en';
    }
    return 'en';
  });

  // Listen for language changes dynamically
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      if (
        (role === 'head' && event.detail.userType === 'head') ||
        (role === 'loan officer' && event.detail.userType === 'loanOfficer') ||
        (role === 'manager' && event.detail.userType === 'manager') ||
        (role === 'borrower' && event.detail.userType === 'borrower') ||
        (role === 'sysad' && event.detail.userType === 'sysad')
      ) {
        setLanguage(event.detail.language);
      }
    };
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, [role]);

  const t = translations.navbarTranslation[language];
  const b = translations.buttonTranslation[language];

  // Local email state to reflect immediate changes without full refresh
  const [displayEmail, setDisplayEmail] = useState<string>(email);
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState<string>(phoneNumber);

  // Keep displayEmail in sync with prop updates
  useEffect(() => {
    setDisplayEmail(email);
  }, [email]);

  // Keep displayPhoneNumber in sync with prop updates
  useEffect(() => {
    setDisplayPhoneNumber(phoneNumber);
  }, [phoneNumber]);

  // Listen for emailUpdated events to update UI immediately
  useEffect(() => {
    const onEmailUpdated = (e: Event) => {
      try {
        const ce = e as CustomEvent;
        if (typeof ce.detail?.email === 'string') {
          setDisplayEmail(ce.detail.email);
        }
      } catch {}
    };
    window.addEventListener('emailUpdated', onEmailUpdated as EventListener);
    return () => window.removeEventListener('emailUpdated', onEmailUpdated as EventListener);
  }, []);

  // Listen for phoneNumberUpdated events to update UI immediately
  useEffect(() => {
    const onPhoneUpdated = (e: Event) => {
      try {
        const ce = e as CustomEvent;
        if (typeof ce.detail?.phoneNumber === 'string') {
          setDisplayPhoneNumber(ce.detail.phoneNumber);
        }
      } catch {}
    };
    window.addEventListener('phoneNumberUpdated', onPhoneUpdated as EventListener);
    return () => window.removeEventListener('phoneNumberUpdated', onPhoneUpdated as EventListener);
  }, []);

  // Determine final image to show
  const [externalProfilePic, setExternalProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const onProfileUpdate = (e: Event) => {
      try {
        const ev = e as CustomEvent;
        setExternalProfilePic(ev.detail?.profilePic || null);
      } catch (err) {
        setExternalProfilePic(null);
      }
    };
    window.addEventListener('profilePicUpdated', onProfileUpdate as EventListener);
    return () => window.removeEventListener('profilePicUpdated', onProfileUpdate as EventListener);
  }, []);

  const finalProfilePic = previewPic || externalProfilePic || props.profilePic || null;
  const hasImage = Boolean(finalProfilePic && finalProfilePic !== '/idPic.jpg');
  // Show actions row (EDIT | REMOVE or SAVE | CANCEL) only when avatar is clicked
  const [showPhotoActions, setShowPhotoActions] = useState(false);
  const avatarBlockRef = useRef<HTMLDivElement | null>(null);

  // Hide actions when clicking outside the avatar block
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (avatarBlockRef.current && !avatarBlockRef.current.contains(e.target as Node)) {
        setShowPhotoActions(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const closeDropdown = () => {
    setIsDropdownOpen(false);
    setIsEditing(false);
    setShowPhotoActions(false);
    // Cancel any pending upload when closing dropdown
    if (isUploading) {
      handleCancelUpload();
    }
  };

  return (
    <>
      {/* Mobile fullscreen backdrop */}
      {isDropdownOpen && (
        <div className="fixed inset-0 bg-black/50 z-[9998] sm:hidden" onClick={closeDropdown}></div>
      )}
      
      <div
        className={`bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-2xl w-96 p-0 transition-all duration-300 ease-out transform
          ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
        style={{ 
          position: 'fixed',
          top: '4rem',
          right: '1rem',
          left: 'auto',
          zIndex: 9999,
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
        aria-hidden={!isDropdownOpen}
      >
        {/* Profile Info */}
        <div className="flex flex-col items-center pt-7 pb-4 gap-1">
        <div className="relative group" ref={avatarBlockRef}>
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-red-900 hover:ring-4 transition-all flex items-center justify-center bg-gray-200 text-gray-700 font-bold text-2xl cursor-pointer"
            onClick={() => !isWorking && setShowPhotoActions((v) => !v)}
            title="Edit profile picture"
          >
            {hasImage ? (
              <Image
                src={getValidImageUrl(finalProfilePic)}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{name ? name.charAt(0).toUpperCase() : 'U'}</span>
            )}

            {/* Hover overlay (just shows EDIT word) */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="text-white text-xs tracking-wide">EDIT</span>
            </div>
          </div>

          {/* Row directly below avatar: toggled by click (no hover) */}
          <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 transition-all duration-200 ${showPhotoActions ? 'opacity-100 translate-y-0 flex' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <div className="flex items-center gap-3 text-sm bg-transparent">
                {!isUploading ? (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); if (!isWorking) document.getElementById('profileUpload')?.click(); }}
                  className={`text-sm font-medium ${isWorking ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:underline'}`}
                  disabled={isWorking}
                >
                  {t.t1?.toUpperCase() || 'CHANGE'}
                </button>
                <span className="text-gray-400">|</span>
                {(((previewPic && previewPic !== '/idPic.jpg') || (props.profilePic && props.profilePic !== '/idPic.jpg'))) ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (isWorking) return; setShowRemoveConfirm(true); }}
                    className={`text-sm font-medium ${isWorking ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:underline'}`}
                    disabled={isWorking}
                  >
                    {t.t22?.toUpperCase() || 'REMOVE'}
                  </button>
                ) : (
                  <span className="text-gray-300">REMOVE</span>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={async (e) => { e.stopPropagation(); if (isWorking) return; const res = await handleSaveProfilePic(); if (res && 'ok' in res) { if (res.ok) { setModalMsg('Profile picture updated successfully.'); setShowSuccessModal(true); } else { setModalMsg(res.error || 'Failed to update profile picture'); setShowErrorModal(true); } } }}
                  className={`text-sm font-medium ${isWorking ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:underline'}`}
                  disabled={isWorking}
                >
                  {t.t2?.toUpperCase() || 'SAVE'}
                </button>
                <span className="text-gray-400">|</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); if (isWorking) return; handleCancelUpload(); }}
                  className={`text-sm font-medium ${isWorking ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:underline'}`}
                  disabled={isWorking}
                >
                  {t.t3?.toUpperCase() || 'CANCEL'}
                </button>
              </>
            )}
            </div>
          </div>

          <input type="file" id="profileUpload" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
          <div className={`font-semibold text-lg text-center transition-all ${showPhotoActions ? 'mt-8' : ''}`}>{name}</div>
          <div className="text-gray-400 text-sm text-center">{displayEmail}</div>
          <div className="text-red-600 text-xs font-medium text-center mt-1 uppercase tracking-wide">
            {role === 'borrower'
              ? 'Borrower'
              : role === 'head'
              ? b.b14
              : role === 'manager'
              ? b.b15
              : role === 'loan officer'
              ? b.b16
              : role === 'collector'
              ? b.b17
              : role}
          </div>

          
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-0.5 px-6 pb-2">
          <button
            className="flex items-center w-full px-2 py-3 font-medium text-left hover:bg-gray-100 hover:text-black transition rounded-lg"
            onClick={() => {
              setIsDropdownOpen(false);
              router.push('/userPage/borrowerPage/account-settings');
            }}
          >
            <span>{t.t4}</span>
          </button>

          <button
            className="flex items-center w-full px-2 py-3 text-red-600 hover:bg-gray-100 transition rounded-lg"
            onClick={handleLogout}
          >
            {t.t6}
          </button>
        </div>

        <div className="text-xs text-center text-gray-400 py-2 border-t border-gray-100 mt-0.5">
          <button
            onClick={() => setShowTermsGate(true)}
            className="hover:text-gray-600 transition-colors hover:underline"
          >
            {t.t7}
          </button>
        </div>
      </div>

      {/* Loading toast + Modals */}
      <SubmitOverlayToast open={isWorking} message={t?.t21 || 'Updating profile photo...'} variant="info" />
      <ConfirmModal
        show={showRemoveConfirm}
        message={t?.t26 || 'Are you sure you want to remove your profile photo?'}
        onConfirm={async () => {
          setShowRemoveConfirm(false);
          const res = await handleRemoveProfilePic();
          if (res && 'ok' in res) {
            if (res.ok) {
              setModalMsg('Profile photo removed.');
              setShowSuccessModal(true);
            } else {
              setModalMsg(res.error || 'Failed to remove profile photo');
              setShowErrorModal(true);
            }
          }
        }}
        onCancel={() => setShowRemoveConfirm(false)}
      />
      {showSuccessModal && (
        <SuccessModal isOpen={showSuccessModal} message={modalMsg} onClose={() => setShowSuccessModal(false)} />
      )}
      {showErrorModal && (
        <ErrorModal isOpen={showErrorModal} message={modalMsg} onClose={() => { setShowErrorModal(false); clearValidationError(); }} />
      )}

      {/* Terms and Privacy Modals */}
      {showTermsGate && (
        <TermsGateModal
          language={language}
          onAccept={() => setShowTermsGate(false)}
          onCancel={() => setShowTermsGate(false)}
          onOpenTos={() => setShowTosContent(true)}
          onOpenPrivacy={() => setShowPrivacyContent(true)}
          enforceReading={false}
          showCancelButton={false}
          acceptLabel={language === 'en' ? 'Close' : 'Isara'}
          showAgreementCheckbox={false}
        />
      )}
      
      {showTosContent && (
        <TermsContentModal
          language={language}
          onClose={() => setShowTosContent(false)}
        />
      )}
      
      {showPrivacyContent && (
        <PrivacyContentModal
          language={language}
          onClose={() => setShowPrivacyContent(false)}
        />
      )}
    </>
  );
}

