"use client";

import { useState, useEffect } from "react";

import ConfirmModal from "@/app/commonComponents/modals/confirmModal";
import translations from "@/app/commonComponents/translation";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    user: {
      name: string;
      username: string;
      email: string;
      phoneNumber: string;
      role: "head" | "manager" | "loan officer" | "collector";
      status?: "Active" | "Inactive";
    }
  ) => Promise<{ success: boolean; fieldErrors?: { email?: string; phoneNumber?: string; name?: string }; message?: string }> | void;
  language?: "en" | "ceb";
  currentUserRole?: string;
  existingUsers?: Array<{ name: string; email: string; phoneNumber: string; userId: string }>;
}


export default function CreateUserModal({
  isOpen,
  onClose,
  onCreate,
  language: languageOverride,
  currentUserRole,
  existingUsers = [],
}: CreateUserModalProps) {
  // Form state for new user data
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    role: "manager" as const,
    status: "Active" as const,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState<{ name?: string; email?: string; phoneNumber?: string }>({});
  const [checking, setChecking] = useState<{ name?: boolean; email?: boolean; phoneNumber?: boolean }>({});

  // Modal state management
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [language, setLanguage] = useState<"en" | "ceb">(languageOverride ?? "en");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    if (languageOverride) {
      setLanguage(languageOverride);
    }
  }, [languageOverride]);

  useEffect(() => {
    // Get current user's role from localStorage or prop
    const storedRole = currentUserRole || localStorage.getItem("role") || "";
    setUserRole(storedRole);

    if (languageOverride) return;
    if (typeof window === "undefined") return;

    const keyMap: Record<string, string> = {
      head: "headLanguage",
      "loan officer": "loanOfficerLanguage",
      manager: "managerLanguage",
    };

    const primaryKey = keyMap[storedRole] || "language";
    const storedLanguage =
      (localStorage.getItem(primaryKey) as "en" | "ceb") ||
      (localStorage.getItem("language") as "en" | "ceb") ||
      "en";
    setLanguage(storedLanguage);

    const handleLanguageChange = (event: CustomEvent) => {
      const lang = event.detail?.language;
      if (lang !== "en" && lang !== "ceb") return;
      const target = event.detail?.userType;
      if (!target) {
        setLanguage(lang);
        return;
      }
      const matchesRole =
        (storedRole === "head" && target === "head") ||
        (storedRole === "loan officer" && target === "loanOfficer") ||
        (storedRole === "manager" && target === "manager");
      if (matchesRole) setLanguage(lang);
    };

    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener);
  }, [languageOverride, currentUserRole]);

  const m = translations.managementTranslation[language];
  const b = translations.buttonTranslation[language];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger entrance animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for exit animation to complete before hiding
      setTimeout(() => setIsVisible(false), 150);
    }
  }, [isOpen]);

  const handleModalClose = () => {
    setShowConfirm(false);
    onClose();
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Update the value first
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Validate format only, don't touch duplicate errors
    let error = "";
    if (name === "name") {
      if (!/^[A-Za-z ]*$/.test(value)) error = "Name must contain only letters and spaces.";
      else if (value.length < 2) error = "Name must be at least 2 characters.";
      else if (value.length > 50) error = "Name must be at most 50 characters.";
      else if (value && !value.includes(" ")) error = "Please enter a full name (first and last).";
    }
    if (name === "email") {
      if (value && !/^\S+@\S+\.\S+$/.test(value)) error = "Please enter a valid email address.";
    }
    if (name === "phoneNumber") {
      if (!/^\d*$/.test(value)) error = "Phone number must contain only digits.";
      else if (value.length !== 11 && value.length > 0) error = "Phone number must be exactly 11 digits.";
    }
    
    // Only update error if there's a format error
    // Don't clear duplicate errors from onBlur checks
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      // Only clear the error if it's not a duplicate error
      setErrors((prev) => {
        const currentError = prev[name as keyof typeof prev];
        if (currentError && !currentError.includes('already in use')) {
          return { ...prev, [name]: "" };
        }
        return prev;
      });
    }
  };

  // Check for duplicates on blur - LOCAL check against existingUsers
  const checkDuplicate = (field: 'name' | 'email' | 'phoneNumber', value: string) => {
    if (!value?.trim()) return; // Don't check empty values
    
    let isDuplicate = false;
    let errorMsg = "";
    
    if (field === 'name') {
      isDuplicate = existingUsers.some(u => u.name?.toLowerCase() === value.trim().toLowerCase());
      errorMsg = "Name already in use.";
    } else if (field === 'email') {
      isDuplicate = existingUsers.some(u => u.email?.toLowerCase() === value.trim().toLowerCase());
      errorMsg = "Email already in use.";
    } else if (field === 'phoneNumber') {
      isDuplicate = existingUsers.some(u => u.phoneNumber === value.trim());
      errorMsg = "Phone number already in use.";
    }
    
    if (isDuplicate) {
      setErrors(prev => ({ ...prev, [field]: errorMsg }));
    } else {
      // Clear duplicate error only if current error is a duplicate error
      setErrors(prev => {
        const currentError = prev[field];
        if (currentError && currentError.includes('already in use')) {
          return { ...prev, [field]: "" };
        }
        return prev;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    
    // Format validation
    if (!newUser.name.trim()) newErrors.name = "Please enter a name.";
    else if (!/^[A-Za-z ]{2,50}$/.test(newUser.name.trim())) newErrors.name = "Name must be 2-50 letters and spaces only.";
    else if (!newUser.name.trim().includes(" ")) newErrors.name = "Please enter a full name (first and last).";
    else {
      // Check for duplicate name (case-insensitive)
      const duplicateName = existingUsers.find(u => 
        u.name?.toLowerCase() === newUser.name?.trim().toLowerCase()
      );
      if (duplicateName) {
        newErrors.name = "Name already in use.";
      }
    }
    
    if (!newUser.email.trim()) newErrors.email = "Please enter an email address.";
    else if (!/^\S+@\S+\.\S+$/.test(newUser.email.trim())) newErrors.email = "Please enter a valid email address.";
    else {
      // Check for duplicate email (case-insensitive)
      const duplicateEmail = existingUsers.find(u => 
        u.email?.toLowerCase() === newUser.email?.trim().toLowerCase()
      );
      if (duplicateEmail) {
        newErrors.email = "Email already in use.";
      }
    }
    
    if (!newUser.phoneNumber.trim()) newErrors.phoneNumber = "Please enter a phone number.";
    else if (!/^\d{11}$/.test(newUser.phoneNumber.trim())) newErrors.phoneNumber = "Phone number must be exactly 11 digits.";
    else {
      // Check for duplicate phone number
      const duplicatePhone = existingUsers.find(u => 
        u.phoneNumber === newUser.phoneNumber?.trim()
      );
      if (duplicatePhone) {
        newErrors.phoneNumber = "Phone number already in use.";
      }
    }
    
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    setShowConfirm(true);
  };

  const handleConfirmCreate = async () => {
    setIsCreating(true);
    // Clear previous errors
    setErrors((prev) => ({ ...prev, email: undefined }));
    const result = await Promise.resolve(onCreate(newUser) as any);
    setIsCreating(false);
    if (result && typeof result === 'object' && result.success === false) {
      // Show inline field errors and keep modal open
      if (result.fieldErrors) {
        setErrors((prev) => ({
          ...prev,
          ...(result.fieldErrors.email ? { email: result.fieldErrors.email } : {}),
          ...(result.fieldErrors.phoneNumber ? { phoneNumber: result.fieldErrors.phoneNumber } : {}),
          ...(result.fieldErrors.name ? { name: result.fieldErrors.name } : {}),
        }));
      }
      setShowConfirm(false);
      return;
    }
    // Success path: close modals and reset form
    setShowConfirm(false);
    onClose();
    setNewUser({ name: "", username: "", email: "", phoneNumber: "", role: "manager", status: "Active" });
    
    // Trigger success message after modal is closed
    if (result && result.success && result.showSuccess) {
      result.showSuccess();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 transition-opacity duration-150 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleModalClose}
    >
      <div
        className={`bg-white p-6 text-black rounded-lg shadow-lg w-full max-w-md transition-all duration-150 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{m.u1}</h2>
        <p className="text-sm text-gray-500 mb-4">{m.u2}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder={m.u3}
              className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              value={newUser.name}
              onChange={handleChange}
              onBlur={(e) => checkDuplicate('name', e.target.value)}
              minLength={2}
              maxLength={50}
              pattern="[A-Za-z ]+"
              required
              autoComplete="off"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder={m.u4}
              className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              value={newUser.email}
              onChange={handleChange}
              onBlur={(e) => checkDuplicate('email', e.target.value)}
              required
              autoComplete="off"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <input
              type="tel"
              name="phoneNumber"
              placeholder={m.u5}
              className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
              value={newUser.phoneNumber}
              onChange={handleChange}
              onBlur={(e) => checkDuplicate('phoneNumber', e.target.value)}
              minLength={11}
              maxLength={11}
              pattern="\d{11}"
              required
              autoComplete="off"
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{m.u6}</label>
            <select
              name="role"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
              value={newUser.role}
              onChange={handleChange}
            >
              {/* Only show "head" option if current user is sysad */}
              {userRole === "sysad" && <option value="head">{b.b14}</option>}
              <option value="manager">{b.b15}</option>
              <option value="loan officer">{b.b16}</option>
              <option value="collector">{b.b17}</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isCreating}
              className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-md ${
                isCreating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {b.b5}
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-red-600 text-white rounded-md ${
                (!!errors.name || !!errors.email || !!errors.phoneNumber ||
                !newUser.name.trim() || !newUser.email.trim() || !newUser.phoneNumber.trim() ||
                checking.name || checking.email || checking.phoneNumber || isCreating) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={
                !!errors.name || !!errors.email || !!errors.phoneNumber ||
                !newUser.name.trim() || !newUser.email.trim() || !newUser.phoneNumber.trim() ||
                checking.name || checking.email || checking.phoneNumber || isCreating
              }
            >
              {m.u7}
            </button>
          </div>
          <ConfirmModal
            show={showConfirm}
            message={m.u8}
            onConfirm={handleConfirmCreate}
            onCancel={() => setShowConfirm(false)}
            loading={isCreating}
          />
        </form>
      </div>
    </div>
  );
}