"use client";

import { useEffect, Dispatch, SetStateAction } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

interface PrefillHookParams {
  borrowersId?: string;
  loanTypeParam: string;
  setAppName: (v: string) => void;
  setAppDob: (v: string) => void;
  setAppContact: (v: string) => void;
  setAppEmail: (v: string) => void;
  setAppMarital: (v: string) => void;
  setAppChildren: (v: number) => void;
  setAppSpouseName: (v: string) => void;
  setAppSpouseOccupation: (v: string) => void;
  setAppAddress: (v: string) => void;
  setSourceOfIncome: (v: string) => void;
  setAppTypeBusiness: (v: string) => void;
  setAppBusinessName: (v: string) => void;
  setAppDateStarted: (v: string) => void;
  setAppBusinessLoc: (v: string) => void;
  setAppMonthlyIncome: (v: number) => void;
  setAppOccupation: (v: string) => void;
  setAppEmploymentStatus: (v: string) => void;
  setAppCompanyName: (v: string) => void;
  setAppReferences: (v: any) => void;
  setAppAgent: (v: any) => void;
  setCollateralType: (v: string) => void;
  setCollateralValue: (v: number) => void;
  setCollateralDescription: (v: string) => void;
  setOwnershipStatus: (v: string) => void;
  setPrevProfilePicUrl: (v: string | null) => void;
  setPrevDocumentsMeta: Dispatch<SetStateAction<any[]>>;
  // Current previous documents metadata (for use actions)
  prevDocumentsMeta?: any[];
  setIsPrefilled: (v: boolean) => void;
  setDocumentUploadError: (v: string) => void;
  setShowDocumentUploadErrorModal: (v: boolean) => void;
  setPhoto2x2: (v: File[]) => void;
  setUploadedFiles: (fn: (prev: File[]) => File[]) => void;
}

export function usePrefillAndUploads(params: PrefillHookParams) {
  const {
    borrowersId,
    loanTypeParam,
    setAppName,
    setAppDob,
    setAppContact,
    setAppEmail,
    setAppMarital,
    setAppChildren,
    setAppSpouseName,
    setAppSpouseOccupation,
    setAppAddress,
    setSourceOfIncome,
    setAppTypeBusiness,
    setAppBusinessName,
    setAppDateStarted,
    setAppBusinessLoc,
    setAppMonthlyIncome,
    setAppOccupation,
    setAppEmploymentStatus,
    setAppCompanyName,
    setAppReferences,
    setAppAgent,
    setCollateralType,
    setCollateralValue,
    setCollateralDescription,
    setOwnershipStatus,
    setPrevProfilePicUrl,
  setPrevDocumentsMeta,
  prevDocumentsMeta,
    setIsPrefilled,
    setDocumentUploadError,
    setShowDocumentUploadErrorModal,
    setPhoto2x2,
    setUploadedFiles
  } = params;

  useEffect(() => {
    async function fetchAndPrefill() {
      if (!borrowersId) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/borrowers/${borrowersId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch borrower:", res.status);
          return;
        }

        const data = await res.json();
        const latest = data?.latestApplication;
        if (!latest) {
          setIsPrefilled(false);
          return;
        }

        // map backend → form
        setAppName(latest.appName || "");
        setAppDob(latest.appDob || "");
        setAppContact(latest.appContact || "");
        setAppEmail(latest.appEmail || "");
        setAppMarital(latest.appMarital || "");
        setAppChildren(latest.appChildren || 0);
        setAppSpouseName(latest.appSpouseName || "");
        setAppSpouseOccupation(latest.appSpouseOccupation || "");
        setAppAddress(latest.appAddress || "");

        setSourceOfIncome(latest.sourceOfIncome || "");
        setAppTypeBusiness(latest.appTypeBusiness || "");
        setAppBusinessName(latest.appBusinessName || "");
        setAppDateStarted(latest.appDateStarted || "");
        setAppBusinessLoc(latest.appBusinessLoc || "");
        setAppMonthlyIncome(latest.appMonthlyIncome || 0);
        setAppOccupation(latest.appOccupation || "");
        setAppEmploymentStatus(latest.appEmploymentStatus || "");
        setAppCompanyName(latest.appCompanyName || "");

        setAppReferences(
          latest.appReferences || [
            { name: "", contact: "", relation: "" },
            { name: "", contact: "", relation: "" },
            { name: "", contact: "", relation: "" },
          ]
        );

        const resolvedAgent =
          latest.appAgent && typeof latest.appAgent === "object"
            ? latest.appAgent.agentId ?? ""
            : typeof latest.appAgent === "string"
            ? latest.appAgent
            : "";
        setAppAgent(resolvedAgent);

        setCollateralType(latest.collateralType || "");
        setCollateralValue(latest.collateralValue || 0);
        setCollateralDescription(latest.collateralDescription || "");
        setOwnershipStatus(latest.ownershipStatus || "");

        // handle profile pic
        let resolvedUrl: string | null = null;
        if (latest.profilePic) {
          if (typeof latest.profilePic === "string") resolvedUrl = latest.profilePic;
          else if (typeof latest.profilePic === "object") {
            const filePath = latest.profilePic.filePath;
            if (typeof filePath === "string") resolvedUrl = filePath;
            else if (filePath?.url) resolvedUrl = filePath.url;
            else if (latest.profilePic.secure_url) resolvedUrl = latest.profilePic.secure_url;
          }
        }

        setPrevProfilePicUrl(resolvedUrl);
        setPrevDocumentsMeta(Array.isArray(latest.documents) ? latest.documents : []);
        setIsPrefilled(true);
      } catch (err) {
        console.error("Error fetching prefill:", err);
      }
    }

    if (loanTypeParam) fetchAndPrefill();
  }, [loanTypeParam, borrowersId]);

  async function fetchImageAsFileWithValidation(url: string, opts?: { maxBytes?: number }) {
    const { maxBytes = 2 * 1024 * 1024 } = opts || {};
    try {
      const resp = await fetch(url, { mode: "cors" });
      if (!resp.ok) throw new Error("Failed to fetch image");
      const blob = await resp.blob();
      if (blob.size > maxBytes) throw new Error("Image too large");
      if (!blob.type.startsWith("image/")) throw new Error("Not an image");

      const filename = url.split("/").pop() || "photo2x2.jpg";
      return { ok: true as const, file: new File([blob], filename, { type: blob.type }) };
    } catch (err: any) {
      return { ok: false as const, error: err.message || String(err) };
    }
  }

  async function handleUsePreviousProfile(prevProfilePicUrl: string | null) {
    if (!prevProfilePicUrl) return { ok: false, error: "No previous profile URL" };
    const res = await fetchImageAsFileWithValidation(prevProfilePicUrl);
    if (res.ok) {
      setPhoto2x2([res.file]);
      setPrevProfilePicUrl(null);
      return { ok: true };
    } else {
      setDocumentUploadError(res.error || "Failed to fetch previous 2x2");
      setShowDocumentUploadErrorModal(true);
      return res;
    }
  }

  async function handleUsePreviousDocument(index: number) {
    const list = Array.isArray(prevDocumentsMeta) ? prevDocumentsMeta : [];
    const doc = list[index];
    if (!doc || !doc.filePath) return { ok: false, error: "No previous document" };

    try {
      const resp = await fetch(doc.filePath, { mode: "cors" });
      if (!resp.ok) throw new Error("Failed to fetch document");
      const blob = await resp.blob();

      const name =
        doc.fileName ||
        decodeURIComponent(doc.filePath.split("/").pop() || "document.pdf");
      const type = doc.mimeType || blob.type || "application/octet-stream";

      const file = new File([blob], name, { type });
      setUploadedFiles((prev) => [...prev, file]);
      setPrevDocumentsMeta((prev) => prev.filter((_, i) => i !== index));
      return { ok: true };
    } catch (err: any) {
      setDocumentUploadError(err.message || "Failed to fetch document");
      setShowDocumentUploadErrorModal(true);
      return { ok: false, error: err.message || String(err) };
    }
  }

  return {
    handleUsePreviousProfile,
    handleUsePreviousDocument,
  };
}
