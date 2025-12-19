import { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import type { User, DecisionConfig } from "@/app/commonComponents/utils/Types/userPage";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export function useUsersLogic() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"" | "name" | "role">("");
  const [roleFilter, setRoleFilter] = useState<"" | User["role"]>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [editValidationErrors, setEditValidationErrors] = useState<{ name?: string; email?: string; phoneNumber?: string }>({});
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionConfig, setDecisionConfig] = useState<DecisionConfig | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch users.");
      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load users.");
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const sendEmail = async ({
    to_name,
    email,
    user_username,
    user_password,
    onError,
  }: {
    to_name: string;
    email?: string | null;
    user_username: string;
    user_password: string;
    onError: (msg: string) => void;
  }) => {
    if (!email) return;
    try {
      const result = await emailjs.send(
        "service_gsrml74",
        "template_ry9tq57",
        { to_name, email, user_username, user_password },
        "6VII8ATdscjZi3UYW"
      );
      console.log("Email sent:", result?.text || result);
    } catch (error: any) {
      console.error("EmailJS error:", error);
      onError("Email failed: " + (error?.text || error.message || "Unknown error"));
    }
  };

  const handleCreateUser = async (
    input: Omit<User, "userId" | "lastActive" | "status">
  ): Promise<{ success: boolean; fieldErrors?: { email?: string; phoneNumber?: string; name?: string }; message?: string }> => {
    try {
      const payload = { ...input };
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Try to parse server error
        let msg = "Failed to create user";
        try {
          const data = await res.json();
          msg = data?.error || data?.message || msg;
        } catch {
          try { msg = await res.text(); } catch {}
        }

        // Map known uniqueness errors to field-level errors
        const fieldErrors: { email?: string; phoneNumber?: string; name?: string } = {};
        if (/email\s+already\s+(registered|in use)/i.test(msg)) fieldErrors.email = "Email already in use.";
        if (/phone\s*number\s+already\s+(registered|in use)/i.test(msg)) fieldErrors.phoneNumber = "Phone number already in use.";
        if (/name\s+already\s+(registered|in use)/i.test(msg)) fieldErrors.name = "Name already in use.";

        if (fieldErrors.email || fieldErrors.phoneNumber || fieldErrors.name) {
          // Let caller show inline errors
          return { success: false, fieldErrors };
        }

        setErrorMessage(msg);
        setErrorModalOpen(true);
        return { success: false, message: msg };
      }

      const { user: createdUser, credentials } = await res.json();
      setUsers((prev) => [...prev, createdUser]);

      await sendEmail({
        to_name: createdUser.name,
        email: createdUser.email,
        user_username: credentials.username,
        user_password: credentials.tempPassword,
        onError: (msg: string) => {
          console.error("Email error callback:", msg);
          setErrorMessage(msg);
          setErrorModalOpen(true);
          setTimeout(() => setErrorModalOpen(false), 5000);
        },
      });

      return { success: true };

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create user");
      setErrorModalOpen(true);
      return { success: false, message: err.message };
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'Activate' : 'Deactivate';
    
    setDecisionConfig({
      title: `${action} User?`,
      message: `Are you sure you want to ${action.toLowerCase()} ${user.name}?`,
      confirmText: action,
      danger: newStatus === 'Inactive',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${BASE_URL}/users/${user.userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus }),
          });
          
          if (!res.ok) throw new Error("Failed to update user status");
          
          setUsers((prev) => prev.map(u => 
            u.userId === user.userId ? { ...u, status: newStatus } : u
          ));
          setDecisionModalOpen(false);
          setSuccessMessage(`User ${action.toLowerCase()}d successfully.`);
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to update user status");
          setErrorModalOpen(true);
        }
      },
    });
    setDecisionModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingUserId) return;

    // Validation
    const errors: { name?: string; email?: string; phoneNumber?: string } = {};
    
    if (!editFormData.name || editFormData.name.trim() === '') {
      errors.name = 'Name is required';
    }
    
    if (!editFormData.email || editFormData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address';
    } else {
      // Check for duplicate email (excluding current user)
      const duplicateEmail = users.find(u => 
        u.userId !== editingUserId && 
        u.email?.toLowerCase() === editFormData.email?.toLowerCase()
      );
      if (duplicateEmail) {
        errors.email = 'This email is already used by another user';
      }
    }
    
    if (!editFormData.phoneNumber || editFormData.phoneNumber.trim() === '') {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{11}$/.test(editFormData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be exactly 11 digits';
    } else {
      // Check for duplicate phone number (excluding current user)
      const duplicatePhone = users.find(u => 
        u.userId !== editingUserId && 
        u.phoneNumber === editFormData.phoneNumber
      );
      if (duplicatePhone) {
        errors.phoneNumber = 'This phone number is already used by another user';
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors);
      return;
    }

    setEditValidationErrors({});

    setDecisionConfig({
      title: "Save Changes?",
      message: "Are you sure you want to save changes to this user?",
      confirmText: "Save",
      onConfirm: async () => {
        try {
          // Explicitly exclude status from edit payload - status can only be changed via other means
          const { status, ...editPayload } = editFormData;
          const token = localStorage.getItem("token");
          const res = await fetch(`${BASE_URL}/users/${editingUserId}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(editPayload) });
          
          if (!res.ok) {
            let errorMessage = "Failed to save user";
            try {
              const data = await res.json();
              errorMessage = data?.error || data?.message || errorMessage;
              
              // Check for specific duplicate errors from backend
              const fieldErrors: { email?: string; phoneNumber?: string } = {};
              if (/email\s+already\s+(registered|in use|exists)/i.test(errorMessage)) {
                fieldErrors.email = 'This email is already used by another user';
              }
              if (/phone\s*number\s+already\s+(registered|in use|exists)/i.test(errorMessage)) {
                fieldErrors.phoneNumber = 'This phone number is already used by another user';
              }
              
              if (fieldErrors.email || fieldErrors.phoneNumber) {
                setEditValidationErrors(fieldErrors);
                setDecisionModalOpen(false);
                return;
              }
            } catch {}
            
            setDecisionConfig(prev => prev ? { ...prev, error: errorMessage } : prev);
            return;
          }

          const data = await res.json();
          setUsers(prev => prev.map(u => u.userId === data.user.userId ? data.user : u));
          setEditFormData({});
          setEditingUserId(null);
          setEditValidationErrors({});
          setDecisionModalOpen(false);
          setSuccessMessage("User updated successfully.");
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to save user");
          setErrorModalOpen(true);
          setDecisionModalOpen(false);
        }
      },
    });
    setDecisionModalOpen(true);
  };

  const filteredUsers = users
    .filter(u => Object.values(u).some(v => v?.toString().toLowerCase().includes(searchQuery.toLowerCase())))
    .filter(u => !roleFilter || u.role === roleFilter);

  // Sort users - Active users first, then inactive users at the bottom
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // First, sort by status (Active first, Inactive last)
    const statusA = a.status === 'Active' ? 0 : 1;
    const statusB = b.status === 'Active' ? 0 : 1;
    if (statusA !== statusB) {
      return statusA - statusB;
    }

    // Then apply secondary sorting within same status group
    if (sortBy) {
      return a[sortBy].localeCompare(b[sortBy]);
    }
    return 0;
  });

  return {
    users,
    setUsers,
    loading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    sortedUsers,
    handleCreateUser,
    handleToggleStatus,
    handleSaveEdit,
    successMessage,
    setSuccessMessage,
    decisionModalOpen,
    setDecisionModalOpen,
    decisionConfig,
    setDecisionConfig,
    editValidationErrors,
    setEditValidationErrors,
    editingUserId,
    setEditingUserId,
    editFormData,
    setEditFormData,
    errorMessage,
    setErrorMessage,
    errorModalOpen,
    setErrorModalOpen,
  };
}
