import navbarTranslation from "../translation/navbarTranslation";
import sysadTranslation from "../translation/sysadTranslation";
import { LandingNavItem } from "../utils/Types/navbar";

export const getHeadNavItems = (language: 'en' | 'ceb') => {
  const t = navbarTranslation[language];
  return [
    { name: t.tab13, href: '/commonComponents/borrower' },
    { name: t.tab1, href: '/commonComponents/loan' },
    { name: t.tab2, href: '/commonComponents/loanApplication' },
    { name: t.tab5, href: '/userPage/headPage/userPage' },
    { name: t.tab4, href: '/commonComponents/agent' },
    { name: t.tab14, href: '/userPage/headPage/endorsements' },
  ];
};

export const getManagerNavItems = (language: 'en' | 'ceb') => {
  const t = navbarTranslation[language];
  return [
    { name: t.tab13, href: '/commonComponents/borrower' },
    { name: t.tab1, href: '/commonComponents/loan' },
    { name: t.tab2, href: '/commonComponents/loanApplication' },
    { name: t.tab4, href: '/commonComponents/agent' },
    { name: t.tab14, href: '/commonComponents/endorsement/closure' },
  ];
};

export const getLoanOfficerNavItems = (language: 'en' | 'ceb') => {
  const t = navbarTranslation[language];
  return [
    { name: t.tab1, href: '/commonComponents/loan' },
    { name: t.tab2, href: '/commonComponents/loanApplication' },
    { name: t.tab4, href: '/commonComponents/agent' },
    { name: t.tab14, href: '/commonComponents/endorsement/penalty' },
  ];
};

export function getBorrowerNavItems(language: 'en' | 'ceb') {
  const t = navbarTranslation[language];
  return [
    { name: t.tab11, href: '/userPage/borrowerPage/loanHistory' },
  ];
}

export function getSysadNavItems(language: 'en' | 'ceb') {
  const s = sysadTranslation[language];
  return [
    { name: s.t2, href: '/userPage/sysadPage/logs'},
    { name: s.t3, href: '/userPage/sysadPage/userManagement'},
  ];
}

export function getCollectorNavItems(language: 'en' | 'ceb') {
  const t = navbarTranslation[language];
  return [
    { name: t.tab1, href: '/userPage/collectorPage/loans'},
    { name: t.tab15, href: '/userPage/collectorPage/paymongoPayments'},
  ];
}

export const getLandingNavItems = (
  language: 'en' | 'ceb',
  smoothScrollTo: (id: string) => void,
  setIsCalculationOpen: (open: boolean) => void
): LandingNavItem[] => {
  const t = navbarTranslation[language]; 
  return [
    { name: t.tab6, href: '#', onClick: () => setIsCalculationOpen(true) },
    { name: t.tab7, href: '#team', onClick: () => smoothScrollTo('team') },
    { name: t.tab8, href: '#about', onClick: () => smoothScrollTo('about') },
    { name: t.tab9, href: '#footer', onClick: () => smoothScrollTo('footer') },
  ];
};
