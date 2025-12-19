import { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import useAccountSettings from './accountSettings';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function useProfileDropdownLogic(
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
  setShowOtpModal: React.Dispatch<React.SetStateAction<boolean>> 

) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [smsVerificationSent, setSmsVerificationSent] = useState(false);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [smsVerificationCode, setSmsVerificationCode] = useState('');
  const [smsVerified, setSmsVerified] = useState(false);
  const [enteredEmailCode, setEnteredEmailCode] = useState('');
  const [enteredSmsCode, setEnteredSmsCode] = useState('');

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
    setSettingsSuccess('');

    const userId = localStorage.getItem('userId');

    try {
      // EMAIL UPDATE
      if (isEditingEmailField) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editingEmail)) {
          setEmailError('Please enter a valid email address.');
          return;
        }

        if (!emailVerified) {
          setEmailError('Please verify your new email before saving.');
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          setEmailError('You must be logged in to update email.');
          return;
        }

        const emailRes = await fetch(`${BASE_URL}/users/${userId}/update-email`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
          body: JSON.stringify({ email: editingEmail }),
        });

        if (emailRes.status === 409) {
          const data = await emailRes.json();
          setEmailError(data.error || 'Email already in use.');
          return;
        }

        if (!emailRes.ok) {
          throw new Error('Failed to update email.');
        }

        localStorage.setItem('email', editingEmail);
        setShowSuccessModal(true);
        setSettingsSuccess('✔ Email changed successfully.');
        setTimeout(() => setSettingsSuccess(''), 4000);
      }

      // PHONE UPDATE
      if (isEditingPhoneField) {
        const phoneRes = await fetch(
          `${BASE_URL}/users/${userId}/update-phoneNumber`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: editingPhone }),
          }
        );

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
      if (isEditingPasswordField) {

        if (newPassword !== confirmPassword) {
          setPasswordError('New Password and Confirm Password do not match.');
          return;
        }

        // Check that new password differs from current password
        if (newPassword === currentPassword) {
          setPasswordError('New password must be different from current password.');
          return;
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
          setPasswordError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
          return;
        }

        const borrowersId = localStorage.getItem('borrowersId') || '';
        const userId = localStorage.getItem('userId') || '';
        const role = (localStorage.getItem('role') || '').toLowerCase();
        const token = localStorage.getItem('token') || '';

        if (!token) {
          setPasswordError('You must be logged in to update password.');
          return;
        }

        let endpoint = '';
        let targetId = '';

        if (['loan officer', 'head', 'manager', 'collector'].includes(role)) {
          endpoint = 'users';
          targetId = userId;
        } else if (role === 'borrower') {
          endpoint = 'borrowers';
          targetId = borrowersId;
        } else {
          setPasswordError('Invalid account role.');
          return;
        }

        try {
          const passwordRes = await fetch(`${BASE_URL}/${endpoint}/${targetId}/change-password`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          });
        
          if (passwordRes.status === 401) {
            setPasswordError('Current password is incorrect.');
            return;
          }
        
          if (!passwordRes.ok) {
            const data = await passwordRes.json().catch(() => ({}));
            setPasswordError(data.message || 'Failed to update password.');
            return;
          }
        
          // SUCCESS
          setSettingsSuccess('✔ Password updated successfully!');
          setTimeout(() => setSettingsSuccess(''), 4000);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setIsEditingPasswordField(false);
        
        } catch (err) {
          console.error(err);
          setPasswordError('Failed to update password due to network or server error.');
        }
      }

      setIsEditingEmailField(false);
      setIsEditingPhoneField(false);
      setIsEditingPasswordField(false);
      setNewPassword('');
      setConfirmPassword('');

      if (!settingsSuccess) {
        setSettingsSuccess('Settings updated successfully!');
        setTimeout(() => setSettingsSuccess(''), 4000);
      }
    } catch (error) {
      console.error('Error updating account settings:', error);
      setPasswordError('Failed to update account settings.');
    }
  };

  return {
    currentPassword,
    setCurrentPassword,
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
    emailVerified,
    setEmailVerificationSent,
    setSmsVerificationSent,
    setSmsVerificationCode,
    setSmsVerified,
  };
}
