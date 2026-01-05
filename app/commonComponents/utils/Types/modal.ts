import { Payment } from "./collection";

export interface BaseModalProps<T = any> {
  isOpen: boolean;
  isAnimating?: boolean;
  onClose?: () => void;
  // Support both selectedItem and selectedCollection aliases used in various modal components
  selectedItem?: T;
  selectedCollection?: T;
}

export interface ConfirmModalProps {
    show: boolean;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    applicationId?: string;
    status?: string;
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    processingLabel?: string;
}

export interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export interface ChangePasswordModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any | null;
  onAccept?: () => void;
}

export interface AreYouStillThereModalProps {
  countdown: number;
  onStay: () => void;
  onLogout: () => void;
}

export interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string | null;
  totalPayable?: number;
}

export interface ReleaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowerName: string;
  loanAmount: number;
  releaseDate: string;
}

export interface InterviewModalProps {
  show: boolean;
  onClose: () => void;
  applicationId: string;
  currentDate?: string;
  currentTime?: string;
  onSave: (date: string, time: string) => void;
  onView: (applicationId: string) => void;
  appliedDate?: string;
}

export interface PaymentHistoryModalProps {
  isOpen: boolean;
  animateIn: boolean;
  onClose: () => void;
  paidPayments: Payment[];
}

export interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export interface DecisionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean; 
  error?: string; 
}

export interface DenialReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, missingDocuments?: Record<string, boolean>, description?: string) => void;
  applicationId?: string;
  loading?: boolean;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  processingLabel?: string;
}