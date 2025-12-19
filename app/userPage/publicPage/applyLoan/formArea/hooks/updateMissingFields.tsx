import { useEffect } from "react";

interface UpdateMissingFieldsParams {
    appName: string;
    appDob: string;
    appContact: string;
    appEmail: string;
    appMarital: string;
    appSpouseName: string;
    appSpouseOccupation: string;
    appAddress: string;
    appLoanPurpose: string;
    selectedLoan: any;
    sourceOfIncome: string;
    appTypeBusiness: string;
    appBusinessName: string;
    appDateStarted: string;
    appBusinessLoc: string;
    appMonthlyIncome: number;
    appOccupation: string;
    appEmploymentStatus: string;
    appCompanyName: string;
    appReferences: { name: string; contact: string; relation: string }[];
    requiresCollateral: boolean;
    requires2x2?: boolean;
    collateralType: string;
    collateralValue: number;
    collateralDescription: string;
    ownershipStatus: string;
    appAgent: string;
    photo2x2: File[];
    uploadedFiles: File[];
    requiredDocumentsCount: number;
    missingFields: string[];
    setMissingFields: (fields: string[]) => void;
}

/**
 * Hook to automatically update the missing fields array based on current form values.
 */
export function useUpdateMissingFields(params: UpdateMissingFieldsParams) {
    const {
        appName,
        appDob,
        appContact,
        appEmail,
        appMarital,
        appSpouseName,
        appSpouseOccupation,
        appAddress,
        appLoanPurpose,
        selectedLoan,
        sourceOfIncome,
        appTypeBusiness,
        appBusinessName,
        appDateStarted,
        appBusinessLoc,
        appMonthlyIncome,
        appOccupation,
        appEmploymentStatus,
        appCompanyName,
        appReferences,
        collateralType,
        collateralValue,
        collateralDescription,
        ownershipStatus,
        appAgent,
        photo2x2,
    requiresCollateral,
    requires2x2,
        uploadedFiles,
        requiredDocumentsCount,
        missingFields,
        setMissingFields
    } = params;

    useEffect(() => {
        // Recompute the full list of missing fields from current form values.
        const next: string[] = [];

        // Basic Info
        if (!appName.trim()) next.push('Name');
        if (!appDob) next.push('Date of Birth');
        if (!appContact.trim()) next.push('Contact Number');
        if (!appEmail.trim()) next.push('Email Address');
        if (!appMarital) next.push('Marital Status');
        if (appMarital === 'Married') {
            if (!appSpouseName.trim()) next.push('Spouse Name');
            if (!appSpouseOccupation.trim()) next.push('Spouse Occupation');
        }
        if (!appAddress.trim()) next.push('Home Address');

        // Loan info
        if (!appLoanPurpose.trim()) next.push('Loan Purpose');
        if (!selectedLoan) next.push('Loan Amount');

        // Source of income
        if (!sourceOfIncome) next.push('Source of Income');
        if (sourceOfIncome === 'business') {
            if (!appTypeBusiness.trim()) next.push('Type of Business');
            if (!appBusinessName.trim()) next.push('Business Name');
            if (!appDateStarted) next.push('Date Started');
            if (!appBusinessLoc.trim()) next.push('Business Location');
            if (!appMonthlyIncome || appMonthlyIncome <= 0) next.push('Monthly Income');
        } else if (sourceOfIncome) {
            if (!appOccupation.trim()) next.push('Occupation');
            if (!appEmploymentStatus.trim()) next.push('Employment Status');
            if (!appCompanyName.trim()) next.push('Company Name');
            if (!appMonthlyIncome || appMonthlyIncome <= 0) next.push('Monthly Income');
        }

        // References
        appReferences.forEach((ref, i) => {
            if (!ref.name.trim()) next.push(`Reference ${i + 1} Name`);
            if (!ref.contact.trim()) next.push(`Reference ${i + 1} Contact`);
            if (!ref.relation.trim()) next.push(`Reference ${i + 1} Relationship`);
        });

        // Agent
        if (!appAgent.trim()) next.push('Agent');

        // Collateral
        if (requiresCollateral) {
            if (!collateralType) next.push('Collateral Type');
            if (!collateralValue || collateralValue <= 0) next.push('Collateral Value');
            if (!collateralDescription.trim()) next.push('Collateral Description');
            if (!ownershipStatus) next.push('Ownership Status');
        }

        // Uploads
        if (requires2x2) {
            if (photo2x2.length === 0) next.push('2x2 Photo');
        }
        if (uploadedFiles.length !== requiredDocumentsCount) next.push('Document Upload');

        // Only update if different to avoid extra renders
        // Update directly with new array (avoid passing a function — setter expects string[])
        const prev = missingFields;
        const same = prev.length === next.length && prev.every((v, i) => v === next[i]);
        if (!same) setMissingFields(next);
    }, [
        appName,
        appDob,
        appContact,
        appEmail,
        appMarital,
        appSpouseName,
        appSpouseOccupation,
        appAddress,
        appLoanPurpose,
        selectedLoan,
        sourceOfIncome,
        appTypeBusiness,
        appBusinessName,
        appDateStarted,
        appBusinessLoc,
        appMonthlyIncome,
        appOccupation,
        appEmploymentStatus,
        appCompanyName,
        appReferences,
    requiresCollateral,
    requires2x2,
        collateralType,
        collateralValue,
        collateralDescription,
        ownershipStatus,
        appAgent,
        photo2x2,
        uploadedFiles,
        setMissingFields
    ]);
}
