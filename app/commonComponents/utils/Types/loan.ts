export interface Loan {
  status: string;
  loanId: string;
  type?: string;
  dateDisbursed?: string;
  appTotalPayable?: number;
  borrowersId: string;
  paymentProgress?: number;
  appLoanAmount: number;
  appInterestRate: number;
  appInterestAmount: string;
  appTotalInterestAmount: string;
  appMonthlyDue: string;
  loanType: string;
  creditScore: number;
  balance: number;
  remainingBalance: number;
}

export interface CharacterReference {
    name: string;
    contact: string;
    relation?: string;
  }

export interface PreviousLoan {
    appLoanType: string;    
    appLoanAmount: number;    
    dateDisbursed: string;   
    status?: string;           
}
  
  
  export interface CurrentLoan {
    purpose: string;
    type: string;
    principal: number;
    termsInMonths: number;
    interestRate: number;
    paymentSchedule: string;
    startDate: string;
    paidAmount: number;
    remainingBalance: number;
    totalPayable: number;
    dateDisbursed: string;
    status?: string;
  }
  
  export interface ProfilePic {
    fileName: string;
    filePath: string;
    mimeType: string;
  }
  
  export interface LoanDetails {
    loanId: string;
    name: string;
    loanType: string;
    borrowersId: string;
    appDob?: string;
    appMarital?: string;
    appSpouseName?: string;
    appSpouseOccupation?: string;
    appChildren?: number;
    contactNumber?: string;
    emailAddress?: string;
    address?: string;
    sourceOfIncome?: string;
    appEmploymentStatus?: string;
    appOccupation?: string;
    businessType: string;
    dateStarted: string;
    businessLocation: string;
    appTotalPayable: string;
    appLoanAmount: string;
    dateDisbursed: string;
    appLoanType: string;
    appMonthlyIncome?: number;
    creditScore?: number;
    status?: string;
    totalLoans?: number;
    references?: CharacterReference[];
    currentLoan?: CurrentLoan;
    profilePic?: ProfilePic;
    previousLoans?: PreviousLoan[];
    collateralType: string;
    collateralValue: string;
    collateralDescription: string;
    ownershipStatus: string;
    balance?: number; 
    appInterestRate: number;
    appLoanTerms: number;
  }
  