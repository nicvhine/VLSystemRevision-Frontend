import { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import useAccountSettings from './accountSettings';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function useProfileDropdownLogic(
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
  setShowOtpModal: React.Dispatch<React.SetStateAction<boolean>> 

) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [editingUsername, setEditingUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [smsVerificationSent, setSmsVerificationSent] = useState(false);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [smsVerificationCode, setSmsVerificationCode] = useState('');
  const [smsVerified, setSmsVerified] = useState(false);
  const [enteredEmailCode, setEnteredEmailCode] = useState('');
  const [enteredSmsCode, setEnteredSmsCode] = useState('');
  const [otpType, setOtpType] = useState<'email' | 'sms' | null>(null);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpAnimateIn, setOtpAnimateIn] = useState(false);

  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [borrowersId, setBorrowersId] = useState('');
  const [isBorrower, setIsBorrower] = useState(false);

  useEffect(() => {
    setRole((localStorage.getItem('role') || '').toLowerCase());
    setUserId(localStorage.getItem('userId') || '');
    setBorrowersId(localStorage.getItem('borrowersId') || '');
  }, []);

  useEffect(() => {
    setIsBorrower(role === 'borrower');
  }, [role]);

  const accountEndpoint = isBorrower
  ? `borrowers/${borrowersId}`
  : `users/${userId}`;
  
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
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    notificationPreferences,
    setNotificationPreferences,
    passwordError,
    setPasswordError,
    phoneError,
    setPhoneError,
    emailError,
    setEmailError,
    settingsSuccess,
    setSettingsSuccess,
    activeSettingsTab,
    setActiveSettingsTab,
  } = useAccountSettings();

  // Toggle account settings panel
  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setActiveSettingsTab('account');
    setPasswordError('');
    setPhoneError('');
    setEmailError('');
    setSettingsSuccess('');
    setIsEditingEmailField(false);
    setIsEditingPasswordField(false);
  };

  // Logout handler
  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    const currentLang = localStorage.getItem('language') || 'en';
    localStorage.clear();
    localStorage.setItem('language', currentLang);
    localStorage.setItem('role', 'public');
    window.location.href = '/';
  };

  // Clear email states when changing
  useEffect(() => {
    setEmailVerified(false);
    setUserEnteredCode('');
  }, [editingEmail]);

  //EMAIL CODE 
  const sendEmailCode = async (): Promise<void> => {
    setEmailError(""); 
  
    if (!editingEmail || !editingEmail.trim()) {
      setEmailError("Please enter a valid email address.");
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingEmail)) {
      setEmailError("Invalid email format.");
      return;
    }
  
    try {
      const res = await fetch(`${BASE_URL}/users/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editingEmail }),
      });
  
      const data = await res.json();
  
      if (res.status === 409) {
        setEmailError(data.error || "Email already in use.");
        setEmailVerificationSent(false);
        return;
      }
  
      if (!res.ok) {
        setEmailError(data.error || "Failed to check email availability.");
        return;
      }
  
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      setEmailVerificationCode(code);
      setEmailVerified(false);
  
      const time = new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString();
  
      const templateParams = {
        to_email: editingEmail,
        passcode: code,
        time,
      };
  
      const emailResponse = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_PUBLIC_KEY!
      );
  
      if (emailResponse.status !== 200) {
        setEmailError("Failed to send email verification.");
        return;
      }
  
      setEmailError("");
      setEmailVerificationSent(true);
      setSettingsSuccess("Verification code sent to your new email.");
      setUserEnteredCode("");
    } catch (error) {
      console.error("Failed to send verification:", error);
      setEmailError("Network error. Please try again.");
    }
  };

  const verifyEmailCode = async (otpInput?: string): Promise<boolean> => {
    const codeToCheck = otpInput ?? enteredEmailCode;
  
    // Clear previous error before verifying
    setEmailError("");
  
    if (!codeToCheck) {
      setEmailError("Please enter the verification code.");
      return false;
    }
  
    if (codeToCheck !== emailVerificationCode) {
      setEmailError("Incorrect verification code. Please try again.");
      return false;
    }
  
    // Mark email as verified
    setEmailVerified(true);
    setEmailVerificationSent(false);
    setSettingsSuccess("Email verified successfully!");
    setUserEnteredCode('');
  
    // Update email in backend
    const token = localStorage.getItem('token');
    if (!token) {
      setEmailError("You must be logged in to update email.");
      return false;
    }
  
    try {
      const emailRes = await fetch(`${BASE_URL}/${accountEndpoint}/update-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: editingEmail }),
      });      
  
      if (emailRes.status === 409) {
        const data = await emailRes.json();
        setEmailError(data.error || 'Email already in use.');
        return false;
      }
  
      if (!emailRes.ok) throw new Error('Failed to update email.');
  
      localStorage.setItem('email', editingEmail);
      try {
        window.dispatchEvent(new CustomEvent('emailUpdated', { detail: { email: editingEmail } }));
      } catch {}
      setShowOtpModal(false);
      setIsEditingEmailField(false);
      setSettingsSuccess('✔ Email changed successfully.');
      return true;
    } catch (err) {
      console.error(err);
      setEmailError('Failed to update email.');
      return false;
    }
  };  

  //SMS CODE
  const sendSmsCode = async () => {
    setPhoneError("");

    if (!editingPhone) {
      setPhoneError("Please enter a phone number.");
      return;
    }
  
    try {
      // Check if phone number is already in use
      const checkRes = await fetch(`${BASE_URL}/users/check-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: editingPhone }), // use phone, not email
      });
  
      const checkData = await checkRes.json();
  
      if (checkRes.status === 409) {
        setPhoneError(checkData.error || "Phone number already in use.");
        setSmsVerificationSent(false);
        return;
      }
  
      // Generate OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
  
      setSmsVerificationCode(code);
      setSmsVerified(false);
  
      // Send OTP via SMS
      const sendRes = await fetch(`${BASE_URL}/sms/otpCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: editingPhone, code }),
      });
  
      if (!sendRes.ok) {
        setPhoneError("Failed to send OTP. Please try again.");
        setSmsVerificationSent(false);
        return;
      }
  
      setSmsVerificationSent(true);
    } catch (err) {
      console.error(err);
      setPhoneError("Something went wrong. Please try again.");
      setSmsVerificationSent(false);
    }
  };

  const verifySmsCode = async (otpInput?: string): Promise<boolean> => {
    const codeToCheck = otpInput ?? enteredSmsCode;

    setPhoneError("");
  
    if (!codeToCheck) {
      setPhoneError("Please enter the verification code.");
      return false;
    }
  
    if (codeToCheck !== smsVerificationCode) {
      setPhoneError("Incorrect verification code. Please try again.");
      return false;
    }

    setSmsVerified(true);
    setSmsVerificationSent(false);
    setSettingsSuccess("Phone number verified successfully!");
    setUserEnteredCode('');

     // Update phone in backend
     const userId = localStorage.getItem('userId');
     const token = localStorage.getItem('token');
     if (!token) {
       setPhoneError("You must be logged in to update phone number.");
       return false;
     }
  
    try {
      const res = await fetch(`${BASE_URL}/${accountEndpoint}/update-phoneNumber`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: editingPhone }),
      });      
  
      if (res.status === 409) {
        const data = await res.json();
        setPhoneError(data.error || "Phone number already in use.");
        return false;
      }
  
      if (!res.ok) throw new Error("Failed to update phone number.");
  
      localStorage.setItem("phoneNumber", editingPhone);
      try {
        window.dispatchEvent(new CustomEvent('phoneNumberUpdated', { detail: { phoneNumber: editingPhone } }));
      } catch {}
      setShowOtpModal(false);
      setIsEditingPhoneField(false);
      setSettingsSuccess('✔ Phone number changed successfully.');
      return true;
    } catch (err) {
      console.error(err);
      setPhoneError("Failed to update phone number.");
      return false;
    }
  };
  
  const handleNotificationToggle = (type: 'sms' | 'email') => {
    const updatedPrefs = {
      ...notificationPreferences,
      [type]: !notificationPreferences[type],
    };
    setNotificationPreferences(updatedPrefs);
    localStorage.setItem('notificationPreferences', JSON.stringify(updatedPrefs));
  };

  // Update account settings
  const handleAccountSettingsUpdate = async (): Promise<void> => {
    setPasswordError('');
    setPhoneError('');
    setEmailError('');
    setUsernameError('');
    setSettingsSuccess('');

    const token = localStorage.getItem('token');
    const borrowersId = localStorage.getItem('borrowersId');
    const userId = localStorage.getItem('userId');
    const currentUsername = localStorage.getItem('username');
    const currentEmail = localStorage.getItem('email');
    const currentPhone = localStorage.getItem('phoneNumber');

    if (!token) {
      setPasswordError('You must be logged in to update your account.');
      return;
    }

    try {
      // USERNAME UPDATE
      if (editingUsername.trim() !== '' && editingUsername !== currentUsername) {
        const checkResponse = await fetch(`${BASE_URL}/check-username/${editingUsername}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const checkData = await checkResponse.json();
        if (checkData.exists) {
          setUsernameError('This username is already taken.');
          return;
        }

        const usernameRes = await fetch(`${BASE_URL}/borrowers/${borrowersId}/username`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: editingUsername }),
        });

        if (!usernameRes.ok) {
          const error = await usernameRes.json();
          setUsernameError(error.message || 'Failed to update username');
          return;
        }

        localStorage.setItem('username', editingUsername);
      }

      // EMAIL UPDATE - Requires OTP Verification
      if (editingEmail.trim() !== '' && editingEmail !== currentEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editingEmail)) {
          setEmailError('Please enter a valid email address.');
          return;
        }

        // Send OTP code to new email
        try {
          await sendEmailCode();
          // Show OTP modal for user to verify
          setOtpType('email');
          setShowOtpModal(true);
          setOtpVisible(true);
          setTimeout(() => setOtpAnimateIn(true), 10);
          return; // Stop here - wait for OTP verification
        } catch (error) {
          setEmailError('Failed to send verification code. Please try again.');
          return;
        }
      }

      // PHONE UPDATE
      if (editingPhone.trim() !== '' && editingPhone !== currentPhone) {
        if (!editingPhone.startsWith('09') || editingPhone.length !== 11) {
          setPhoneError('Phone number must start with 09 and be exactly 11 digits.');
          return;
        }

        const phoneRes = await fetch(`${BASE_URL}/users/${userId}/update-phoneNumber`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ phoneNumber: editingPhone }),
        });

        if (phoneRes.status === 409) {
          const data = await phoneRes.json();
          setPhoneError(data.error || 'Phone number already in use.');
          return;
        }

        if (!phoneRes.ok) {
          throw new Error('Failed to update phone number.');
        }

        localStorage.setItem('phoneNumber', editingPhone);
      }

      // PASSWORD UPDATE
      if (currentPassword && newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          setPasswordError('New Password and Confirm Password do not match.');
          return;
        }

        if (newPassword === currentPassword) {
          setPasswordError('New password must be different from current password.');
          return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
          setPasswordError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
          return;
        }

        const passwordRes = await fetch(`${BASE_URL}/users/${userId}/change-password`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        });

        if (passwordRes.status === 401) {
          setPasswordError('Current password is incorrect.');
          return;
        }

        if (!passwordRes.ok) {
          throw new Error('Failed to update password.');
        }
      }

      // All updates successful
      setShowSuccessModal(true);
      setSettingsSuccess('✔ All changes saved successfully!');
      setTimeout(() => setSettingsSuccess(''), 4000);
      setShowConfirm(false);
      setEditingUsername('');
      setEditingEmail('');
      setEditingPhone('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error('Update error:', error);
      setPasswordError('An error occurred while saving changes. Please try again.');
      setShowErrorModal(true);
    }
  };

  return {
    currentPassword,
    setCurrentPassword,
    editingUsername,
    setEditingUsername,
    usernameError,
    setUsernameError,
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
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    notificationPreferences,
    setNotificationPreferences,
    passwordError,
    setPasswordError,
    phoneError,
    setPhoneError,
    emailError,
    setEmailError,
    settingsSuccess,
    setSettingsSuccess,
    activeSettingsTab,
    setActiveSettingsTab,
    toggleEdit,
    handleNotificationToggle,
    handleAccountSettingsUpdate,
    handleLogout,
    sendEmailCode,
    sendSmsCode,
    verifyEmailCode,
    verifySmsCode,
    emailVerificationMessage,
    emailVerificationSent,
    enteredEmailCode,
    setEnteredEmailCode,
    enteredSmsCode,
    setEnteredSmsCode,
    smsVerificationSent,
    showSuccessModal,
    setShowSuccessModal,
    showErrorModal,
    setShowErrorModal,
    showConfirm,
    setShowConfirm,
    emailVerified,
    setEmailVerificationSent,
    setSmsVerificationSent,
    setSmsVerificationCode,
    setSmsVerified,
    otpType,
    setOtpType,
    otpVisible,
    setOtpVisible,
    otpAnimateIn,
    setOtpAnimateIn,
  };
}
