import { useEffect, useRef } from "react";

interface Progress {
  done: Record<string, boolean>;
  missingCounts: Record<string, number>;
  missingDetails: Record<string, string[]>;
}

interface UseSectionProgressParams {
  missingFields: string[];
  photo2x2: File[];
  requires2x2: boolean;
  appAgent: string;
  uploadedFiles: File[];
  requiredDocumentsCount: number;
  onProgressUpdate?: (progress: Progress) => void;
}

export function useSectionProgress({
  missingFields,
  photo2x2,
  requires2x2,
  appAgent,
  uploadedFiles,
  requiredDocumentsCount,
  onProgressUpdate,
}: UseSectionProgressParams) {
  const prevProgressRef = useRef<Progress | undefined>(undefined);

  useEffect(() => {
    const done: Record<string, boolean> = {};
    const missingCounts: Record<string, number> = {};
    const missingDetails: Record<string, string[]> = {};

    const basicKeys = [
      "Name", "Date of Birth", "Contact Number", "Email Address",
      "Marital Status", "Spouse Name", "Spouse Occupation", "Home Address"
    ];
    const basicMissing = missingFields.filter(f => basicKeys.includes(f));
    missingCounts["basicInfo"] = basicMissing.length;
    missingDetails["basicInfo"] = basicMissing;
    done["basicInfo"] = missingCounts["basicInfo"] === 0;

    const incomeKeys = [
      "Source of Income","Type of Business","Business Name","Date Started",
      "Business Location","Occupation","Employment Status","Company Name","Monthly Income"
    ];
    const incomeMissing = missingFields.filter(f => incomeKeys.includes(f));
    missingCounts["income"] = incomeMissing.length;
    missingDetails["income"] = incomeMissing;
    done["income"] = missingCounts["income"] === 0;

    const collateralKeys = ["Collateral Type","Collateral Value","Collateral Description","Ownership Status"];
    const collateralMissing = missingFields.filter(f => collateralKeys.includes(f));
    missingCounts["collateral"] = collateralMissing.length;
    missingDetails["collateral"] = collateralMissing;
    done["collateral"] = missingCounts["collateral"] === 0;

    const referencesMissing = missingFields.filter(f => /^Reference \d+/.test(f));
    missingCounts["references"] = referencesMissing.length;
    missingDetails["references"] = referencesMissing;
    done["references"] = missingCounts["references"] === 0;

    const photoMissing = requires2x2 && photo2x2.length === 0 ? ["2x2 Photo"] : [];
    missingCounts["photo2x2"] = photoMissing.length;
    missingDetails["photo2x2"] = photoMissing;
    done["photo2x2"] = missingCounts["photo2x2"] === 0;

    const docMissing = uploadedFiles.length !== requiredDocumentsCount ? ["Document Upload"] : [];
    missingCounts["documents"] = docMissing.length;
    missingDetails["documents"] = docMissing;
    done["documents"] = missingCounts["documents"] === 0;

    const agentMissing = !appAgent.trim() ? ["Agent"] : [];
    missingCounts["agent"] = agentMissing.length;
    missingDetails["agent"] = agentMissing;
    done["agent"] = missingCounts["agent"] === 0;

    const loanKeys = ["Loan Purpose", "Loan Amount"];
    const loanMissing = missingFields.filter(f => loanKeys.includes(f));
    missingCounts["loanDetails"] = loanMissing.length;
    missingDetails["loanDetails"] = loanMissing;
    done["loanDetails"] = missingCounts["loanDetails"] === 0;

    const currentProgress: Progress = { done, missingCounts, missingDetails };

    // Only call update if something changed
    if (onProgressUpdate && JSON.stringify(prevProgressRef.current) !== JSON.stringify(currentProgress)) {
      prevProgressRef.current = currentProgress;
      onProgressUpdate(currentProgress);
    }
  }, [missingFields, photo2x2, requires2x2, appAgent, uploadedFiles, requiredDocumentsCount, onProgressUpdate]);
}
