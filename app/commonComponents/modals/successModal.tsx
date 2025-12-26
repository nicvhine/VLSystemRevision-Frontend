import React, { useEffect, useState } from 'react';
import { SuccessModalProps } from '../utils/Types/modal';
import { createPortal } from 'react-dom';

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, message, onClose }) => {
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

  const content = (
    <>
      <div
        className={`fixed bottom-6 right-6 z-[70] pointer-events-none min-w-[220px] max-w-xs transition-none ${animation === 'fade-in' ? 'success-fade-in' : ''} ${animation === 'fade-out' ? 'success-fade-out' : ''}`}
      >
        <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 relative">
          <span className="flex-1 text-sm">{message}</span>
          <button
            className="text-green-500 hover:text-green-700 text-lg font-bold px-2 pointer-events-auto"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
      <style>{`
        @keyframes successFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes successFadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(16px); }
        }
        .success-fade-in {
          animation: successFadeIn 0.3s cubic-bezier(.4,0,.2,1) forwards;
        }
        .success-fade-out {
          animation: successFadeOut 0.3s cubic-bezier(.4,0,.2,1) forwards;
        }
      `}</style>
    </>
  );

  if (typeof window !== 'undefined' && window.document) {
    return createPortal(content, window.document.body);
  }

  return content;
};

export default SuccessModal;
