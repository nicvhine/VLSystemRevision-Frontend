export interface ProfileEditingProps {
    username: string;
    editingUsername: string;
    setEditingUsername: (v: string) => void;
    usernameError: string;
    setUsernameError: (v: string) => void;
    isEditing?: boolean;
    setIsEditing?: (v: boolean) => void;
    
    email: string;
    phoneNumber: string;

    editingEmail: string;
    setEditingEmail: (v: string) => void;
    editingPhone: string;
    setEditingPhone: (v: string) => void;

    isEditingEmailField: boolean;
    setIsEditingEmailField: (v: boolean) => void;
    isEditingPhoneField: boolean;
    setIsEditingPhoneField: (v: boolean) => void;

    isEditingPasswordField: boolean;
    setIsEditingPasswordField: (v: boolean) => void;
    currentPassword: string;
    setCurrentPassword: (v: string) => void;
    newPassword: string;
    setNewPassword: (v: string) => void;
    confirmPassword: string;
    setConfirmPassword: (v: string) => void;
    passwordError: string;
    setPasswordError: (v: string) => void; 

    emailError: string;
    setEmailError: (v: string) => void; 
    phoneError: string;
    setPhoneError: (v: string) => void;

    settingsSuccess: string;
    setSettingsSuccess: (v: string) => void;

    handleAccountSettingsUpdate: () => Promise<void>;

    emailVerificationSent: boolean;
    setEmailVerificationSent: (v: boolean) => void; 
    smsVerificationSent: boolean;
    setSmsVerificationSent: (v: boolean) => void; 

    enteredEmailCode: string;
    setEnteredEmailCode: (v: string) => void;

    enteredSmsCode: string;
    setEnteredSmsCode: (v: string) => void;

    sendEmailCode: () => Promise<void>;
    verifyEmailCode: () => Promise<boolean>;
    sendSmsCode: () => Promise<void>;
    verifySmsCode: () => void;

    emailVerified: boolean;
    
    showSuccessModal: boolean;
    setShowSuccessModal: (v: boolean) => void;
    showErrorModal: boolean;
    setShowErrorModal: (v: boolean) => void;
    showConfirm: boolean;
    setShowConfirm: (v: boolean) => void;
  }
  