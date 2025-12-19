import { IconType } from "react-icons";

export interface LoanTypeStat {
  loanType: string;
  count: number;
}

export interface LoanStats {
  typeStats: LoanTypeStat[];
  totalPrincipal: number;
  totalInterest: number;
}

export interface CollectionStats {
  totalCollectables: number;
  totalCollected: number;
  totalUnpaid: number;
}

export interface TypeStats {
  withCollateral: number;
  withoutCollateral: number;
  openTerm: number;
}

export interface ApplicationStats {
  applied: number;
  approved: number;
  denied: number;
}

export interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: IconType;
  isAmount?: boolean;
  large?: boolean;
  className?: string;
  compact?: boolean;
}

export interface TopBorrower {
  borrowersId: string;
  name: string;
  totalBorrowedAmount: number;
}

export interface TopCollector {
  collectorId: string;
  name: string;
  totalCollectedAmount: number; 
  totalCollectables: number;
}

export interface TopAgent {
  agentId: string;
  name: string;
  totalProcessedLoans: number;
}