import { useEffect, useCallback, useRef } from 'react';

interface FormData {
  // Basic Info
  appName: string;
  appDob: string;
  appContact: string;
  appEmail: string;
  appMarital: string;
  appChildren: number;
  appSpouseName: string;
  appSpouseOccupation: string;
  appAddress: string;
  
  // Source of Income
  sourceOfIncome: string;
  appTypeBusiness: string;
  appBusinessName: string;
  appDateStarted: string;
  appBusinessLoc: string;
  appMonthlyIncome: number;
  appOccupation: string;
  appEmploymentStatus: string;
  appCompanyName: string;
  
  // References
  appReferences: Array<{ name: string; contact: string; relation: string }>;
  
  // Agent
  appAgent: string;
  
  // Collateral
  collateralType: string;
  collateralValue: number;
  collateralDescription: string;
  ownershipStatus: string;
  
  // Loan
  selectedLoan: any | null;
  appLoanPurpose: string;
  customLoanAmount: number | "";
  
  // Loan Type
  loanType: string;
}

interface UseFormPersistenceProps {
  formData: FormData;
  setters: {
    setAppName: (v: string) => void;
    setAppDob: (v: string) => void;
    setAppContact: (v: string) => void;
    setAppEmail: (v: string) => void;
    setAppMarital: (v: string) => void;
    setAppChildren: (v: number) => void;
    setAppSpouseName: (v: string) => void;
    setAppSpouseOccupation: (v: string) => void;
    setAppAddress: (v: string) => void;
    setSourceOfIncome: (v: string) => void;
    setAppTypeBusiness: (v: string) => void;
    setAppBusinessName: (v: string) => void;
    setAppDateStarted: (v: string) => void;
    setAppBusinessLoc: (v: string) => void;
    setAppMonthlyIncome: (v: number) => void;
    setAppOccupation: (v: string) => void;
    setAppEmploymentStatus: (v: string) => void;
    setAppCompanyName: (v: string) => void;
    setAppReferences: (v: Array<{ name: string; contact: string; relation: string }>) => void;
    setAppAgent: (v: string) => void;
    setCollateralType: (v: string) => void;
    setCollateralValue: (v: number) => void;
    setCollateralDescription: (v: string) => void;
    setOwnershipStatus: (v: string) => void;
    setSelectedLoan: (v: any) => void;
    setAppLoanPurpose: (v: string) => void;
    setCustomLoanAmount: (v: number | "") => void;
  };
  storageKey?: string;
  enabled?: boolean;
}

export function useFormPersistence({
  formData,
  setters,
  storageKey = 'loanApplicationFormData',
  enabled = true,
}: UseFormPersistenceProps) {
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load saved form data on mount
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      const savedData = localStorage.getItem(storageKey);
      console.log('🔍 Loading from localStorage:', storageKey);
      console.log('📦 Raw saved data:', savedData);
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('✅ Parsed data:', parsed);
        console.log('👶 appChildren:', parsed.appChildren);
        console.log('💰 appMonthlyIncome:', parsed.appMonthlyIncome);
        console.log('👥 appReferences:', parsed.appReferences);
        console.log('🏦 selectedLoan:', parsed.selectedLoan);
        console.log('💵 customLoanAmount:', parsed.customLoanAmount);
        
        // Check for corrupted data (NaN values) and clear if found
        if (
          (parsed.appChildren !== undefined && parsed.appChildren !== null && isNaN(Number(parsed.appChildren))) ||
          (parsed.appMonthlyIncome !== undefined && parsed.appMonthlyIncome !== null && isNaN(Number(parsed.appMonthlyIncome)))
        ) {
          console.warn('⚠️ Corrupted data detected (NaN values). Clearing localStorage.');
          localStorage.removeItem(storageKey);
          isInitialLoad.current = false;
          return;
        }
        
        // Restore all form fields
        if (parsed.appName) setters.setAppName(parsed.appName);
        if (parsed.appDob) setters.setAppDob(parsed.appDob);
        if (parsed.appContact) setters.setAppContact(parsed.appContact);
        if (parsed.appEmail) setters.setAppEmail(parsed.appEmail);
        if (parsed.appMarital) setters.setAppMarital(parsed.appMarital);
        if (parsed.appChildren !== undefined && parsed.appChildren !== null) {
          const childrenValue = Number(parsed.appChildren);
          console.log('✅ Restoring appChildren:', parsed.appChildren, '-> parsed as:', childrenValue, 'isNaN:', isNaN(childrenValue));
          // Only restore if it's a valid number
          if (!isNaN(childrenValue)) {
            setters.setAppChildren(childrenValue);
          }
        }
        if (parsed.appSpouseName) setters.setAppSpouseName(parsed.appSpouseName);
        if (parsed.appSpouseOccupation) setters.setAppSpouseOccupation(parsed.appSpouseOccupation);
        if (parsed.appAddress) setters.setAppAddress(parsed.appAddress);
        
        if (parsed.sourceOfIncome) setters.setSourceOfIncome(parsed.sourceOfIncome);
        if (parsed.appTypeBusiness) setters.setAppTypeBusiness(parsed.appTypeBusiness);
        if (parsed.appBusinessName) setters.setAppBusinessName(parsed.appBusinessName);
        if (parsed.appDateStarted) setters.setAppDateStarted(parsed.appDateStarted);
        if (parsed.appBusinessLoc) setters.setAppBusinessLoc(parsed.appBusinessLoc);
        if (parsed.appMonthlyIncome !== undefined && parsed.appMonthlyIncome !== null) {
          const incomeValue = Number(parsed.appMonthlyIncome);
          console.log('✅ Restoring appMonthlyIncome:', parsed.appMonthlyIncome, '-> parsed as:', incomeValue, 'isNaN:', isNaN(incomeValue));
          // Only restore if it's a valid number
          if (!isNaN(incomeValue)) {
            setters.setAppMonthlyIncome(incomeValue);
          }
        }
        if (parsed.appOccupation) setters.setAppOccupation(parsed.appOccupation);
        if (parsed.appEmploymentStatus) setters.setAppEmploymentStatus(parsed.appEmploymentStatus);
        if (parsed.appCompanyName) setters.setAppCompanyName(parsed.appCompanyName);
        
        // Always restore references array, even if empty
        if (parsed.appReferences && Array.isArray(parsed.appReferences) && parsed.appReferences.length > 0) {
          console.log('✅ Restoring appReferences:', parsed.appReferences);
          // Check if at least one reference has data
          const hasData = parsed.appReferences.some((ref: any) => ref.name || ref.contact || ref.relation);
          if (hasData) {
            setters.setAppReferences(parsed.appReferences);
          } else {
            console.log('⚠️ References array exists but all are empty, not restoring');
          }
        } else {
          console.log('❌ NOT restoring appReferences - check failed');
        }
        
        if (parsed.appAgent) setters.setAppAgent(parsed.appAgent);
        
        if (parsed.collateralType) setters.setCollateralType(parsed.collateralType);
        if (parsed.collateralValue !== undefined && parsed.collateralValue !== null) setters.setCollateralValue(Number(parsed.collateralValue));
        if (parsed.collateralDescription) setters.setCollateralDescription(parsed.collateralDescription);
        if (parsed.ownershipStatus) setters.setOwnershipStatus(parsed.ownershipStatus);
        
        // Always restore selectedLoan, even if it's an object
        if (parsed.selectedLoan) {
          console.log('✅ Restoring selectedLoan:', parsed.selectedLoan);
          setters.setSelectedLoan(parsed.selectedLoan);
        } else {
          console.log('❌ NOT restoring selectedLoan - check failed');
        }
        if (parsed.appLoanPurpose) setters.setAppLoanPurpose(parsed.appLoanPurpose);
        if (parsed.customLoanAmount !== undefined && parsed.customLoanAmount !== null && parsed.customLoanAmount !== "") {
          const loanAmount = Number(parsed.customLoanAmount);
          console.log('✅ Restoring customLoanAmount:', parsed.customLoanAmount, '-> parsed as:', loanAmount, 'isNaN:', isNaN(loanAmount));
          // Only restore if it's a valid number
          if (!isNaN(loanAmount)) {
            setters.setCustomLoanAmount(loanAmount);
          }
        }
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
    } finally {
      // Mark that initial load is complete
      isInitialLoad.current = false;
    }
  }, [enabled, storageKey]);

  // Save form data to localStorage whenever it changes (but skip the first render)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    // Skip saving during initial load to prevent overwriting loaded data
    if (isInitialLoad.current) {
      console.log('⏭️ Skipping save - initial load');
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation to ensure state has updated
    saveTimeoutRef.current = setTimeout(() => {
      try {
        console.log('💾 Saving to localStorage:', storageKey);
        console.log('📝 Data being saved:', formData);
        
        // Sanitize the data before saving - convert NaN to 0 for numeric fields
        const sanitizedData = {
          ...formData,
          appChildren: isNaN(formData.appChildren) ? 0 : formData.appChildren,
          appMonthlyIncome: isNaN(formData.appMonthlyIncome) ? 0 : formData.appMonthlyIncome,
          collateralValue: isNaN(formData.collateralValue) ? 0 : formData.collateralValue,
          customLoanAmount: (formData.customLoanAmount === "" || isNaN(Number(formData.customLoanAmount))) ? "" : formData.customLoanAmount,
        };
        
        console.log('🧹 Sanitized data:', sanitizedData);
        const dataToSave = JSON.stringify(sanitizedData);
        localStorage.setItem(storageKey, dataToSave);
        console.log('✅ Saved successfully');
      } catch (error) {
        console.error('Error saving form data to localStorage:', error);
      }
    }, 500); // 500ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, storageKey, enabled]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing form data from localStorage:', error);
    }
  }, [storageKey]);

  return { clearSavedData };
}
