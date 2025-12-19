import { useMemo } from 'react';

type Section = { key: string; label: string };

export function useTrackerSections(loanType: string | null, language: 'en' | 'ceb'): Section[] {
  return useMemo(() => {
    if (!loanType) return [];

    const loanTypeParam =
      loanType === 'Regular Loan With Collateral'
        ? 'with'
        : loanType === 'Regular Loan Without Collateral'
        ? 'without'
        : 'open-term';

    const requires2x2 = true;

    const localizedLabel = (en: string, ph: string) => (language === 'en' ? en : ph);

    const baseSections: Section[] = [
      { key: 'basicInfo', label: localizedLabel('Basic Information', 'Pangunang Impormasyon') },
      { key: 'income', label: localizedLabel('Source of Income', 'Tinubdan sa Kita') },
      { key: 'references', label: localizedLabel('References', 'Mga Referensya') },
      { key: 'agent', label: localizedLabel('Agent', 'Ahente') },
    ];

    const collateralSection: Section = {
      key: 'collateral',
      label: localizedLabel('Collateral Information', 'Impormasyon sa Kolateral'),
    };

    const loanDetailsSection: Section = {
      key: 'loanDetails',
      label: localizedLabel('Loan Details', 'Detalye sa Pahulam'),
    };

    const photo2x2Section: Section | null = requires2x2
      ? { key: 'photo2x2', label: localizedLabel('2x2 Photo', '2x2') }
      : null;

    const documentsSection: Section = {
      key: 'documents',
      label: localizedLabel('Supporting Documents', 'Mga Dokumento'),
    };

    const sectionsForWith: Section[] = [
      ...baseSections,
      collateralSection,
      loanDetailsSection,
      ...(photo2x2Section ? [photo2x2Section] : []),
      documentsSection,
    ];

    const sectionsForWithout: Section[] = [
      ...baseSections,
      loanDetailsSection,
      ...(photo2x2Section ? [photo2x2Section] : []),
      documentsSection,
    ];

    if (loanTypeParam === 'with') return sectionsForWith;
    if (loanTypeParam === 'without') return sectionsForWithout;

    // copy 'with' tracker to 'open-term'
    return sectionsForWith;
  }, [language, loanType]);
}