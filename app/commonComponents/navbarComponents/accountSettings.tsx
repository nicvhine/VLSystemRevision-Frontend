'use client';
import { useState } from 'react';

export default function useAccountSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');  const [isEditingEmailField, setIsEditingEmailField] = useState(false);
  const [isEditingPasswordField, setIsEditingPasswordField] = useState(false);
  const [isEditingPhoneField, setIsEditingPhoneField] = useState(false);
  const [editingPhone, setEditingPhone] = useState('');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'account' | 'notifications'>('account');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState<{ sms: boolean; email: boolean }>({
    sms: false,
    email: false,
  });
  

  return {
    isEditing, setIsEditing,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    passwordError, setPasswordError,
    settingsSuccess, setSettingsSuccess,
    editingEmail, setEditingEmail,
    currentPassword, setCurrentPassword,
    isEditingEmailField, setIsEditingEmailField,
    isEditingPasswordField, setIsEditingPasswordField,
    isEditingPhoneField, setIsEditingPhoneField,
    editingPhone, setEditingPhone,
    activeSettingsTab, setActiveSettingsTab,
    notificationPreferences, setNotificationPreferences,
    phoneError, setPhoneError,
    emailError, setEmailError,
  };
}
