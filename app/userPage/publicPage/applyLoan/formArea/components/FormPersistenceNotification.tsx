import React, { useState, useEffect } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';
import ConfirmModal from '@/app/commonComponents/modals/confirmModal';

interface FormPersistenceNotificationProps {
  language: 'en' | 'ceb';
  onClearData: () => void;
  storageKey?: string;
}

export function FormPersistenceNotification({ 
  language, 
  onClearData,
  storageKey = 'loanApplicationFormData' 
}: FormPersistenceNotificationProps) {
  const [hasSavedData, setHasSavedData] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const checkForSavedData = () => {
    if (typeof window === 'undefined') return false;
    
    const savedData = localStorage.getItem(storageKey);
    if (!savedData) return false;
    
    try {
      const parsed = JSON.parse(savedData);
      // Check if there's meaningful data (not just empty strings)
      // More strict checking - only show if there's actual user input
      const hasData = Object.entries(parsed).some(([key, value]) => {
        // Skip loanType as it's selected, not typed
        if (key === 'loanType') return false;
        
        if (typeof value === 'string') {
          const trimmed = value.trim();
          // Must have at least some content
          return trimmed.length > 0;
        }
        if (typeof value === 'number') return value > 0;
        if (Array.isArray(value)) {
          // For references array, check if any reference has data
          return value.some(item => {
            if (typeof item === 'object' && item !== null) {
              return Object.values(item).some(v => 
                typeof v === 'string' && v.trim().length > 0
              );
            }
            return false;
          });
        }
        if (typeof value === 'object' && value !== null) {
          // Check if object has any meaningful data
          return Object.values(value).some(v => 
            (typeof v === 'string' && v.trim().length > 0) || 
            (typeof v === 'number' && v > 0)
          );
        }
        return false;
      });
      return hasData;
    } catch (error) {
      console.error('Error checking saved data:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check immediately on mount
    const hasData = checkForSavedData();
    setHasSavedData(hasData);
    
    // Also recheck after a short delay to catch any race conditions
    const timer = setTimeout(() => {
      const recheckData = checkForSavedData();
      setHasSavedData(recheckData);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [storageKey]);

  if (!hasSavedData || !showNotification) return null;

  const handleClear = () => {
    setShowConfirmModal(true);
  };

  const confirmClear = () => {
    onClearData();
    setHasSavedData(false);
    setShowNotification(false);
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <FiInfo className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-sm text-red-800">
            {language === 'en' 
              ? 'We found previously saved form data. Your inputs have been restored automatically.'
              : 'Nakit-an namo ang naunang natigom nga datos sa form. Ang imong mga input na-restore na automatically.'}
          </p>
          <button
            onClick={handleClear}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline font-medium"
          >
            {language === 'en' ? 'Clear saved data and start fresh' : 'I-clear ang natigom nga datos ug sugdi pag-usab'}
          </button>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="text-red-400 hover:text-red-600 flex-shrink-0"
          aria-label="Dismiss"
        >
          <FiX size={18} />
        </button>
      </div>

      <ConfirmModal
        show={showConfirmModal}
        title={language === 'en' ? 'Clear Form Data' : 'I-clear ang Datos sa Form'}
        message={
          language === 'en' 
            ? 'Are you sure you want to clear all saved form data? This action cannot be undone.'
            : 'Sigurado ka ba nga gusto nimong i-clear ang tanang natigom nga datos sa form? Dili na nimo kini mahimo pag-balik.'
        }
        confirmLabel={language === 'en' ? 'Clear Data' : 'I-clear'}
        cancelLabel={language === 'en' ? 'Cancel' : 'Kanselahon'}
        onConfirm={confirmClear}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
