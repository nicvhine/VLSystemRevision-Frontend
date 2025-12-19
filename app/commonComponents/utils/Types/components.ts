import { Dispatch, SetStateAction, RefObject } from 'react';
import { Application } from './application';
import { LoanDetails, Loan} from './loan';

export interface BasicInfoCardProps {
  application?: Application;
  l?: any;
}

export interface ApplicationDetailsTabsProps {
  application?: Application;
  l?: any;
  t?: any;
}

export interface LoanComputationCardProps {
  application?: Application;
  t?: any;
  l?: any;
}

export interface ProfileCardProps {
  application?: Application;
}

export interface ApplicationButtonsProps {
  application: Application;
  role: string | null;
  setApplications: Dispatch<SetStateAction<Application[]>>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  API_URL: string;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  modalRef: RefObject<any>;
  setIsAgreementOpen: Dispatch<SetStateAction<'loan' | 'release' | null>>;
  a: any;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export interface SetScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any;
    setApplications: Dispatch<SetStateAction<any[]>>;
    authFetch: (url: string, options?: RequestInit) => Promise<any>;
    showError: (msg: string) => void;
    showSuccess: (msg: string) => void;
  a: any;
}

export interface DetailRowProps {
  label: string;
  value: string | number;
}

// Generic props for components that need a LoanDetails object
export interface Props {
  client: LoanDetails;
}

// Simple overlay toast component
export interface SubmitOverlayToastProps {
  open: boolean;
  message?: string;
  variant?: 'info' | 'success' | 'error';
}

export interface LoanDetailsCardProps {
  activeLoan: Loan | null;
  language: 'en' | 'ceb'; 
}

export interface InterviewCalendarProps {
  onModalToggle?: (isOpen: boolean) => void;
}

export interface LoanOfficerProps {
  children?: React.ReactNode;
  isNavbarBlurred?: boolean;
}

export interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'ceb';
}

export interface BasicInformationProps {
  language: "en" | "ceb";
  borrowersId: string;
  appName: string;
  setAppName: (value: string) => void;
  appDob: string;
  setAppDob: (value: string) => void;
  appContact: string;
  setAppContact: (value: string) => void;
  appEmail: string;
  setAppEmail: (value: string) => void;
  appMarital: string;
  setAppMarital: (value: string) => void;
  appChildren: number;
  setAppChildren: (value: number) => void;
  appSpouseName: string;
  setAppSpouseName: (value: string) => void;
  appSpouseOccupation: string;
  setAppSpouseOccupation: (value: string) => void;
  appAddress: string;
  setAppAddress: (value: string) => void;
  appReferences?: { name: string; contact: string; relation: string }[];
  missingFields?: string[];
  showFieldErrors?: boolean;
  isPrefilled?: boolean;
  resetForm?: () => void;
  
}

export interface CollateralProps {
  language: "en" | "ceb";
  collateralType: string;
  setCollateralType: (value: string) => void;
  collateralValue: number;
  setCollateralValue: (value: number) => void;
  collateralDescription: string;
  setCollateralDescription: (value: string) => void;
  ownershipStatus: string;
  setOwnershipStatus: (value: string) => void;
  collateralTypeOptions: { value: string; label: string }[];
  missingFields?: string[];
  showFieldErrors?: boolean;
}