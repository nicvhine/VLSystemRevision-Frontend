'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileSettingsPanel from '@/app/commonComponents/navbarComponents/profileEditing';
import { useProfileDropdownLogic } from '@/app/commonComponents/navbarComponents/dropdownLogic';
import translations from '@/app/commonComponents/translation';
import { ArrowLeft } from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true); // Always in edit mode on this page
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Initialize language from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLanguage((localStorage.getItem('language') as 'en' | 'ceb') || 'en');
    }
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        const borrowersId = localStorage.getItem('borrowersId');

        const endpoint =
          role === 'borrower'
            ? `${BASE_URL}/borrowers/${borrowersId}`
            : `${BASE_URL}/users/${userId}`;

        const response = await fetch(endpoint, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();
        setUsername(data.username || '');
        setEmail(data.email || '');
        setPhoneNumber(data.phoneNumber || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const {
    editingEmail,
    setEditingEmail,
    editingPhone,
    setEditingPhone,
    isEditingEmailField,
    setIsEditingEmailField,
    isEditingPhoneField,
    setIsEditingPhoneField,
    isEditingPasswordField,
    setIsEditingPasswordField,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    setPasswordError,
    phoneError,
    setPhoneError,
    emailError,
    setEmailError,
    settingsSuccess,
    setSettingsSuccess,
    handleAccountSettingsUpdate,
    enteredEmailCode,
    setEnteredEmailCode,
    enteredSmsCode,
    setEnteredSmsCode,
    sendEmailCode,
    sendSmsCode,
    verifySmsCode,
    verifyEmailCode,
    emailVerificationSent,
    setEmailVerificationSent,
    smsVerificationSent,
    setSmsVerificationSent,
    emailVerified,
  } = useProfileDropdownLogic(setIsEditing, setShowOtpModal);

  const t = translations.navbarTranslation[language];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        </div>

        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ProfileSettingsPanel
            username={username}
            email={email}
            phoneNumber={phoneNumber}
            editingEmail={editingEmail}
            setEditingEmail={setEditingEmail}
            isEditingEmailField={isEditingEmailField}
            setIsEditingEmailField={setIsEditingEmailField}
            editingPhone={editingPhone}
            setEditingPhone={setEditingPhone}
            isEditingPhoneField={isEditingPhoneField}
            setIsEditingPhoneField={setIsEditingPhoneField}
            isEditingPasswordField={isEditingPasswordField}
            setIsEditingPasswordField={setIsEditingPasswordField}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
            phoneError={phoneError}
            setPhoneError={setPhoneError}
            emailError={emailError}
            setEmailError={setEmailError}
            settingsSuccess={settingsSuccess}
            setSettingsSuccess={setSettingsSuccess}
            handleAccountSettingsUpdate={handleAccountSettingsUpdate}
            emailVerificationSent={emailVerificationSent}
            enteredEmailCode={enteredEmailCode}
            setEnteredEmailCode={setEnteredEmailCode}
            enteredSmsCode={enteredSmsCode}
            setEnteredSmsCode={setEnteredSmsCode}
            sendEmailCode={sendEmailCode}
            verifyEmailCode={verifyEmailCode}
            smsVerificationSent={smsVerificationSent}
            sendSmsCode={sendSmsCode}
            verifySmsCode={verifySmsCode}
            setEmailVerificationSent={setEmailVerificationSent}
            emailVerified={emailVerified}
            setSmsVerificationSent={setSmsVerificationSent}
          />
        </div>
      </div>
    </div>
  );
}
