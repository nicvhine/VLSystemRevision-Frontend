import React from "react";

// File Handlers
export const handleProfileChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setPhoto2x2: React.Dispatch<React.SetStateAction<File[]>>,
  language: "en" | "ceb" = "en",
  setDocumentUploadError?: (msg: string) => void,
  setShowDocumentUploadErrorModal?: (open: boolean) => void
) => {
  const files = e.target.files ? Array.from(e.target.files) : [];
  if (!files.length) return;

  const file = files[0];
  const allowed = ["image/jpeg", "image/png"];

  if (!allowed.includes(file.type)) {
    setDocumentUploadError?.(
      language === "en"
        ? "Only JPG and PNG are allowed for 2x2 photo."
        : "JPG ug PNG lang ang madawat para sa 2x2 nga litrato."
    );
    setShowDocumentUploadErrorModal?.(true);
    e.target.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setDocumentUploadError?.(
      language === "en"
        ? "2x2 photo must be less than 2MB."
        : "Ang 2x2 nga litrato kinahanglan dili molapas og 2MB."
    );
    setShowDocumentUploadErrorModal?.(true);
    e.target.value = "";
    return;
  }

  try {
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("image-load-error"));
      };
      img.src = objectUrl;
    });

    if (dims.width !== dims.height) {
      setDocumentUploadError?.(
        language === "en"
          ? "2x2 photo must be square (equal width and height)."
          : "Ang 2x2 nga litrato kinahanglan square (parehas ang gilapdon ug gitas-on)."
      );
      setShowDocumentUploadErrorModal?.(true);
      e.target.value = "";
      return;
    }
  } catch {
    setDocumentUploadError?.(
      language === "en"
        ? "Failed to read image. Please try again."
        : "Napakyas sa pagbasa sa litrato. Palihug sulayi pag-usab."
    );
    setShowDocumentUploadErrorModal?.(true);
    e.target.value = "";
    return;
  }

  setPhoto2x2([file]);
};

export const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  uploadedFiles: File[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>,
  requiredDocumentsCount: number,
  language: "en" | "ceb" = "en",
  setDocumentUploadError?: (msg: string) => void,
  setShowDocumentUploadErrorModal?: (open: boolean) => void
) => {
  const input = e.target;
  if (!input.files) return;
  const files = Array.from(input.files);
  if (!files.length) return;

  // Check for PDF files and reject them
  const hasPDF = files.some(file => file.type === 'application/pdf');
  if (hasPDF) {
    setDocumentUploadError?.(
      language === "en"
        ? "PDF files are not allowed. Only PNG and JPG files are accepted."
        : "Dili pwede ang PDF. PNG ug JPG ra ang madawat."
    );
    setShowDocumentUploadErrorModal?.(true);
    input.value = "";
    return;
  }

  // Check for non-image files
  const hasNonImage = files.some(file => !file.type.startsWith('image/'));
  if (hasNonImage) {
    setDocumentUploadError?.(
      language === "en"
        ? "Only PNG and JPG image files are accepted."
        : "PNG ug JPG nga litrato ra ang madawat."
    );
    setShowDocumentUploadErrorModal?.(true);
    input.value = "";
    return;
  }

  setUploadedFiles(prev => {
    const remaining = requiredDocumentsCount - prev.length;

    if (remaining <= 0) {
      setDocumentUploadError?.(
        language === "en"
          ? `You can only upload up to ${requiredDocumentsCount} documents for this loan type.`
          : `Hangtod ${requiredDocumentsCount} ka dokumento lang ang pwede i-upload para ani nga klase sa loan.`
      );
      setShowDocumentUploadErrorModal?.(true);
      input.value = "";
      return prev;
    }

    const toAdd = files.slice(0, remaining);

    if (files.length > remaining) {
      setDocumentUploadError?.(
        language === "en"
          ? `Only ${remaining} more ${remaining === 1 ? "document is" : "documents are"} allowed (max ${requiredDocumentsCount}). Extra files were not added.`
          : `${remaining} na lang ka ${remaining === 1 ? "dokumento" : "mga dokumento"} ang pwede (max ${requiredDocumentsCount}). Ang sobra wala gi-dugang.`
      );
      setShowDocumentUploadErrorModal?.(true);
    }

    input.value = "";
    return [...prev, ...toAdd];
  });
};

export const removeProfile = (setPhoto2x2: React.Dispatch<React.SetStateAction<File[]>>) => {
  setPhoto2x2([]);
};

export const removeDocument = (
  index: number,
  uploadedFiles: File[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>
) => {
  setUploadedFiles(prev => prev.filter((_, i) => i !== index));
};
