'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import SuccessModal from "./successModal";
import ConfirmModal from "./confirmModal";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface Collector {
  userId: string;
  name: string;
}

interface Props {
  currentCollector: string; 
  isOpen: boolean;
  onClose: () => void;
  borrowerId: string;
  onUpdated: (newCollectorId: string, newCollectorName: string) => void;
}

export default function ChangeCollectorModal({
  currentCollector,
  isOpen,
  onClose,
  borrowerId,
  onUpdated,
}: Props) {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [selectedCollectorId, setSelectedCollectorId] = useState(currentCollector || "");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Sync selected collector when prop changes
  useEffect(() => {
    setSelectedCollectorId(currentCollector || "");
  }, [currentCollector]);

  // Handle escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && !loading) handleModalClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible, loading]);

  const handleModalClose = () => {
    if (loading) return;
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setSuccessMessage("");
      setErrorMessage("");
      setShowConfirm(false);
      onClose();
    }, 150);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleModalClose();
  };

  // Fetch collectors from API with token
  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token);

        if (!token) throw new Error("No token found");

        const res = await fetch(`${BASE_URL}/users/collectors`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch collectors");

        const data: Collector[] = await res.json();
        console.log("Collectors:", data);
        setCollectors(data);

        // If no collector is selected yet, default to first one
        if (!selectedCollectorId && data.length > 0) {
          setSelectedCollectorId(data[0].userId);
          console.log("Default selectedCollectorId set to:", data[0].userId);
        }
      } catch (err) {
        console.error("Error fetching collectors:", err);
      }
    };

    fetchCollectors();
  }, []);

  const handleSaveClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // Match using userId
      const selectedCollector = collectors.find(c => c.userId === selectedCollectorId);
      console.log("Selected Collector object:", selectedCollector);

      if (!selectedCollector) throw new Error("Selected collector not found");

      const res = await fetch(`${BASE_URL}/borrowers/${borrowerId}/assign-collector`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignedCollector: selectedCollector.userId,
          assignedCollectorName: selectedCollector.name,
        }),
      });

      if (!res.ok) throw new Error("Failed to update collector");

      console.log("Collector updated successfully:", selectedCollector);
      onUpdated(selectedCollector.userId, selectedCollector.name);
      setSuccessMessage("Collector updated successfully!");
      setTimeout(() => {
        handleModalClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to update collector. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-150 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative text-black transform transition-all duration-150 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleModalClose}
          className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed hover:text-gray-500' : ''
          }`}
          disabled={loading}
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Change Assigned Collector
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Collector
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={selectedCollectorId}
            onChange={(e) => setSelectedCollectorId(e.target.value)}
            disabled={loading}
          >
            {collectors.map(c => (
              <option key={c.userId} value={c.userId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleModalClose}
            className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-300'
            }`}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className={`px-4 py-2 bg-red-600 text-white rounded-lg transition-colors font-medium ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successMessage}
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        show={showConfirm}
        message="Are you sure you want to change the assigned collector?"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
      />
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
