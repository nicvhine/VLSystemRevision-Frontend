"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import emailjs from "emailjs-com";
import { FiSearch, FiUserPlus, FiMoreVertical } from "react-icons/fi";
import ErrorModal from "@/app/commonComponents/modals/errorModal";
import SuccessModal from "@/app/commonComponents/modals/successModal";
import ConfirmModal from "./confirmModal";
import CreateUserModal from "../../headPage/userPage/createUserModal";
import { useTranslation } from "../translationHook";
import { User } from "@/app/commonComponents/utils/Types/userPage";
import React from "react";

import { useUserActions } from "./hooks/useUserActions";
import { useResetPassword } from "./hooks/useResetPassword";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function UserManagementPage() {
  const [activeStaff, setActiveStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const { handleCreateUser } = useUserActions();

  // Function to refresh users list
  const refreshUsers = async () => {
    try {
      const token = localStorage.getItem("token"); 
      if (!token) return;
  
      const res = await fetch(`${BASE_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        const data = await res.json();
        setActiveStaff(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error refreshing users:", err);
    }
  };

  // Wrapper function for creating user with success modal
  const handleCreateUserWrapper = async (user: Omit<User, "userId" | "lastActive" | "status">) => {
    const result = await handleCreateUser(user);
    
    if (result.success) {
      // Close modal
      setIsModalOpen(false);
      
      // Show success modal
      openSuccessModal(s.t93);
      
      // Refresh the user list to show newly added user
      await refreshUsers();
    }
    
    return result;
  };

  // Translation hook
  const { s, language } = useTranslation();

  const {
    confirmResetUser,
    resetPasswordLoading,
    initiateResetPassword,
    cancelResetPassword,
    handleResetPasswordConfirmed,
    errorMessage,
    successMessage,
    openErrorModal,
    closeErrorModal,
    openSuccessModal,
    closeSuccessModal
  } = useResetPassword(s);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState<string>('');

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const paginationRef = useRef<HTMLDivElement | null>(null);

  // Action menu state
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const actionPopoverRef = useRef<HTMLDivElement | null>(null);
  const actionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Toggle status state
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Edit user state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [editValidationErrors, setEditValidationErrors] = useState<{ name?: string; email?: string; phoneNumber?: string }>({});

  // Delete user state
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Confirm modal state
  const [confirmToggleUser, setConfirmToggleUser] = useState<User | null>(null);



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openActionId) return;
      const popoverEl = actionPopoverRef.current;
      const trigger = actionButtonRefs.current[openActionId];
      if (!popoverEl || !event.target) return;
      const target = event.target as Node;
      if (popoverEl.contains(target)) return;
      if (trigger && trigger.contains(target)) return;
      setOpenActionId(null);
    };

    const closeOnScroll = () => setOpenActionId(null);
    const closeOnResize = () => setOpenActionId(null);

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnResize);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [openActionId]);

  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    if (!role) {
      router.push('/');
      return;
    }
    setCurrentUserRole(role);

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); 
        if (!token) throw new Error("No authentication token found.");
    
        const res = await fetch(`${BASE_URL}/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
    
        if (res.status === 403) {
          throw new Error("You do not have permission to access this resource.");
        }
    
        if (!res.ok) {
          throw new Error("Failed to fetch users.");
        }
    
        const data = await res.json();
        setActiveStaff(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        openErrorModal(err.message || "An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };
    

    fetchUsers();
  }, [router]);

  // Toggle status handlers (Activate/Deactivate)
  const initiateToggleStatus = (user: User) => setConfirmToggleUser(user);
  const cancelToggleStatus = () => setConfirmToggleUser(null);

  const handleToggleStatusConfirmed = async () => {
    if (!confirmToggleUser) return;

    try {
      setTogglingUserId(confirmToggleUser.userId);
      const newStatus = confirmToggleUser.status === 'Active' ? 'Inactive' : 'Active';
      
      const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");

        const res = await fetch(`${BASE_URL}/users/${confirmToggleUser.userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
      
      if (!res.ok) throw new Error(s.t97);

      setActiveStaff(prev => prev.map(u => 
        u.userId === confirmToggleUser.userId ? { ...u, status: newStatus } : u
      ));
      
      openSuccessModal(`${s.t89} ${newStatus === 'Active' ? s.t90 : s.t91} ${confirmToggleUser.name}`);
    } catch (err) {
      console.error("Toggle status error:", err);
      openErrorModal(s.t97);
    } finally {
      setTogglingUserId(null);
      setConfirmToggleUser(null);
    }
  };

  // Edit user handlers
  const handleEditClick = (user: User) => {
    setEditingUserId(user.userId);
    setEditFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      // Don't include status - it should only be changed via Activate/Deactivate
    });
  };

  const handleEditChange = (field: keyof User, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditFormData({});
    setEditValidationErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingUserId) return;

    // Validation
    const errors: { name?: string; email?: string; phoneNumber?: string } = {};
    
    if (!editFormData.name || editFormData.name.trim() === '') {
      errors.name = language === 'en' ? 'Name is required' : 'Kinahanglan ang ngalan';
    }
    
    if (!editFormData.email || editFormData.email.trim() === '') {
      errors.email = language === 'en' ? 'Email is required' : 'Kinahanglan ang email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = language === 'en' ? 'Please enter a valid email address' : 'Mangyaring magsumite ng wastong email address';
    } else {
      // Check for duplicate email (excluding current user)
      const duplicateEmail = activeStaff.find(u => 
        u.userId !== editingUserId && 
        u.email?.toLowerCase() === editFormData.email?.toLowerCase()
      );
      if (duplicateEmail) {
        errors.email = language === 'en' 
          ? 'This email is already used by another user' 
          : 'Kini nga email gigamit na sa lain nga user';
      }
    }
    
    if (!editFormData.phoneNumber || editFormData.phoneNumber.trim() === '') {
      errors.phoneNumber = language === 'en' ? 'Phone number is required' : 'Kinahanglan ang phone number';
    } else if (!/^\d{11}$/.test(editFormData.phoneNumber)) {
      errors.phoneNumber = language === 'en' ? 'Phone number must be 11 digits' : 'Ang phone number kinahanglan 11 ka numero';
    } else {
      // Check for duplicate phone number (excluding current user)
      const duplicatePhone = activeStaff.find(u => 
        u.userId !== editingUserId && 
        u.phoneNumber === editFormData.phoneNumber
      );
      if (duplicatePhone) {
        errors.phoneNumber = language === 'en' 
          ? 'This phone number is already used by another user' 
          : 'Kini nga phone number gigamit na sa lain nga user';
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors);
      return;
    }

    setEditValidationErrors({});

    try {
      // Explicitly exclude status from edit payload - status can only be changed via Activate/Deactivate
      const { status, ...editPayload } = editFormData;
      
      const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");

        const res = await fetch(`${BASE_URL}/users/${editingUserId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(editPayload),
        });

      if (!res.ok) {
        let errorMessage = s.t96;
        try {
          const data = await res.json();
          errorMessage = data?.error || data?.message || errorMessage;
          
          // Check for specific duplicate errors from backend
          const fieldErrors: { email?: string; phoneNumber?: string } = {};
          if (/email\s+already\s+(registered|in use|exists)/i.test(errorMessage)) {
            fieldErrors.email = language === 'en' 
              ? 'This email is already used by another user' 
              : 'Kini nga email gigamit na sa lain nga user';
          }
          if (/phone\s*number\s+already\s+(registered|in use|exists)/i.test(errorMessage)) {
            fieldErrors.phoneNumber = language === 'en' 
              ? 'This phone number is already used by another user' 
              : 'Kini nga phone number gigamit na sa lain nga user';
          }
          
          if (fieldErrors.email || fieldErrors.phoneNumber) {
            setEditValidationErrors(fieldErrors);
            return;
          }
        } catch {}
        
        throw new Error(errorMessage);
      }

      setActiveStaff(prev => prev.map(u => 
        u.userId === editingUserId ? { ...u, ...editPayload } as User : u
      ));

      openSuccessModal(s.t94);
      setEditingUserId(null);
      setEditFormData({});
    } catch (err: any) {
      console.error("Edit user error:", err);
      openErrorModal(err.message || s.t96);
    }
  };


  // Filter and search users
  const filteredUsers = activeStaff.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role.toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  // Sort users - Active users first, then inactive users at the bottom
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // First, sort by status (Active first, Inactive last)
    const statusA = a.status === 'Active' ? 0 : 1;
    const statusB = b.status === 'Active' ? 0 : 1;
    if (statusA !== statusB) {
      return statusA - statusB;
    }

    // Then apply secondary sorting within same status group
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'role') {
      return a.role.localeCompare(b.role);
    }
    if (sortBy === 'date') {
      // Sort by userId as a proxy for creation date (assuming sequential IDs)
      return (a.userId || '').localeCompare(b.userId || '');
    }
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalCount = sortedUsers.length;
  const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd = totalCount === 0 ? 0 : Math.min(totalCount, currentPage * pageSize);

  const toggleActions = (userId: string) => {
    setOpenActionId((prev) => (prev === userId ? null : userId));
  };

  const handleAction = (action: "activate" | "deactivate" | "reset" | "edit", user: User) => {
    setOpenActionId(null);
    if (action === "reset") {
      initiateResetPassword(user);
    } else if (action === "activate" || action === "deactivate") {
      initiateToggleStatus(user);
    } else if (action === "edit") {
      handleEditClick(user);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">{s.t69} {s.t3.toLowerCase()}...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 py-8">
        {errorMessage && <ErrorModal isOpen={!!errorMessage} message={errorMessage} onClose={closeErrorModal} />}
        {successMessage && <SuccessModal isOpen={!!successMessage} message={successMessage} onClose={closeSuccessModal} />}

        {confirmResetUser && (
          <ConfirmModal
            isOpen={!!confirmResetUser}
            title={s.t34}
            message={`${s.t74.replace('proceed', `reset the password for ${confirmResetUser.name}`)}`}
            onConfirm={handleResetPasswordConfirmed}
            onCancel={cancelResetPassword}
            loading={resetPasswordLoading}
          />
        )}

        {confirmToggleUser && (
          <ConfirmModal
            isOpen={!!confirmToggleUser}
            title={confirmToggleUser.status === 'Active' ? s.t36 : s.t35}
            message={confirmToggleUser.status === 'Active' ? `${s.t49.replace('this user', confirmToggleUser.name)}` : `${s.t50.replace('this user', confirmToggleUser.name)}`}
            onConfirm={handleToggleStatusConfirmed}
            onCancel={cancelToggleStatus}
          />
        )}


        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{s.t3}</h1>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          {/* Mobile Dropdown */}
          <div className="block sm:hidden relative max-w-full">
            <select
              value={roleFilter || "All"}
              onChange={(e) => { setRoleFilter(e.target.value === "All" ? "" : e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition-all"
            >
              {["All", "head", "manager", "loan officer", "collector", "sysad"].map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption === "All" ? s.t82 : roleOption === "sysad" ? s.t98 : roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {/* Desktop buttons */}
          <div className="hidden sm:flex flex-wrap gap-2 bg-white p-3 rounded-lg shadow-sm w-full max-w-full">
            {["All", "head", "manager", "loan officer", "collector", "sysad"].map((roleOption) => (
              <button
                key={roleOption}
                onClick={() => { setRoleFilter(roleOption === "All" ? "" : roleOption); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  (roleFilter === roleOption || (!roleFilter && roleOption === "All"))
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{ minWidth: 100 }}
              >
                {roleOption === "All" ? s.t82 : roleOption === "sysad" ? s.t98 : roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search, Sort and Create User */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 w-full max-w-full">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder={s.t46}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="relative w-full sm:w-[200px]">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition-all"
            >
              <option value="">{s.t99}</option>
              <option value="name">{s.t37}</option>
              <option value="role">{s.t41}</option>
              <option value="date">{s.t100}</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white rounded-lg px-4 py-[14px] flex items-center gap-2 shadow-sm cursor-pointer hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 font-medium text-sm w-auto whitespace-nowrap"
          >
            <FiUserPlus className="w-4 h-4" />
            <span className="leading-none">{s.t31}</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="min-w-full table-fixed">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col className="w-[120px]" />
            </colgroup>
            <thead>
              <tr>
                <th className="bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">ID</th>
                <th className="bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{s.t39}</th>
                <th className="bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{s.t38}</th>
                <th className="bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{s.t39}</th>
                <th className="bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{s.t40}</th>
                <th className="bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{s.t41}</th>
                <th className="bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{s.t42}</th>
                <th className="bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">{s.t43}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedUsers.map((user, index) => (
                <tr key={user.userId || index} className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                  user.status === 'Inactive' ? 'bg-gray-100' : ''
                }`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{user.userId}</td>
                  {editingUserId === user.userId ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <input 
                          className={`border rounded px-2 py-1 w-full ${
                            editValidationErrors.name ? 'border-red-500' : 'border-gray-300'
                          }`} 
                          value={editFormData.name || ''} 
                          onChange={(e) => handleEditChange("name", e.target.value)} 
                        />
                        {editValidationErrors.name && (
                          <p className="text-xs text-red-500 mt-1">{editValidationErrors.name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <input 
                          className={`border rounded px-2 py-1 w-full ${
                            editValidationErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`} 
                          value={editFormData.email || ''} 
                          onChange={(e) => handleEditChange("email", e.target.value)} 
                        />
                        {editValidationErrors.email && (
                          <p className="text-xs text-red-500 mt-1">{editValidationErrors.email}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <input 
                          className={`border rounded px-2 py-1 w-full ${
                            editValidationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                          }`} 
                          value={editFormData.phoneNumber || ''} 
                          onChange={(e) => handleEditChange("phoneNumber", e.target.value)} 
                        />
                        {editValidationErrors.phoneNumber && (
                          <p className="text-xs text-red-500 mt-1">{editValidationErrors.phoneNumber}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <select className="border border-gray-300 rounded px-2 py-1 w-full" value={editFormData.role || ''} onChange={(e) => handleEditChange("role", e.target.value)}>
                          <option value="head">Head</option>
                          <option value="manager">Manager</option>
                          <option value="loan officer">Loan Officer</option>
                          <option value="collector">Collector</option>
                          <option value="sysad">{s.t98}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.status || 'Active'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center w-[120px]">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={handleSaveEdit}
                            className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                          >
                            {s.t5}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-sm text-red-600 hover:text-red-700 hover:underline"
                          >
                            {s.t6}
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-700'
                      }`}>{user.name}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-700'
                      }`}>{user.username}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-700'
                      }`}>{user.email}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-700'
                      }`}>{user.phoneNumber || 'N/A'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm capitalize ${
                        user.status === 'Inactive' ? 'text-gray-400' : 'text-gray-700'
                      }`}>{user.role === 'sysad' ? s.t98 : user.role}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        user.status === 'Inactive' ? 'text-gray-400 font-medium' : 'text-gray-700'
                      }`}>{user.status || 'Active'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center w-[120px]">
                        <div className="relative inline-flex items-center justify-center">
                          <button
                            ref={(el) => { actionButtonRefs.current[user.userId] = el; }}
                            onClick={() => toggleActions(user.userId)}
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 text-gray-600"
                            aria-haspopup="menu"
                            aria-expanded={openActionId === user.userId}
                            aria-label={s.t43}
                          >
                            <FiMoreVertical className="w-5 h-5" />
                          </button>
                          {openActionId === user.userId && actionButtonRefs.current[user.userId] && (() => {
                            const rect = actionButtonRefs.current[user.userId]!.getBoundingClientRect();
                            const menuWidth = 160;
                            const menuHeight = 144;
                            const viewportHeight = window.innerHeight;
                            const viewportWidth = window.innerWidth;
                            const paginationTop = paginationRef.current?.getBoundingClientRect().top ?? viewportHeight;
                            const spaceBelow = Math.min(paginationTop, viewportHeight) - rect.bottom;
                            const spaceAbove = rect.top;
                            
                            let top: number;
                            // Prefer below, only go above if not enough space below AND enough space above
                            if (spaceBelow < menuHeight + 16 && spaceAbove > menuHeight + 16) {
                              top = rect.top - menuHeight + 6;
                            } else {
                              top = rect.bottom + 8;
                            }
                            
                            let left = rect.right - menuWidth;
                            if (left < 8) {
                              left = 8;
                            } else if (left + menuWidth > viewportWidth - 8) {
                              left = viewportWidth - menuWidth - 8;
                            }
                            
                            const style: React.CSSProperties = {
                              position: "fixed",
                              top: `${top}px`,
                              left: `${left}px`,
                              width: `${menuWidth}px`,
                              zIndex: 9999,
                            };
                            return (
                              <div
                                ref={actionPopoverRef}
                                style={style}
                                className="rounded-md bg-white shadow-xl border border-gray-200 focus:outline-none fixed"
                                role="menu"
                              >
                                <button
                                  onClick={() => handleAction("edit", user)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  role="menuitem"
                                >
                                  {s.t32}
                                </button>
                                {user.status === 'Active' ? (
                                  <button
                                    onClick={() => handleAction("deactivate", user)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                                    role="menuitem"
                                  >
                                    {s.t36}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAction("activate", user)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                    role="menuitem"
                                  >
                                    {s.t35}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleAction("reset", user)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  role="menuitem"
                                >
                                  {s.t34}
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {sortedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500 font-semibold">
                    {s.t47}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3 text-black" ref={paginationRef}>
          <div className="text-sm text-gray-700">
            {totalCount === 0 ? (
              <>{s.t86} 0 {s.t71} 0</>
            ) : (
              <>{s.t86} <span className="font-medium">{showingStart}</span>–<span className="font-medium">{showingEnd}</span> {s.t71} <span className="font-medium">{totalCount}</span></>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{s.t85}:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                {s.t83}
              </button>
              <span className="px-1 py-1 text-gray-700">
                {s.t70} <span className="font-medium">{currentPage}</span> {s.t71} <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                {s.t84}
              </button>
            </div>
          </div>
        </div>

        {/* Add User Modal */}
        <CreateUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateUserWrapper}
          language={language}
        />
      </div>
    </div>
  );
}