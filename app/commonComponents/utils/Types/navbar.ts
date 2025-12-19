import { Dispatch, SetStateAction } from 'react';

export interface NavItem {
    name: string;
    href: string;
}

export interface LandingNavItem {
  name: string;
  href: string;
  onClick?: () => void;
}

export interface MobileMenuUser {
  name: string;
  email: string;
  role: string;
  profilePic?: string;
}

export interface MobileMenuProps {
  navItems: NavItem[];
  language: 'en' | 'ceb';
  setLanguage: Dispatch<SetStateAction<'en' | 'ceb'>>;
  user?: MobileMenuUser;
  onOpenProfileSettings?: () => void;
  onLogout?: () => void;
  setIsCalculationOpen?: (open: boolean) => void;
}

export interface NavbarProps {
  role: 'manager' | 'loanOfficer' | 'head' | 'collector' | 'borrower' | 'sysad';
  isBlurred?: boolean;
  setIsCalculationOpen?: (open: boolean) => void;
}
