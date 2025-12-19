import { CharacterReference } from './loan';

export interface Application {
  applicationId: string;
  loanType: string;
  status: string;
  interviewDate?: string;
  interviewTime?: string;
  documents?: { fileName: string; filePath: string; mimeType: string }[];
  appName?: string;
  appDob?: string;
  appContact?: string;
  appEmail?: string;
  appMarital?: string;
  appSpouseName?: string;
  appSpouseOccupation?: string;
  appChildren?: number;
  appAddress?: string;
  sourceOfIncome?: string;
  appTypeBusiness?: string;
  appBusinessName?: string;
  appDateStarted?: string;
  appBusinessLoc?: string;
  appMonthlyIncome?: number;
  appEmploymentStatus?: string;
  appOccupation?: string;
  appCompanyName?: string;
  monthlyIncome?: number;
  lengthOfService?: string;
  otherIncome?: number;
  appLoanPurpose?: string;
  appLoanAmount?: number;
  appLoanTerms?: string;
  appInterestRate?: number;
  appTotalInterestAmount?: number;
  appTotalPayable?: number;
  appMonthlyDue?: number;
  collateralDescription?: string;
  collateralValue?: number;
  collateralType?: string;
  ownershipStatys?: string;
  unsecuredReason?: string;
  openTermConditions?: string;
  paymentSchedule?: string;
  appReferences?: CharacterReference[];
  profilePic?: string;
  isReloan?: boolean; 
  dateApplied: string;
  dateDisbursed: string;
  appNetReleased: number;
  appServiceFee: number;
  denialReason: string;
  hasServiceFee: string;
}

export interface ApplicationCardProps {
    application: any;
    formatCurrency: (amount?: string | number) => string;
}

export interface InterviewEvent {
  title: string;
  start: Date;
  end: Date;
  applicationId: string;
}

export interface Reference {
  name: string;
  contact: string;
  relation: string;
}

export interface HandleSubmitParams {
  appName: string;
  appDob: string;
  appContact: string;
  appEmail: string;
  appMarital: string;
  appSpouseName?: string;
  appSpouseOccupation?: string;
  appAddress: string;
  appLoanPurpose: string;
  selectedLoan?: any;
  sourceOfIncome: string;
  appTypeBusiness?: string;
  appBusinessName?: string;
  appDateStarted?: string;
  appBusinessLoc?: string;
  appOccupation?: string;
  appEmploymentStatus?: string;
  appCompanyName?: string;
  appMonthlyIncome?: number;
  requiresCollateral: boolean;
  collateralType?: string;
  collateralValue?: number;
  collateralDescription?: string;
  ownershipStatus?: string;
  appAgent: string;
  appReferences: Reference[];
  uploadedFiles: File[];
  photo2x2: File[];
  language: 'en' | 'ceb';
  setMissingFields: (fields: string[]) => void;
  setShowErrorModal: (open: boolean) => void;
  setAgentMissingError: (value: boolean) => void;
  setShowTermsModal: (open: boolean) => void;
  setErrorMessage: (msg: string) => void;
}