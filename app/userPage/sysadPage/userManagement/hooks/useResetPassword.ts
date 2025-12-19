"use client";

import { useState } from "react";
import emailjs from "emailjs-com";
import { authFetch } from "@/app/commonComponents/loanApplication/function";
import { User } from "@/app/commonComponents/utils/Types/userPage";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const useResetPassword = (s: any) => {
  const [confirmResetUser, setConfirmResetUser] = useState<User | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const openErrorModal = (msg: string) => setErrorMessage(msg);
  const closeErrorModal = () => setErrorMessage(null);

  const openSuccessModal = (msg: string) => setSuccessMessage(msg);
  const closeSuccessModal = () => setSuccessMessage(null);

  const initiateResetPassword = (user: User) => setConfirmResetUser(user);
  const cancelResetPassword = () => setConfirmResetUser(null);

  const handleResetPasswordConfirmed = async () => {
    if (!confirmResetUser) return;

    try {
      setResettingUserId(confirmResetUser.userId);
      setResetPasswordLoading(true);

      const res = await authFetch(`${BASE_URL}/users/reset-password/${confirmResetUser.userId}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error(s.t67);

      const { defaultPassword } = await res.json();

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_RESET_TEMPLATE_ID!,
        {
          to_name: confirmResetUser.name,
          to_email: confirmResetUser.email,
          temp_password: defaultPassword,
        },
        process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_PUBLIC_KEY!
      );

      openSuccessModal(`${s.t87} ${confirmResetUser.name}. ${s.t51} ${s.t88}`);
    } catch (err) {
      console.error("Reset password/email error:", err);
      openErrorModal(s.t67);
    } finally {
      setResetPasswordLoading(false);
      setResettingUserId(null);
      setConfirmResetUser(null);
    }
  };

  return {
    confirmResetUser,
    resettingUserId,
    resetPasswordLoading,
    errorMessage,
    successMessage,
    openErrorModal,
    closeErrorModal,
    openSuccessModal,
    closeSuccessModal,
    initiateResetPassword,
    cancelResetPassword,
    handleResetPasswordConfirmed,
  };
};
