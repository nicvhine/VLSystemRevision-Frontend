"use client";

import { User } from "@/app/commonComponents/utils/Types/userPage";
import { sendEmail } from "./sendEmail";
import { useTranslation } from "../../translationHook";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const useUserActions = () => {
  const { s } = useTranslation();

  const handleCreateUser = async (
    input: Omit<User, "userId" | "lastActive" | "status">
  ): Promise<{
    success: boolean;
    fieldErrors?: { email?: string; phoneNumber?: string; name?: string };
    message?: string;
  }> => {
    try {
      const payload = { ...input };
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = s.t95;
        try {
          const data = await res.json();
          msg = data?.error || data?.message || msg;
        } catch {
          try { msg = await res.text(); } catch {}
        }

        const fieldErrors: { email?: string; phoneNumber?: string; name?: string } = {};
        if (/email\s+already\s+(registered|in use|exists)/i.test(msg)) {
          fieldErrors.email = "This email is already registered. Please use a different email address.";
        }
        if (/phone\s*number\s+already\s+(registered|in use|exists)/i.test(msg)) {
          fieldErrors.phoneNumber = "This phone number is already registered. Please use a different phone number.";
        }
        if (/name\s+already\s+(registered|in use|exists)/i.test(msg)) {
          fieldErrors.name = "This name is already registered. Please use a different name.";
        }

        if (fieldErrors.email || fieldErrors.phoneNumber || fieldErrors.name) {
          return { success: false, fieldErrors };
        }

        return { success: false, message: msg };
      }

      const { user: createdUser, credentials } = await res.json();

      await sendEmail({
        to_name: createdUser.name,
        email: createdUser.email,
        user_username: credentials.username,
        user_password: credentials.tempPassword,
        onError: (msg: string) => {
          console.error("Email error callback:", msg);
        },
      });

      return { success: true };
    } catch (err: any) {
      console.error("Create user error:", err);
      return { success: false, message: err.message || s.t95 };
    }
  };

  return { handleCreateUser };
};
