"use client";

import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";

interface Agent {
  agentId: string;
  name: string;
  phoneNumber: string;
}

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; phoneNumber: string }) => Promise<void>;
  agent: Agent | null;
  loading: boolean;
}

const AgentModal: React.FC<AgentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  agent,
  loading,
}) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (agent) {
      setName(agent.name || "");
      setPhoneNumber(agent.phoneNumber || "");
    }
  }, [agent]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleModalClose = () => {
    if (loading) return;
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 150);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleModalClose();
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      alert("All fields are required.");
      return;
    }

    if (!name.includes(" ")) {
      alert("Please enter the full name.");
      return;
    }

    await onSave({ name, phoneNumber });
  };

  if (!isVisible) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative text-black transform transition-all duration-300 ease-out ${
          isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed hover:text-gray-500' : ''
          }`}
          onClick={handleModalClose}
          disabled={loading}
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Agent</h2>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Dela Cruz"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="09123456789"
              disabled={loading}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className={`px-4 py-2 rounded-lg border border-gray-300 text-gray-700 transition-colors font-medium ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
            onClick={handleModalClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className={`px-4 py-2 rounded-lg bg-red-600 text-white transition-colors font-medium ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default AgentModal;
