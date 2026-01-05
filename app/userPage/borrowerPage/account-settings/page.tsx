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
  const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
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
    editingUsername,
    setEditingUsername,
    usernameError,
    setUsernameError,
    showSuccessModal,
    setShowSuccessModal,
    showErrorModal,
    setShowErrorModal,
    showConfirm,
    setShowConfirm,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm hover:shadow-md"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-red-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your account information and security</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
            >
              Edit
            </button>
          )}
        </div>

        {/* Settings Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <ProfileSettingsPanel
            username={username}
            editingUsername={editingUsername}
            setEditingUsername={setEditingUsername}
            usernameError={usernameError}
            setUsernameError={setUsernameError}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
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
            showSuccessModal={showSuccessModal}
            setShowSuccessModal={setShowSuccessModal}
            showErrorModal={showErrorModal}
            setShowErrorModal={setShowErrorModal}
            showConfirm={showConfirm}
            setShowConfirm={setShowConfirm}
          />
        </div>

        {!isEditing && (
          <div className="text-center mt-8 text-gray-600">
            Click the Edit button above to modify your account settings.
          </div>
        )}
      </div>
    </div>
  );
}
