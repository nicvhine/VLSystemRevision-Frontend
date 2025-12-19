import React, { useEffect, useState } from 'react';
import { ErrorModalProps } from '../utils/Types/modal';

/**
 * Error modal component with fade animations and auto-close functionality
 * Displays error messages with red styling and error icon
 * @param isOpen - Boolean to control modal visibility
 * @param message - Error message to display
 * @param onClose - Callback function to close the modal
 * @returns JSX element containing the error modal
 */
const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, message, onClose }) => {
  // Modal state management
  const [visible, setVisible] = useState(false);
  const [animation, setAnimation] = useState<'fade-in' | 'fade-out' | ''>('');

  // Handle modal visibility and animation transitions
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAnimation('fade-in');
    } else if (visible) {
      setAnimation('fade-out');
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, visible]);

  // Auto-close modal after 5 seconds when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!visible) return null;

  // Use React portal to render modal at document.body
  return typeof window !== 'undefined' && window.document
    ? require('react-dom').createPortal(
        <>
          <div
            className={`fixed bottom-6 right-6 z-[9999] pointer-events-none min-w-[220px] max-w-xs transition-none ${animation === 'fade-in' ? 'error-fade-in' : ''} ${animation === 'fade-out' ? 'error-fade-out' : ''}`}
          >
            <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 relative">
              <span className="flex-1 text-sm">{message}</span>
              <button
                className="text-red-500 hover:text-red-700 text-lg font-bold px-2 pointer-events-auto"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
          <style>{`
            @keyframes errorFadeIn {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes errorFadeOut {
              from { opacity: 1; transform: translateY(0); }
              to { opacity: 0; transform: translateY(16px); }
            }
            .error-fade-in {
              animation: errorFadeIn 0.3s cubic-bezier(.4,0,.2,1) forwards;
            }
            .error-fade-out {
              animation: errorFadeOut 0.3s cubic-bezier(.4,0,.2,1) forwards;
            }
          `}</style>
        </>,
        window.document.body
      )
    : null;
};

export default ErrorModal;
